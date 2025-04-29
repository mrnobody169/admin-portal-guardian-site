
import { Repository } from '../database/connection';
import { Site } from '../entities/Site';
import { LogService } from './LogService';

export class SiteService {
  private siteRepository: Repository<Site>;
  private logService = new LogService();

  constructor() {
    this.siteRepository = new Repository<Site>('sites');
  }

  async findAll(): Promise<Site[]> {
    return this.siteRepository.findAll();
  }

  async findById(id: string): Promise<Site | null> {
    return this.siteRepository.findOne({ id });
  }

  async findBySiteId(siteId: string): Promise<Site | null> {
    return this.siteRepository.findOne({ site_id: siteId });
  }

  async create(siteData: Partial<Site>, loggedInUserId?: string): Promise<Site> {
    const savedSite = await this.siteRepository.create(siteData);

    // Log the action
    await this.logService.create({
      action: 'create',
      entity: 'sites',
      entity_id: savedSite.id,
      user_id: loggedInUserId,
      details: siteData
    });

    return savedSite;
  }

  async update(id: string, siteData: Partial<Site>, loggedInUserId?: string): Promise<Site> {
    const site = await this.findById(id);
    if (!site) {
      throw new Error('Site not found');
    }

    const updatedSite = await this.siteRepository.update(id, siteData);

    // Log the action
    await this.logService.create({
      action: 'update',
      entity: 'sites',
      entity_id: id,
      user_id: loggedInUserId,
      details: siteData
    });

    return updatedSite;
  }

  async delete(id: string, loggedInUserId?: string): Promise<void> {
    const site = await this.findById(id);
    if (!site) {
      throw new Error('Site not found');
    }

    await this.siteRepository.delete(id);

    // Log the action
    await this.logService.create({
      action: 'delete',
      entity: 'sites',
      entity_id: id,
      user_id: loggedInUserId,
      details: { deletedSite: site.site_id }
    });
  }
}
