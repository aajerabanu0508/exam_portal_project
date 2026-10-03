import enum
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Float,
    ForeignKey, Enum, Text, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database.session import Base


class UserRole(str, enum.Enum):
    student = "student"
    trainer = "trainer"
    admin = "admin"


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class AttemptStatus(str, enum.Enum):
    in_progress = "in_progress"
    submitted = "submitted"
    auto_submitted = "auto_submitted"
    timed_out = "timed_out"


class ViolationType(str, enum.Enum):
    tab_switch = "tab_switch"
    fullscreen_exit = "fullscreen_exit"
    copy_attempt = "copy_attempt"
    paste_attempt = "paste_attempt"
    right_click = "right_click"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True, unique=True, index=True)
    college = Column(String(255), nullable=True)
    student_id = Column(String(100), nullable=True, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("TestAttempt", back_populates="student")


class Test(Base):
    __tablename__ = "tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=30)
    total_questions = Column(Integer, default=30)
    marks_per_correct = Column(Float, default=1.0)
    negative_marks = Column(Float, default=0.0)
    passing_percentage = Column(Float, default=50.0)
    max_violations = Column(Integer, default=3)
    auto_submit_on_violation = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    difficulty_config = Column(JSON, nullable=True)  # {"easy": 10, "medium": 15, "hard": 5}
    topic_config = Column(JSON, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("TestAttempt", back_populates="test")


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answer = Column(Integer, nullable=False)  # 0=A, 1=B, 2=C, 3=D
    explanation = Column(Text, nullable=True)
    topic = Column(String(100), nullable=False)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.medium)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id"), nullable=False)
    status = Column(Enum(AttemptStatus), default=AttemptStatus.in_progress)
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    time_limit_seconds = Column(Integer, nullable=False)
    question_ids = Column(JSON, nullable=False)  # ordered list of question UUIDs
    question_order = Column(JSON, nullable=False)  # shuffled option indices per question

    # Results (computed on submit)
    score = Column(Float, nullable=True)
    max_score = Column(Float, nullable=True)
    correct_count = Column(Integer, nullable=True)
    wrong_count = Column(Integer, nullable=True)
    unanswered_count = Column(Integer, nullable=True)
    topic_scores = Column(JSON, nullable=True)

    # Violations
    tab_switches = Column(Integer, default=0)
    fullscreen_exits = Column(Integer, default=0)
    total_violations = Column(Integer, default=0)

    student = relationship("User", back_populates="attempts")
    test = relationship("Test", back_populates="attempts")
    answers = relationship("Answer", back_populates="attempt")
    violations = relationship("Violation", back_populates="attempt")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("test_attempts.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    selected_option = Column(Integer, nullable=True)  # None = unanswered, 0-3 = A-D
    is_marked_for_review = Column(Boolean, default=False)
    answered_at = Column(DateTime, nullable=True)

    attempt = relationship("TestAttempt", back_populates="answers")


class Violation(Base):
    __tablename__ = "violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("test_attempts.id"), nullable=False)
    violation_type = Column(Enum(ViolationType), nullable=False)
    occurred_at = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

    attempt = relationship("TestAttempt", back_populates="violations")
