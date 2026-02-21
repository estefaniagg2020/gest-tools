export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost: number;
  stockLevel: number;
  minStockLevel: number;
  isService: boolean;
  supplierId?: string;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: StockMovementType;
  reason?: string;
  createdAt: string;
}

export type StockMovementType = 'ADJUSTMENT' | 'SALE' | 'PURCHASE' | 'USAGE' | 'RETURN';
