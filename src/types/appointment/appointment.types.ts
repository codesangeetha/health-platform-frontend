export interface AppointmentData {
  doctorId: string;
  date: string;
  time: string;
  isVideoCall: boolean;
  reason?: string;
  symptoms?: string;
  appointmentType?: string;
  visitType?: string;
}

export interface Appointment {
  id: string;
  appointmentId?: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  isVideoCall: boolean;
  reason?: string;
  symptoms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Appointment;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  doctorId?: string;
  date?: string;
}