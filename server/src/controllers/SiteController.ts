import { Request, Response } from 'express';
import { SiteService } from '../services/SiteService';

/**
 * @swagger
 * tags:
 *   name: Sites
 *   description: Site management endpoints
 */
export class SiteController {
  private siteService = new SiteService();

  /**
   * @swagger
   * /api/sites:
   *   get:
   *     summary: Get all sites
   *     tags: [Sites]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of sites
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 sites:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Site'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getSites = async (req: Request, res: Response) => {
    try {
      const sites = await this.siteService.findAll();
      res.json({ sites });
    } catch (error) {
      console.error('Error fetching sites:', error);
      res.status(500).json({ error: 'Failed to fetch sites' });
    }
  }

  /**
   * @swagger
   * /api/sites/{id}:
   *   get:
   *     summary: Get site by ID
   *     tags: [Sites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Site ID
   *     responses:
   *       200:
   *         description: Site details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 site:
   *                   $ref: '#/components/schemas/Site'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Site not found
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /api/sites:
   *   post:
   *     summary: Create a new site
   *     tags: [Sites]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - site_name
   *               - site_id
   *             properties:
   *               site_name:
   *                 type: string
   *               site_id:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Site created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 site:
   *                   $ref: '#/components/schemas/Site'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /api/sites/{id}:
   *   put:
   *     summary: Update a site
   *     tags: [Sites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Site ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               site_name:
   *                 type: string
   *               site_id:
   *                 type: string
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Site updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 site:
   *                   $ref: '#/components/schemas/Site'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Site not found
   *       500:
   *         description: Server error
   */
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

  /**
   * @swagger
   * /api/sites/{id}:
   *   delete:
   *     summary: Delete a site
   *     tags: [Sites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Site ID
   *     responses:
   *       200:
   *         description: Site deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Site not found
   *       500:
   *         description: Server error
   */
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
