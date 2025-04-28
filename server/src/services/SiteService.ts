
import { getRepository } from '../database/connection';
import { Site } from '../entities/Site';
import { LogService } from './LogService';

export class SiteService {
  private siteRepository = getRepository<Site>(Site);
  private logService = new LogService();

  async findAll(): Promise<Site[]> {
    return this.siteRepository.find();
  }

  async findById(id: string): Promise<Site | null> {
    return this.siteRepository.findOne({ where: { id } });
  }

  async findBySiteId(siteId: string): Promise<Site | null> {
    return this.siteRepository.findOne({ where: { site_id: siteId } });
  }

  async create(siteData: Partial<Site>, loggedInUserId?: string): Promise<Site> {
    const site = this.siteRepository.create(siteData);
    
    const savedSite = await this.siteRepository.save(site);

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

    Object.assign(site, siteData);
    const updatedSite = await this.siteRepository.save(site);

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
