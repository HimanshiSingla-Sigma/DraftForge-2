import axios from 'axios';
import {
  AuthResponse,
  ReferenceDocument,
  DocumentClassificationResult,
  Draft,
  DraftVersion,
  VersionCompareResponse,
  Evaluation,
  LoopholeReport,
  Conversation,
  ChatMessage,
  ChatTurnResponse,
  StudentSkill,
  Roadmap,
  RoadmapItem,
  Quiz,
  QuizAttemptResponse,
  StudentProgress,
  LeaderboardResponse,
  Assignment,
  Submission,
  CohortAnalytics,
  AssistDraftingResponse,
  ExplainEvaluationResponse,
  RAGQueryResponse,
  HealthCheckResponse,
  Section,
  Invitation,
  VerifyInvitationResponse,
  AdminOverviewStats,
  TeacherOverview,
  StudentOverview,
  AuditLog,
} from '../types';

const getBaseUrl = (): string => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || typeof envUrl !== 'string' || !envUrl.trim()) {
    envUrl = import.meta.env.PROD
      ? 'https://draftforge-2-d9mc.onrender.com'
      : 'http://localhost:8000';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('draftforge_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('draftforge_token');
      localStorage.removeItem('draftforge_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  // Reference Documents
  uploadReference: (formData: FormData) =>
    apiClient.post<ReferenceDocument>('/documents/reference/upload', formData),
  getReferences: (docType?: string) =>
    apiClient.get<ReferenceDocument[]>(`/documents/reference${docType ? `?document_type=${docType}` : ''}`),
  classifyText: (text: string) =>
    apiClient.post<DocumentClassificationResult>('/documents/classify', new URLSearchParams({ text })),

  // Drafts
  createDraft: (data: { title: string; raw_content: string; document_type?: string }) =>
    apiClient.post<Draft>('/drafts', data),
  uploadDraftFile: (formData: FormData) =>
    apiClient.post<Draft>('/drafts/upload', formData),
  getDrafts: () =>
    apiClient.get<Draft[]>('/drafts'),
  getDraft: (id: string) =>
    apiClient.get<Draft>(`/drafts/${id}`),
  addDraftVersion: (id: string, content: string) =>
    apiClient.post<DraftVersion>(`/drafts/${id}/versions`, new URLSearchParams({ content })),
  compareVersions: (id: string, v1: number, v2: number) =>
    apiClient.get<VersionCompareResponse>(`/drafts/${id}/compare?v1=${v1}&v2=${v2}`),

  // Evaluations
  evaluateDraft: (draft_id: string, version_number?: number) =>
    apiClient.post<Evaluation>('/evaluations', { draft_id, version_number }),
  getEvaluation: (evaluation_id: string) =>
    apiClient.get<Evaluation>(`/evaluations/${evaluation_id}`),

  // Loopholes (GraphRAG)
  getLoopholes: (evaluation_id: string) =>
    apiClient.get<LoopholeReport>(`/loopholes/${evaluation_id}`),

  // AI Assistance & Tutor
  explainEvaluation: (evaluation_id: string, clause_category?: string, student_query?: string) =>
    apiClient.post<ExplainEvaluationResponse>('/ai/explain-evaluation', { evaluation_id, clause_category, student_query }),
  assistDrafting: (data: { document_type: string; target_clause: string; user_instructions?: string; context_draft_id?: string }) =>
    apiClient.post<AssistDraftingResponse>('/ai/assist-drafting', data),

  // RAG & Evidence Retrieval
  queryEvidence: (data: { query: string; document_type: string; section_hint?: string; top_k?: number }) =>
    apiClient.post<RAGQueryResponse>('/rag/retrieve', data),

  // Chat & Memory
  createConversation: (title?: string) =>
    apiClient.post<Conversation>('/conversations', { title }),
  getConversations: () =>
    apiClient.get<Conversation[]>('/conversations'),
  getMessages: (conversationId: string) =>
    apiClient.get<ChatMessage[]>(`/conversations/${conversationId}/messages`),
  sendChatMessage: (data: { conversation_id: string; message: string; document_type?: string; draft_id?: string; section_hint?: string }) =>
    apiClient.post<ChatTurnResponse>('/chat/send', data),

  // Skills & Roadmaps
  getSkills: () =>
    apiClient.get<StudentSkill[]>('/skills/my-skills'),
  getActiveRoadmap: () =>
    apiClient.get<Roadmap | null>('/roadmap'),
  generateRoadmap: () =>
    apiClient.post<Roadmap>('/roadmap/generate'),
  completeRoadmapItem: (itemId: string) =>
    apiClient.patch<RoadmapItem>(`/roadmap/items/${itemId}/complete`),

  // Quizzes & Practice
  getQuizzes: (docType?: string) =>
    apiClient.get<Quiz[]>(`/quizzes${docType ? `?document_type=${docType}` : ''}`),
  getQuiz: (id: string) =>
    apiClient.get<Quiz>(`/quizzes/${id}`),
  submitQuiz: (data: { quiz_id: string; answers: Record<string, string> }) =>
    apiClient.post<QuizAttemptResponse>('/quizzes/submit', data),

  // Progress & Leaderboard
  getProgress: () =>
    apiClient.get<StudentProgress>('/progress'),
  getLeaderboard: () =>
    apiClient.get<LeaderboardResponse>('/leaderboard'),

  // Teacher Portal & Assignments
  createAssignment: (data: { title: string; description?: string; document_type: string; instructions: string; deadline?: string; rubric_override?: any }) =>
    apiClient.post<Assignment>('/assignments', data),
  getAssignments: (docType?: string) =>
    apiClient.get<Assignment[]>(`/assignments${docType ? `?document_type=${docType}` : ''}`),
  getAssignment: (id: string) =>
    apiClient.get<Assignment>(`/assignments/${id}`),
  getTeacherAssignments: () =>
    apiClient.get<Assignment[]>('/teachers/assignments'),
  getAssignmentSubmissions: (assignmentId: string) =>
    apiClient.get<Submission[]>(`/submissions/assignment/${assignmentId}`),
  submitAssignment: (data: { assignment_id: string; draft_id: string; draft_version_id: string }) =>
    apiClient.post<Submission>('/submissions', data),
  overrideScore: (submissionId: string, data: { overridden_score: number; override_reason: string; teacher_notes?: string }) =>
    apiClient.post<Submission>(`/submissions/${submissionId}/override`, data),
  getCohortAnalytics: () =>
    apiClient.get<CohortAnalytics>('/analytics/cohort'),

  // Health
  checkHealth: () =>
    apiClient.get<HealthCheckResponse>('/health'),

  // Invitations
  verifyInvitation: (token: string) =>
    apiClient.get<VerifyInvitationResponse>(`/invitations/verify?token=${encodeURIComponent(token)}`),
  acceptInvitation: (data: { token: string; password: string; full_name?: string }) =>
    apiClient.post<AuthResponse>('/invitations/accept', data),
  resendInvitation: (invitationId: string) =>
    apiClient.post<{ status: string; message: string; invitation: Invitation }>(`/invitations/${invitationId}/resend`),
  revokeInvitation: (invitationId: string) =>
    apiClient.post<{ status: string; message: string; invitation: Invitation }>(`/invitations/${invitationId}/revoke`),

  // Admin Portal
  getAdminStats: () =>
    apiClient.get<AdminOverviewStats>('/admin/stats'),
  getAdminTeachers: () =>
    apiClient.get<TeacherOverview[]>('/admin/teachers'),
  inviteTeacher: (data: { email: string; section_ids?: string[]; full_name?: string }) =>
    apiClient.post<{ status: string; message: string; invitation: Invitation }>('/admin/teachers/invite', data),
  getAdminStudents: () =>
    apiClient.get<StudentOverview[]>('/admin/students'),
  createSection: (data: { name: string; code: string; academic_year?: string; description?: string }) =>
    apiClient.post<Section>('/admin/sections', data),
  getAdminSections: () =>
    apiClient.get<Section[]>('/admin/sections'),
  assignTeacherSections: (teacherId: string, sectionIds: string[]) =>
    apiClient.post<{ status: string; teacher_id: string; assigned_sections: string[] }>(`/admin/teachers/${teacherId}/sections`, { teacher_id: teacherId, section_ids: sectionIds }),
  getAdminInvitations: (role?: string, status?: string) =>
    apiClient.get<Invitation[]>(`/admin/invitations${role || status ? `?${role ? `role=${role}&` : ''}${status ? `status=${status}` : ''}` : ''}`),
  getAuditLogs: (limit: number = 100, action?: string) =>
    apiClient.get<AuditLog[]>(`/admin/audit-logs?limit=${limit}${action ? `&action=${action}` : ''}`),
  transferAdmin: (data: { new_admin_email: string; confirm_email: string; reason: string }) =>
    apiClient.post<{ status: string; message: string }>('/admin/transfer', data),

  // Teacher Section Management
  getTeacherSections: () =>
    apiClient.get<Section[]>('/teachers/sections'),
  getSectionStudents: (sectionId: string) =>
    apiClient.get<Array<{ id: string; email: string; full_name: string | null; enrolled_at: string }>>(`/teachers/sections/${sectionId}/students`),
  inviteStudentToSection: (sectionId: string, data: { email: string; full_name?: string }) =>
    apiClient.post<{ status: string; message: string; invitation: Invitation }>(`/teachers/sections/${sectionId}/invite-student`, data),
  getTeacherInvitations: () =>
    apiClient.get<Invitation[]>('/teachers/invitations'),
};