export interface LabTestCategory {
  categoryId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
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

export interface LabTestCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: LabTestCategory[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}

export interface CreateLabTestCategoryPayload {
  name: string;
  description: string;
  status?: 'active' | 'inactive';
}

export interface CreateLabTestCategoryResponse {
  success: boolean;
  message: string;
  data: {
    categoryId: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
  };
  timestamp: string;
}

export interface UpdateLabTestCategoryPayload {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateLabTestCategoryResponse {
  success: boolean;
  message: string;
  data: {
    categoryId: string;
    name: string;
    description: string;
    status: string;
    updatedAt: string;
  };
  timestamp: string;
}

export interface DeleteLabTestCategoryResponse {
  success: boolean;
  message: string;
  data: {
    categoryId: string;
    status: string;
    deletedAt: string;
  };
  timestamp: string;
}

export interface GetLabTestCategoriesParams {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}