export interface LabTest {
  testId: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LabTestsResponse {
  success: boolean;
  message: string;
  data: {
    tests: LabTest[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}

export interface CreateLabTestPayload {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  isActive?: boolean;
}

export interface CreateLabTestResponse {
  success: boolean;
  message: string;
  data: {
    labTestId: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    isActive: boolean;
    createdAt: string;
  };
  timestamp: string;
}

export interface UpdateLabTestPayload {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  isActive?: boolean;
}

export interface UpdateLabTestResponse {
  success: boolean;
  message: string;
  data: {
    labTestId: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    isActive: boolean;
    updatedAt: string;
  };
  timestamp: string;
}

export interface DeleteLabTestResponse {
  success: boolean;
  message: string;
  data: {
    labTestId: string;
    status: string;
    deletedAt: string;
  };
  timestamp: string;
}

export interface GetLabTestsParams {
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  name?: string;
  description?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LabTestFilters {
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  name?: string;
  description?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}