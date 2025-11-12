export interface Specialization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecializationFilters {
  name: string;
  createdAt: string;
}

export interface CreateSpecializationRequest {
  name: string;
}

export interface GetSpecializationsParams {
  page?: number;
  limit?: number;
  name?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}

export interface SpecializationsResponse {
  specializations: Specialization[];
  totalCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetSpecializationsApiResponse extends ApiResponse<SpecializationsResponse> {
  success: boolean;
  message: string;
  timestamp: string;
  data: SpecializationsResponse;
}

export interface UpdateSpecializationRequest {
  name: string;
}

export interface UpdateSpecializationResponse extends ApiResponse<{
  specializationId: string;
  name: string;
  updatedAt: string;
}> {}

export interface DeleteSpecializationResponse extends ApiResponse<{
  specializationId: string;
  deletedAt: string;
}> {}