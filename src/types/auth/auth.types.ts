export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      userId: string;
      email: string;
      userType: string;
    };
  };
  timestamp: string;
}

export interface AuthResponseData {
  token: string;
  user: {
    userId: string;
    email: string;
    userType: string;
  };
}
