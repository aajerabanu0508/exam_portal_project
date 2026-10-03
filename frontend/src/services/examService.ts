import api from './api';
import {
  AttemptResponse, ExamResult, AdminStats, ResultListItem,
  Test, Question
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data: {
    name: string; email: string; phone?: string;
    college?: string; student_id?: string;
  }) => api.post('/api/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  me: () => api.get('/api/auth/me'),
};

// ── Tests ─────────────────────────────────────────────────────────────────────
export const testService = {
  list: () => api.get<Test[]>('/api/tests'),
  get: (id: string) => api.get<Test>(`/api/tests/${id}`),
  create: (data: Partial<Test>) => api.post<Test>('/api/tests', data),
  update: (id: string, data: Partial<Test>) => api.put<Test>(`/api/tests/${id}`, data),
  delete: (id: string) => api.delete(`/api/tests/${id}`),
};

// ── Attempts ──────────────────────────────────────────────────────────────────
export const attemptService = {
  start: (testId: string) =>
    api.post<AttemptResponse>(`/api/attempts/start/${testId}`),

  saveAnswer: (
    attemptId: string,
    data: { question_id: string; selected_option: number | null; is_marked_for_review: boolean }
  ) => api.post(`/api/attempts/${attemptId}/answer`, data),

  reportViolation: (
    attemptId: string,
    data: { violation_type: string; details?: string }
  ) => api.post(`/api/attempts/${attemptId}/violation`, data),

  submit: (attemptId: string) =>
    api.post<ExamResult>(`/api/attempts/${attemptId}/submit`),
};

// ── Results ───────────────────────────────────────────────────────────────────
export const resultService = {
  list: (params?: { search?: string; test_id?: string }) =>
    api.get<ResultListItem[]>('/api/results', { params }),

  get: (attemptId: string) =>
    api.get<ExamResult>(`/api/results/${attemptId}`),

  exportCsv: (testId?: string) => {
    const params = testId ? `?test_id=${testId}` : '';
    return api.get(`/api/results/export/csv${params}`, { responseType: 'blob' });
  },

  adminStats: () => api.get<AdminStats>('/api/results/stats/admin'),
};

// ── Questions ─────────────────────────────────────────────────────────────────
export const questionService = {
  list: (params?: { topic?: string; difficulty?: string }) =>
    api.get<Question[]>('/api/questions', { params }),

  topics: () => api.get<string[]>('/api/questions/topics'),

  create: (data: Partial<Question>) => api.post<Question>('/api/questions', data),
  update: (id: string, data: Partial<Question>) =>
    api.put<Question>(`/api/questions/${id}`, data),
  delete: (id: string) => api.delete(`/api/questions/${id}`),
  import: (questions: Partial<Question>[]) =>
    api.post('/api/questions/import', questions),
};
