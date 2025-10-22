export interface Doctor {
  id: string;
  email: string;
  userType: 'doctor';
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  specialization: string;
  licenseNumber: string;
  experience: string;
  consultationFee: number;
  qualification: string;
  hospital: string;
  availableDays: string[];
  availableTime: {
    start: string;
    end: string;
  };
  rating: number;
  totalPatients: number;
}

export interface DoctorResponse {
  success: boolean;
  message: string;
  data: {
    doctors: Doctor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface DoctorFilters {
  limit?: number;
  page?: number;
  specialization?: string;
  search?: string;
  searchName?: string;
  availableDays?: string;
}