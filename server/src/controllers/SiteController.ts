
import { Request, Response } from 'express';
import { SiteService } from '../services/SiteService';

export class SiteController {
  private siteService = new SiteService();

  getSites = async (req: Request, res: Response) => {
    try {
      const sites = await this.siteService.findAll();
      res.json({ sites });
    } catch (error) {
      console.error('Error fetching sites:', error);
      res.status(500).json({ error: 'Failed to fetch sites' });
    }
  }

  getSiteById = async (req: Request, res: Response) => {
    try {
      const site = await this.siteService.findById(req.params.id);
      
      if (!site) {
        return res.status(404).json({ error: 'Site not found' });
      }
      
      res.json({ site });
    } catch (error) {
      console.error('Error fetching site:', error);
      res.status(500).json({ error: 'Failed to fetch site' });
    }
  }

  createSite = async (req: Request, res: Response) => {
    const { site_name, site_id, status } = req.body;
    
    try {
      const site = await this.siteService.create(
        { 
          site_name, 
          site_id, 
          status: status || 'active'
        },
        req.user?.id
      );
      
      res.status(201).json({ site });
    } catch (error) {
      console.error('Error creating site:', error);
      res.status(500).json({ error: 'Failed to create site' });
    }
  }

  updateSite = async (req: Request, res: Response) => {
    const { site_name, site_id, status } = req.body;
    
    try {
      const site = await this.siteService.update(
        req.params.id,
        {
          site_name,
          site_id,
          status
        },
        req.user?.id
      );
      
      res.json({ site });
    } catch (error: any) {
      console.error('Error updating site:', error);
      
      if (error.message === 'Site not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update site' });
    }
  }

  deleteSite = async (req: Request, res: Response) => {
    try {
      await this.siteService.delete(req.params.id, req.user?.id);
      res.json({ message: 'Site deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting site:', error);
      
      if (error.message === 'Site not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to delete site' });
    }
  }
}
