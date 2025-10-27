// Prefer Vite env but fall back to CRA-style env and default localhost
export const BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  (import.meta as any)?.env?.REACT_APP_API_URL ||
  ((typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL : undefined)) ||
  'https://health-platform-backend-fq3w.onrender.com';

export const API_ENDPOINTS = {
  ADMIN: {
    DOCTORS: '/api/v1/admin/users',
  },
} as const;