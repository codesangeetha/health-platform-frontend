export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stock: number;
  sideEffects: string[];
  interactions: string[];
  ingredients: string[];
  expiryDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  manufacturer: string;
  description: string;
  dosage: string;
  storage: string;
}

export interface MedicineSearchResponse {
  success: boolean;
  message: string;
  data: {
    medicines: Medicine[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface PrescriptionMedicine {
  medicineId: string;
  dosage: string;
  timing: string[];
  duration: number;
  mealTime: string;
}

export interface PrescriptionLabTest {
  testId: string;
  name: string;
  price: number;
  categoryId: string;
}

export interface PrescriptionData {
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  notes: string;
  medicines: PrescriptionMedicine[];
  labTests?: PrescriptionLabTest[];
}

export interface PrescriptionResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    _id: string;
    id?: string; // Optional for backward compatibility
    appointmentId: string;
    patientId: string;
    doctorId: string;
    diagnosis: string;
    notes: string;
    medicines: PrescriptionMedicine[];
    labTests?: PrescriptionLabTest[];
    status: 'active' | 'completed' | 'Created';
    createdAt: string;
    updatedAt: string;
  };
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  medicineId: string;
  quantity: number;
}

export interface PharmacyOrderData {
  prescriptionId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  deliveryMethod: 'standard' | 'express' | 'urgent';
}

export interface PharmacyOrderResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    id: string;
    prescriptionId: string;
    patientId: string;
    items: OrderItem[];
    deliveryAddress: DeliveryAddress;
    deliveryMethod: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
  };
}