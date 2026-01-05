import { Scooter } from '@/store/ScooterCard';

export interface InventoryModel {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: 'scooter' | 'loader' | 'bike';
  specifications: Scooter;
  basePrice: number;
  status: 'active' | 'inactive' | 'coming_soon';
  images: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  color?: string;
  priceAdjustment: number;
  sku: string;
  stock?: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  status: 'active' | 'inactive';
}

export interface StockLevel {
  id: string;
  modelId: string;
  modelName: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  maxStock: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export interface StockMovement {
  id: string;
  modelId: string;
  modelName: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  reason: string;
  reference: string; // Order ID, PO ID, etc.
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  modelId: string;
  modelName: string;
  customerId: string;
  customerName: string;
  status: 'ordered' | 'allocated' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  allocatedVehicleId?: string;
  deliveryPartner?: string;
  deliveryPartnerName?: string;
  scheduledDate?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  timeline: DeliveryEvent[];
  notes?: string;
}

export interface DeliveryEvent {
  id: string;
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
  updatedBy: string;
}

export interface Allocation {
  id: string;
  orderId: string;
  preBookingId?: string;
  modelId: string;
  modelName: string;
  customerId: string;
  customerName: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'allocated' | 'rejected';
  requestedDate: string;
  allocatedVehicleId?: string;
  warehouseId?: string;
  warehouseName?: string;
  notes?: string;
  conflictReason?: string;
}

export interface InventoryMetrics {
  totalModels: number;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingAllocations: number;
  inTransitDeliveries: number;
  warehouses: number;
}

