export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  student_id?: string;
  role: 'student' | 'trainer' | 'admin';
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface Test {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  marks_per_correct: number;
  negative_marks: number;
  passing_percentage: number;
  max_violations: number;
  auto_submit_on_violation: boolean;
  is_active: boolean;
  difficulty_config?: Record<string, number>;
  created_at: string;
}

export interface QuestionForExam {
  id: string;
  question_text: string;
  options: string[];   // already shuffled, A-D
  topic: string;
  difficulty: string;
  question_number: number;
}

export interface AttemptResponse {
  id: string;
  test_id: string;
  status: string;
  started_at: string;
  time_limit_seconds: number;
  questions: QuestionForExam[];
}

export interface AnswerState {
  selected_option: number | null;  // 0-3 (shuffled index)
  is_marked_for_review: boolean;
}

export type QuestionStatus = 'not-visited' | 'answered' | 'marked' | 'answered-marked';

export interface TopicScore {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamResult {
  attempt_id: string;
  student_name: string;
  student_email: string;
  college?: string;
  test_name: string;
  score: number;
  max_score: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  tab_switches: number;
  fullscreen_exits: number;
  total_violations: number;
  topic_scores: TopicScore[];
  status: string;
  started_at: string;
  submitted_at?: string;
  passed: boolean;
}

export interface AdminStats {
  total_students: number;
  total_tests: number;
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_percentage: number;
}

export interface ResultListItem {
  attempt_id: string;
  student_name: string;
  student_email: string;
  college?: string;
  test_name: string;
  score: number;
  max_score: number;
  percentage: number;
  total_violations: number;
  status: string;
  submitted_at?: string;
  passed: boolean;
}

export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  explanation?: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
}

export interface ViolationState {
  tabSwitches: number;
  fullscreenExits: number;
  total: number;
}
