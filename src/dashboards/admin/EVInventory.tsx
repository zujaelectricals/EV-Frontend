import { motion } from 'framer-motion';
import { Boxes, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const EVInventory = () => {
  const vehicles = [
    { id: 1, name: 'Comfort Plus', brand: 'EV Motors', price: 80000, stock: 45, status: 'available' },
    { id: 2, name: 'Speed Pro', brand: 'EV Motors', price: 95000, stock: 32, status: 'available' },
    { id: 3, name: 'Eco Rider', brand: 'Green EV', price: 75000, stock: 0, status: 'out_of_stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EV Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage vehicle inventory and stock</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search vehicles..." className="pl-10 w-64" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                    <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                      {vehicle.status === 'available' ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>Brand: {vehicle.brand}</p>
                    <p>Price: ₹{vehicle.price.toLocaleString()}</p>
                    <p>Stock: {vehicle.stock} units</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

