// Prefer Vite env but fall back to CRA-style env and default localhost
export const BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  (import.meta as any)?.env?.REACT_APP_API_URL ||
  ((typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL : undefined)) ||
  'https://health-platform-backend-production-f753.up.railway.app';
  //'http://localhost:3000';
export const API_ENDPOINTS = {
  ADMIN: {
    DOCTORS: '/api/v1/admin/users',
  },
} as const;


// Socket server URL used by the video call component. Override with Vite env VITE_SOCKET_URL.
export const SOCKET_SERVER_URL =
  (import.meta as any)?.env?.VITE_SOCKET_URL || 'https://health-platform-backend-production-f753.up.railway.app';