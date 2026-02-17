import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { FileText, Plus, Search, Eye, Trash2, Loader2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetDistributorDocumentsQuery,
  useCreateDistributorDocumentMutation,
  useDeleteDistributorDocumentMutation,
  type DistributorDocument,
  type CreateDistributorDocumentRequest,
} from '@/app/api/complianceApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/config';

export const Documents = () => {
  const { data: documentsResponse, isLoading, error, refetch } = useGetDistributorDocumentsQuery();

  const documents: DistributorDocument[] = useMemo(() => {
    if (!documentsResponse) {
      return [];
    }
    return documentsResponse.results || [];
  }, [documentsResponse]);

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateDistributorDocumentRequest>({
    title: '',
    document_type: 'payment_terms',
    content: '',
    file: null,
    version: '1.0',
    is_active: true,
    is_required: true,
    effective_from: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    effective_until: null,
  });
  const [createFile, setCreateFile] = useState<File | null>(null);

  // Delete dialog state
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // API mutations
  const [createDocument, { isLoading: isCreating }] = useCreateDistributorDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDistributorDocumentMutation();

  // Filter documents based on search
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.document_type.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  });

  // Get file URL helper
  const getFileUrl = (filePath: string | null) => {
    if (!filePath) return null;
    
    // If it's already a full URL, return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // Construct full URL from relative path
    const baseUrl = API_BASE_URL.replace('/api/', '');
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${baseUrl}${normalizedPath}`;
  };

  // Handle view - open file URL
  const handleView = (document: DistributorDocument) => {
    if (!document.file) {
      toast.error('No file available for this document');
      return;
    }

    const fileUrl = getFileUrl(document.file);
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast.error('Invalid file URL');
    }
  };

  // Handle create
  const handleCreate = () => {
    setCreateFormData({
      title: '',
      document_type: 'payment_terms',
      content: '',
      file: null,
      version: '1.0',
      is_active: true,
      is_required: true,
      effective_from: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      effective_until: null,
    });
    setCreateFile(null);
    setIsCreateDialogOpen(true);
  };

  // Handle create file change
  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateFile(file);
    }
  };

  // Handle create submit
  const handleCreateSubmit = async () => {
    if (!createFormData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!createFormData.content.trim()) {
      toast.error('Please enter content');
      return;
    }
    if (!createFormData.version.trim()) {
      toast.error('Please enter a version');
      return;
    }
    if (!createFormData.effective_from) {
      toast.error('Please select an effective date');
      return;
    }

    try {
      await createDocument({
        ...createFormData,
        file: createFile || undefined,
      }).unwrap();
      toast.success('Document created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.error || 'Failed to create document');
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setDeletingDocumentId(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingDocumentId) return;

    try {
      await deleteDocument(deletingDocumentId).unwrap();
      toast.success('Document deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingDocumentId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.error || 'Failed to delete document');
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get document type display name
  const getDocumentTypeDisplay = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardContent className="text-center">
            <p className="text-destructive mb-2">Failed to load documents</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage distributor documents and compliance files
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Document
        </Button>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, type, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDocumentTypeDisplay(doc.document_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {doc.is_required ? (
                          <Badge className="bg-destructive text-white">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(doc.effective_from)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.file ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs">Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">No file</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.file && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(doc)}
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>
              Create a new distributor document. Only admin/staff can create documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, title: e.target.value })
                }
                placeholder="Terms & Conditions"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="create-document-type">Document Type *</Label>
              <Select
                value={createFormData.document_type}
                onValueChange={(value: 'payment_terms' | 'distributor_terms') =>
                  setCreateFormData({ ...createFormData, document_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_terms">Payment Terms</SelectItem>
                  <SelectItem value="distributor_terms">Distributor Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-content">Content *</Label>
              <Textarea
                id="create-content"
                value={createFormData.content}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, content: e.target.value })
                }
                placeholder="Full terms and conditions text..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="create-file">File (Optional: PDF/document file)</Label>
              <Input
                id="create-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCreateFileChange}
              />
              {createFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {createFile.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="create-version">Version *</Label>
              <Input
                id="create-version"
                value={createFormData.version}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, version: e.target.value })
                }
                placeholder="1.0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-is-active">Is Active</Label>
                <Select
                  value={createFormData.is_active ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setCreateFormData({ ...createFormData, is_active: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-is-required">Is Required</Label>
                <Select
                  value={createFormData.is_required ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setCreateFormData({ ...createFormData, is_required: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Required</SelectItem>
                    <SelectItem value="false">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="create-effective-from">Effective From *</Label>
              <Input
                id="create-effective-from"
                type="datetime-local"
                value={
                  createFormData.effective_from
                    ? new Date(createFormData.effective_from).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    effective_from: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="create-effective-until">Effective Until (Optional: expiration date)</Label>
              <Input
                id="create-effective-until"
                type="datetime-local"
                value={
                  createFormData.effective_until
                    ? new Date(createFormData.effective_until).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    effective_until: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingDocumentId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

