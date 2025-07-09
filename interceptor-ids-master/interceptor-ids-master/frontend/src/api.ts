import axios from 'axios';
import { Log } from './types';

const API_URL = 'http://localhost:5000';

export const fetchLogs = async (): Promise<Log[]> => {
  const response = await axios.get(`${API_URL}/api/logs`);
  return response.data;
};

export const fetchStats = async (): Promise<{
  totalLogs: number;
  maliciousCount: number;
  benignCount: number;
  accuracy: number;
}> => {
  const response = await axios.get(`${API_URL}/api/stats`);
  return response.data;
};

export const fetchBlockedIPs = async (): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/api/blocked-ips`);
  return response.data;
};

export const checkAuth = async (): Promise<{ username: string; role: string }> => {
  const response = await axios.get(`${API_URL}/api/auth/check`);
  return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/auth/logout`);
  return response.data;
};
