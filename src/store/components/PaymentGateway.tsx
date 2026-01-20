import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Smartphone,
  Building2,
  Wallet,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (paymentGatewayRef?: string) => void;
  onFailure?: () => void;
  vehicleName?: string;
}

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export function PaymentGateway({ isOpen, onClose, amount, onSuccess, onFailure, vehicleName }: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  
  // UPI
  const [upiId, setUpiId] = useState('');
  
  // Net Banking
  const [selectedBank, setSelectedBank] = useState('');
  
  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setPaymentMethod('card');
      setCardNumber('');
      setCardName('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
      setUpiId('');
      setSelectedBank('');
      setSelectedWallet('');
      setShowCardDetails(false);
    }
  }, [isOpen]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (formatted.replace(/\s/g, '').length >= 13) {
      setShowCardDetails(true);
    }
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^6(?:011|5)/.test(num)) return 'Discover';
    return 'Card';
  };

  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!cardName || cardName.length < 3) {
      toast.error('Please enter cardholder name');
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      toast.error('Please select expiry date');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter CVV');
      return false;
    }
    return true;
  };

  const validateUPI = () => {
    if (!upiId || !/^[\w.-]+@[\w]+$/.test(upiId)) {
      toast.error('Please enter a valid UPI ID (e.g., name@paytm)');
      return false;
    }
    return true;
  };

  const validateNetBanking = () => {
    if (!selectedBank) {
      toast.error('Please select a bank');
      return false;
    }
    return true;
  };

  const validateWallet = () => {
    if (!selectedWallet) {
      toast.error('Please select a wallet');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    let isValid = false;
    
    switch (paymentMethod) {
      case 'card':
        isValid = validateCard();
        break;
      case 'upi':
        isValid = validateUPI();
        break;
      case 'netbanking':
        isValid = validateNetBanking();
        break;
      case 'wallet':
        isValid = validateWallet();
        break;
    }

    if (!isValid) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Generate payment gateway reference
    const paymentGatewayRef = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Wait a bit then call success callback
    setTimeout(() => {
      onSuccess(paymentGatewayRef);
      onClose();
    }, 2000);
  };

  const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'Indian Bank'
  ];

  const wallets = [
    'Paytm',
    'PhonePe',
    'Google Pay',
    'Amazon Pay',
    'MobiKwik'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month.toString().padStart(2, '0');
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background border-b p-6">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold">Secure Payment</DialogTitle>
                      <DialogDescription className="sr-only">
                        Secure payment gateway for {vehicleName || 'your purchase'}. Complete your payment using your preferred method.
                      </DialogDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicleName && `Payment for ${vehicleName}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6">
                {/* Amount Display */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount to Pay</p>
                        <p className="text-3xl font-bold text-foreground mt-1">
                          ₹{amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                      }`}>
                        <RadioGroupItem value="card" id="card" className="mt-0" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-medium">Card</span>
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'upi' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                      }`}>
                        <RadioGroupItem value="upi" id="upi" className="mt-0" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer flex items-center gap-3">
                          <Smartphone className="w-5 h-5" />
                          <span className="font-medium">UPI</span>
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'netbanking' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                      }`}>
                        <RadioGroupItem value="netbanking" id="netbanking" className="mt-0" />
                        <Label htmlFor="netbanking" className="flex-1 cursor-pointer flex items-center gap-3">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">Net Banking</span>
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${
                        paymentMethod === 'wallet' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                      }`}>
                        <RadioGroupItem value="wallet" id="wallet" className="mt-0" />
                        <Label htmlFor="wallet" className="flex-1 cursor-pointer flex items-center gap-3">
                          <Wallet className="w-5 h-5" />
                          <span className="font-medium">Wallet</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Forms */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div
                      key="card-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 text-foreground border-green-200">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-green-500/20 rounded flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-green-700" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Card Number</p>
                                <p className="text-sm font-medium text-foreground">
                                  {cardNumber || '•••• •••• •••• ••••'}
                                </p>
                              </div>
                            </div>
                            {cardNumber && (
                              <div className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded font-medium">
                                {getCardType(cardNumber)}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-foreground">Cardholder Name</Label>
                            <Input
                              placeholder="John Doe"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              className="bg-white border-green-300 text-foreground placeholder:text-muted-foreground focus:border-green-500"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Card Number</Label>
                          <Input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="text-lg tracking-wider"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <div className="flex gap-2">
                              <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>
                                      {month}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={expiryYear} onValueChange={setExpiryYear}>
                                <SelectTrigger>
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>CVV</Label>
                            <div className="relative">
                              <Input
                                type={showCvv ? 'text' : 'password'}
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCvv(!showCvv)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'upi' && (
                    <motion.div
                      key="upi-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">Pay via UPI</p>
                              <p className="text-sm text-muted-foreground">Enter your UPI ID</p>
                            </div>
                          </div>
                          <Input
                            placeholder="yourname@paytm / yourname@phonepe"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="text-lg"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Supported: Paytm, PhonePe, Google Pay, BHIM, and more
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <motion.div
                      key="netbanking-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">Net Banking</p>
                              <p className="text-sm text-muted-foreground">Select your bank</p>
                            </div>
                          </div>
                          <Select value={selectedBank} onValueChange={setSelectedBank}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select your bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {banks.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <motion.div
                      key="wallet-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">Digital Wallet</p>
                              <p className="text-sm text-muted-foreground">Select your wallet</p>
                            </div>
                          </div>
                          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select your wallet" />
                            </SelectTrigger>
                            <SelectContent>
                              {wallets.map((wallet) => (
                                <SelectItem key={wallet} value={wallet}>
                                  {wallet}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{amount.toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-6">
                Your payment of ₹{amount.toLocaleString('en-IN')} has been processed successfully.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

