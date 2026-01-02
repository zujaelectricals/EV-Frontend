import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

export function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', name: 'Visa •••• 1234', details: 'Expires 12/25', isDefault: true },
    { id: '2', type: 'upi', name: 'UPI ID', details: 'user@paytm', isDefault: false },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'upi' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleAddMethod = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newMethodType,
      name: newMethodType === 'card' ? `Card •••• ${cardNumber.slice(-4)}` : cardName,
      details: newMethodType === 'card' ? `Expires ${expiry}` : cardName,
      isDefault: methods.length === 0,
    };
    setMethods([...methods, newMethod]);
    setShowAddModal(false);
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
  };

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const handleRemove = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Methods</h2>
          <p className="text-muted-foreground">Manage your payment methods</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <Card key={method.id} className={method.isDefault ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.details}</p>
                  </div>
                </div>
                {method.isDefault && (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                    className="flex-1"
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(method.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Payment Method Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new payment method for faster checkout</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={newMethodType} onValueChange={(v) => setNewMethodType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">Bank Account</Label>
              </div>
            </RadioGroup>

            {newMethodType === 'card' && (
              <>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>
              </>
            )}

            {newMethodType === 'upi' && (
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input
                  placeholder="user@paytm"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddMethod} className="flex-1">
                Add Method
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

