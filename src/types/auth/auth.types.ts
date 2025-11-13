export interface LoginResponse {
  success: boolean;
  message: string;
  code?: string;
  data: {
    token: string;
    user: {
      userId: string;
      email: string;
      userType: 'patient' | 'doctor' | 'admin';
    };
  };
  timestamp: string;
}

export interface AuthResponseData {
  token: string;
  user: {
    userId: string;
    email: string;
    userType: 'patient' | 'doctor' | 'admin';
  };
}

export interface AdminDashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingApprovals: number;
}
