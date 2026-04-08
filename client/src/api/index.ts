import api from './axios';
import type { Application, AuthResponse, ParsedJD } from '../types';

export const authApi = {
  register: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, password }).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
};

export const applicationsApi = {
  getAll: () => api.get<Application[]>('/applications').then((r) => r.data),
  create: (data: Partial<Application>) =>
    api.post<Application>('/applications', data).then((r) => r.data),
  update: (id: string, data: Partial<Application>) =>
    api.put<Application>(`/applications/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/applications/${id}`).then((r) => r.data),
};

export const aiApi = {
  parse: (jobDescription: string) =>
    api.post<ParsedJD>('/ai/parse', { jobDescription }).then((r) => r.data),
};
