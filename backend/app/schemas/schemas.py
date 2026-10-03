from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.models.models import UserRole, DifficultyLevel, AttemptStatus, ViolationType


# ── Auth ──────────────────────────────────────────────────────────────────────

class StudentRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: str
    phone: Optional[str] = None
    college: Optional[str] = None
    student_id: Optional[str] = None


class TrainerLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str]
    college: Optional[str]
    student_id: Optional[str]
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


# ── Test ──────────────────────────────────────────────────────────────────────

class TestCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int = 30
    total_questions: int = 30
    marks_per_correct: float = 1.0
    negative_marks: float = 0.0
    passing_percentage: float = 50.0
    max_violations: int = 3
    auto_submit_on_violation: bool = True
    difficulty_config: Optional[Dict[str, int]] = None
    topic_config: Optional[List[str]] = None


class TestUpdate(TestCreate):
    pass


class TestOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    duration_minutes: int
    total_questions: int
    marks_per_correct: float
    negative_marks: float
    passing_percentage: float
    max_violations: int
    auto_submit_on_violation: bool
    is_active: bool
    difficulty_config: Optional[Dict]
    topic_config: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Question ──────────────────────────────────────────────────────────────────

class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: int = Field(..., ge=0, le=3)
    explanation: Optional[str] = None
    topic: str
    difficulty: DifficultyLevel = DifficultyLevel.medium


class QuestionUpdate(QuestionCreate):
    pass


class QuestionOut(BaseModel):
    id: UUID
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: int
    explanation: Optional[str]
    topic: str
    difficulty: DifficultyLevel
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Question sent to frontend during exam (NO correct_answer)
class QuestionForExam(BaseModel):
    id: str
    question_text: str
    options: List[str]  # shuffled A-D options
    topic: str
    difficulty: str
    question_number: int


# ── Attempt ───────────────────────────────────────────────────────────────────

class AttemptStart(BaseModel):
    test_id: str


class AttemptOut(BaseModel):
    id: UUID
    test_id: UUID
    status: AttemptStatus
    started_at: datetime
    time_limit_seconds: int
    questions: List[QuestionForExam]

    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    question_id: str
    selected_option: Optional[int] = None  # None = unanswered
    is_marked_for_review: bool = False


class ViolationReport(BaseModel):
    violation_type: ViolationType
    details: Optional[str] = None


class SubmitAttempt(BaseModel):
    answers: List[AnswerSubmit]


# ── Result ────────────────────────────────────────────────────────────────────

class TopicScore(BaseModel):
    topic: str
    correct: int
    total: int
    percentage: float


class ResultOut(BaseModel):
    attempt_id: str
    student_name: str
    student_email: str
    college: Optional[str]
    test_name: str
    score: float
    max_score: float
    percentage: float
    correct_count: int
    wrong_count: int
    unanswered_count: int
    tab_switches: int
    fullscreen_exits: int
    total_violations: int
    topic_scores: List[TopicScore]
    status: str
    started_at: datetime
    submitted_at: Optional[datetime]
    passed: bool

    class Config:
        from_attributes = True


# ── Admin Stats ───────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_students: int
    total_tests: int
    total_attempts: int
    average_score: float
    highest_score: float
    lowest_score: float
    pass_percentage: float


class ResultListItem(BaseModel):
    attempt_id: str
    student_name: str
    student_email: str
    college: Optional[str]
    test_name: str
    score: float
    max_score: float
    percentage: float
    total_violations: int
    status: str
    submitted_at: Optional[datetime]
    passed: bool

    class Config:
        from_attributes = True
