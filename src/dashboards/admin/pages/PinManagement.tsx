import { motion } from 'framer-motion';
import { Key, Plus, Search, Download, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const pins = [
  {
    id: 'PIN001',
    pin: 'ABC123XYZ456',
    type: 'user',
    status: 'used',
    usedBy: 'Rajesh Kumar',
    usedDate: '2024-03-15',
    generatedDate: '2024-03-10',
    value: 5000,
  },
  {
    id: 'PIN002',
    pin: 'DEF789GHI012',
    type: 'admin',
    status: 'unused',
    usedBy: null,
    usedDate: null,
    generatedDate: '2024-03-20',
    value: 10000,
  },
  {
    id: 'PIN003',
    pin: 'JKL345MNO678',
    type: 'user',
    status: 'unused',
    usedBy: null,
    usedDate: null,
    generatedDate: '2024-03-22',
    value: 5000,
  },
  {
    id: 'PIN004',
    pin: 'PQR901STU234',
    type: 'user',
    status: 'used',
    usedBy: 'Priya Sharma',
    usedDate: '2024-03-18',
    generatedDate: '2024-03-12',
    value: 5000,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'used':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Used
        </Badge>
      );
    case 'unused':
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Unused
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'admin':
      return <Badge variant="default">Admin</Badge>;
    case 'user':
      return <Badge variant="secondary">User</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const PinManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pin Management</h1>
          <p className="text-muted-foreground mt-1">Generate, track, and manage e-PINs for user registrations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Pins
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Pins</DialogTitle>
              <DialogDescription>Create a batch of e-PINs for distribution</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pin Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User Pin</SelectItem>
                    <SelectItem value="admin">Admin Pin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pin Value (₹)</Label>
                <Input type="number" placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="100" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Generate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/20 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pins</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent mt-1">5,250</p>
                </div>
                <div className="rounded-full bg-violet-500/10 p-3">
                  <Key className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Used Pins</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent mt-1">3,125</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 p-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-amber-950/20 dark:via-background dark:to-yellow-950/20 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unused Pins</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent mt-1">2,125</p>
                </div>
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-cyan-950/20 dark:via-background dark:to-blue-950/20 h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mt-1">₹26.25M</p>
                </div>
                <div className="rounded-full bg-cyan-500/10 p-3">
                  <Key className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pins Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Pins</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search pins..." className="w-64" />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="unused">Unused</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Pins</TabsTrigger>
              <TabsTrigger value="user">User Pins</TabsTrigger>
              <TabsTrigger value="admin">Admin Pins</TabsTrigger>
              <TabsTrigger value="used">Used</TabsTrigger>
              <TabsTrigger value="unused">Unused</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pin ID</TableHead>
                    <TableHead>Pin Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Used Date</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pins.map((pin) => (
                    <TableRow key={pin.id}>
                      <TableCell className="font-medium">{pin.id}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-secondary px-2 py-1 rounded">{pin.pin}</code>
                      </TableCell>
                      <TableCell>{getTypeBadge(pin.type)}</TableCell>
                      <TableCell>₹{pin.value.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(pin.status)}</TableCell>
                      <TableCell>
                        {pin.usedBy ? (
                          <span className="text-sm">{pin.usedBy}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pin.usedDate ? (
                          <span className="text-sm">{pin.usedDate}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{pin.generatedDate}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          {pin.status === 'unused' && (
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

