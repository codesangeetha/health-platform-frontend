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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MedicinesResponse {
  success: boolean;
  message: string;
  data: {
    medicines: Medicine[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}