
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { SiteService } from "./SiteService";
import { LogService } from "./LogService";

export class TaskRunner {
  private siteService: SiteService;
  private logService: LogService;

  constructor() {
    this.siteService = new SiteService();
    this.logService = new LogService();
  }

  async runSite(siteId: string): Promise<void> {
    const site = await this.siteService.findBySiteId(siteId);
    if (!site) {
      throw new Error(`Site with ID ${siteId} not found`);
    }

    // Find the corresponding site script
    const scriptsBasePath = path.join(__dirname, "..", "site");
    let scriptPath = "";

    // Find the script based on site_id pattern
    if (siteId === process.env.I_RIK_VIP_ID) {
      scriptPath = path.join(scriptsBasePath, "i-rik-vip", "index.ts");
    } else if (siteId === process.env.PLAY_IWIN_BIO_ID) {
      scriptPath = path.join(scriptsBasePath, "play-iwin-bio", "index.ts");
    } else if (siteId === process.env.PLAY_B52_CC_ID) {
      scriptPath = path.join(scriptsBasePath, "play-b52-cc", "index.ts");
    }

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found for site ${site.site_name}`);
    }

    console.log(`Running script for site ${site.site_name} at ${scriptPath}`);

    // Execute the script with ts-node
    const child = spawn("npx", ["ts-node", scriptPath], {
      cwd: path.join(__dirname, "..", ".."),
      stdio: "pipe",
      env: process.env,
    });

    // Log output
    child.stdout.on("data", (data) => {
      console.log(`[${site.site_name}] ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[${site.site_name}] ERROR: ${data}`);
    });

    // Handle process exit
    child.on("close", (code) => {
      console.log(
        `Child process for ${site.site_name} exited with code ${code}`
      );
    });

    // Log the action
    await this.logService.create({
      action: "run",
      entity: "sites",
      entity_id: siteId,
      details: { site_name: site.site_name },
    });
  }

  async runAllSites(): Promise<void> {
    // Get all sites
    const sites = await this.siteService.findAll();

    // Run each site
    for (const site of sites) {
      try {
        await this.runSite(site.site_id);
      } catch (error) {
        console.error(`Error running site ${site.site_name}:`, error);
      }
    }
  }
}
