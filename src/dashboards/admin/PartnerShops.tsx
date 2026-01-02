import { motion } from 'framer-motion';
import { Store, Plus, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const PartnerShops = () => {
  const partners = [
    { id: 1, name: 'Tech Accessories Hub', location: 'Mumbai', phone: '+91 98765 43210', products: 45, status: 'active' },
    { id: 2, name: 'EV Gear Store', location: 'Delhi', phone: '+91 98765 43211', products: 32, status: 'active' },
    { id: 3, name: 'Green Mobility Shop', location: 'Bangalore', phone: '+91 98765 43212', products: 28, status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partner Shops</h1>
          <p className="text-muted-foreground mt-1">Manage redemption partner shops</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Shops List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partners.map((partner) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{partner.name}</h3>
                    <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                      {partner.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{partner.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{partner.phone}</span>
                    </div>
                    <p>Products: {partner.products}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

