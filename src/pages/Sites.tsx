
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Building, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Site {
  id: string;
  site_name: string;
  site_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Sites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<Partial<Site> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setIsLoading(true);
        const { sites } = await apiService.getSites();
        setSites(sites || []);
      } catch (error) {
        console.error('Failed to fetch sites:', error);
        toast({
          title: "Error",
          description: "Failed to load sites",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, []);

  const handleAddSite = () => {
    setCurrentSite({
      site_name: '',
      site_id: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditSite = (site: Site) => {
    setCurrentSite({ ...site });
    setIsDialogOpen(true);
  };

  const handleDeleteSite = (site: Site) => {
    setCurrentSite(site);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveSite = async () => {
    if (!currentSite || !currentSite.site_name || !currentSite.site_id) {
      toast({ 
        title: "Error", 
        description: "Site name and ID are required", 
        variant: "destructive" 
      });
      return;
    }

    try {
      if (currentSite.id) {
        // Update existing site
        const { site } = await apiService.updateSite(currentSite.id, {
          site_name: currentSite.site_name,
          site_id: currentSite.site_id,
          status: currentSite.status
        });
        
        if (site) {
          setSites(sites.map(s => s.id === site.id ? site : s));
          toast({ title: "Site updated successfully" });
        }
      } else {
        // Add new site
        const { site } = await apiService.createSite({
          site_name: currentSite.site_name,
          site_id: currentSite.site_id,
          status: currentSite.status
        });
        
        if (site) {
          setSites([...sites, site]);
          toast({ title: "Site added successfully" });
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving site:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save site", 
        variant: "destructive" 
      });
    }
  };

  const confirmDelete = async () => {
    if (!currentSite?.id) return;
    
    try {
      await apiService.deleteSite(currentSite.id);
      setSites(sites.filter(site => site.id !== currentSite.id));
      setIsDeleteDialogOpen(false);
      toast({ title: "Site deleted successfully" });
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete site", 
        variant: "destructive" 
      });
    }
  };

  const filteredSites = sites.filter(site => 
    site.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.site_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sites</h2>
          <p className="text-muted-foreground">Manage your sites and their credentials.</p>
        </div>
        <Button onClick={handleAddSite}>
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search sites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>Site ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No sites found
                </TableCell>
              </TableRow>
            ) : (
              filteredSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.site_name}</TableCell>
                  <TableCell>{site.site_id}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {site.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSite(site)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteSite(site)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentSite?.id ? 'Edit Site' : 'Add Site'}
            </DialogTitle>
            <DialogDescription>
              {currentSite?.id 
                ? 'Update the site details below.' 
                : 'Fill in the site details below to create a new site.'}
            </DialogDescription>
          </DialogHeader>
          {currentSite && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site_name" className="text-right">
                  Site Name
                </Label>
                <Input
                  id="site_name"
                  value={currentSite.site_name || ''}
                  onChange={(e) => setCurrentSite({ ...currentSite, site_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site_id" className="text-right">
                  Site ID
                </Label>
                <Input
                  id="site_id"
                  value={currentSite.site_id || ''}
                  onChange={(e) => setCurrentSite({ ...currentSite, site_id: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={currentSite.status || 'active'}
                  onChange={(e) => setCurrentSite({ ...currentSite, status: e.target.value })}
                  className="col-span-3 px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSite}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the site
              "{currentSite?.site_name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sites;
