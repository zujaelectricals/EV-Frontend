import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, FileText, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateDistributorInfo, Nominee } from '@/app/slices/authSlice';
import { toast } from 'sonner';

export function NomineeManagement() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Nominee>({
    name: user?.distributorInfo?.nominee?.name || '',
    relationship: user?.distributorInfo?.nominee?.relationship || '',
    phone: user?.distributorInfo?.nominee?.phone || '',
    email: user?.distributorInfo?.nominee?.email || '',
    address: user?.distributorInfo?.nominee?.address || '',
    aadhar: user?.distributorInfo?.nominee?.aadhar || '',
  });

  const hasNominee = user?.distributorInfo?.nominee && 
                     user.distributorInfo.nominee.name.trim() !== '';

  const handleInputChange = (field: keyof Nominee, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.relationship.trim()) {
      toast.error('Please fill all required fields (Name, Relationship)');
      return;
    }

    // Validate phone number if provided
    if (formData.phone && formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate email if provided
    if (formData.email && !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Update nominee information
    dispatch(updateDistributorInfo({
      nominee: formData,
    }));

    toast.success('Nominee information saved successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: user?.distributorInfo?.nominee?.name || '',
      relationship: user?.distributorInfo?.nominee?.relationship || '',
      phone: user?.distributorInfo?.nominee?.phone || '',
      email: user?.distributorInfo?.nominee?.email || '',
      address: user?.distributorInfo?.nominee?.address || '',
      aadhar: user?.distributorInfo?.nominee?.aadhar || '',
    });
    setIsEditing(false);
  };

  const relationshipOptions = [
    'Spouse',
    'Son',
    'Daughter',
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Nominee Information
          </CardTitle>
          <CardDescription>
            Add nominee details for pool money transfer. In case of your unfortunate demise, 
            the pool money will be transferred to your nominee, and they can continue your distributor work if they wish.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasNominee && !isEditing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You haven't added nominee information yet. It's important to add nominee details 
                to ensure your pool money is transferred to the right person.
              </AlertDescription>
            </Alert>
          )}

          {hasNominee && !isEditing && (
            <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-semibold text-foreground">Nominee Information Added</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nominee Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter nominee name"
                    className="pl-10"
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Relationship <span className="text-destructive">*</span>
                </Label>
                <select
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50"
                  disabled={!isEditing}
                  required
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-10"
                    disabled={!isEditing}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  className="w-full min-h-[80px] px-3 py-2 pl-10 rounded-md border border-input bg-background text-sm disabled:opacity-50 resize-none"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhar Number</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="aadhar"
                  value={formData.aadhar}
                  onChange={(e) => handleInputChange('aadhar', e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="pl-10"
                  disabled={!isEditing}
                  maxLength={14}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                {hasNominee ? 'Edit Nominee' : 'Add Nominee'}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Nominee
                </Button>
              </>
            )}
          </div>

          {/* Important Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> In case of your unfortunate demise, your pool money will be 
              transferred to the nominee. The nominee can also choose to continue your distributor work 
              if they wish. Please ensure all information is accurate and up-to-date.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

