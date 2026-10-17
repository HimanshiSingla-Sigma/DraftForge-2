class ApiEndpoints {
  // Authentication & Invitations
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String verifyInvitation = '/invitations/verify';
  static const String acceptInvitation = '/invitations/accept';

  // Drafts
  static const String drafts = '/drafts';
  static const String uploadDraft = '/drafts/upload';
  static String draftDetail(String id) => '/drafts/$id';
  static String addDraftVersion(String id) => '/drafts/$id/versions';

  // Evaluations & Loopholes
  static const String evaluations = '/evaluations';
  static String evaluationDetail(String id) => '/evaluations/$id';
  static String loopholes(String evaluationId) => '/loopholes/$evaluationId';

  // AI Assistance & Tutor
  static const String assistDrafting = '/ai/assist-drafting';
  static const String explainEvaluation = '/ai/explain-evaluation';
  static const String conversations = '/conversations';
  static String conversationMessages(String id) => '/conversations/$id/messages';
  static const String sendChatMessage = '/chat/send';

  // Coursework & Assignments
  static const String assignments = '/assignments';
  static String assignmentDetail(String id) => '/assignments/$id';
  static const String submissions = '/submissions';

  // Progress & Skills
  static const String progress = '/progress';
  static const String skills = '/skills/my-skills';
  static const String roadmap = '/roadmap';
  static const String quizzes = '/quizzes';

  // Health
  static const String health = '/health';
}
