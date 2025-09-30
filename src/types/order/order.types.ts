// Order related types for patient orders

export interface OrderItem {
  medicineName: string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
}

export interface PatientOrder {
  orderId: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface PatientOrdersResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    orders: PatientOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PatientOrdersRequest {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}