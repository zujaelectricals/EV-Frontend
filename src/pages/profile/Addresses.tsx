import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Home',
      phone: '9876543210',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const handleSave = () => {
    if (editingAddress) {
      setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...editingAddress, ...formData } : a));
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now().toString() }]);
    }
    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-end mb-4">
        <Button 
          onClick={() => {
            setEditingAddress(null);
            setFormData({
              name: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              pincode: '',
              isDefault: false,
            });
            setShowAddModal(true);
          }}
          size="sm"
          className="text-xs sm:text-sm"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Add Address
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? 'border-primary' : ''}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{address.name}</h3>
                    {address.isDefault && (
                      <Badge className="mt-1 bg-success text-success-foreground text-[10px] sm:text-xs">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                <p>{address.address}</p>
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p>Phone: {address.phone}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Address Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Address Label (e.g., Home, Office)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Home"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone Number</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                maxLength={10}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Street Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your street address"
                rows={3}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  maxLength={6}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="default" className="cursor-pointer">Set as default address</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingAddress ? 'Update' : 'Add'} Address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

