import random
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import (
    Test, Question, TestAttempt, Answer, Violation,
    AttemptStatus, ViolationType, DifficultyLevel
)
from app.schemas.schemas import (
    AttemptOut, QuestionForExam, AnswerSubmit, ViolationReport,
    SubmitAttempt, ResultOut, TopicScore
)
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/attempts", tags=["attempts"])


def _select_questions(db: Session, test: Test) -> List[Question]:
    """Select and shuffle questions according to test config."""
    query = db.query(Question).filter(Question.is_active == True)
    all_questions = query.all()

    if len(all_questions) < test.total_questions:
        return all_questions

    diff_config: Optional[dict] = test.difficulty_config
    if diff_config:
        selected = []
        by_diff = {}
        for q in all_questions:
            by_diff.setdefault(q.difficulty.value, []).append(q)

        for diff_str, count in diff_config.items():
            pool = by_diff.get(diff_str, [])
            take = min(count, len(pool))
            selected.extend(random.sample(pool, take))

        # Fill remaining slots if needed
        remaining_needed = test.total_questions - len(selected)
        if remaining_needed > 0:
            used_ids = {q.id for q in selected}
            remaining_pool = [q for q in all_questions if q.id not in used_ids]
            if remaining_pool:
                selected.extend(random.sample(remaining_pool, min(remaining_needed, len(remaining_pool))))
    else:
        selected = random.sample(all_questions, min(test.total_questions, len(all_questions)))

    random.shuffle(selected)
    return selected


def _build_shuffled_options(question: Question) -> tuple[List[str], List[int]]:
    """Return (shuffled_options, option_mapping) where mapping[i] = original_index."""
    options = [question.option_a, question.option_b, question.option_c, question.option_d]
    indices = [0, 1, 2, 3]
    combined = list(zip(options, indices))
    random.shuffle(combined)
    shuffled_opts = [c[0] for c in combined]
    original_indices = [c[1] for c in combined]
    return shuffled_opts, original_indices


@router.post("/start/{test_id}", response_model=AttemptOut)
def start_attempt(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test = db.query(Test).filter(Test.id == test_id, Test.is_active == True).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Check if student already has an in-progress attempt for this test
    existing = db.query(TestAttempt).filter(
        TestAttempt.student_id == current_user.id,
        TestAttempt.test_id == test_id,
        TestAttempt.status == AttemptStatus.in_progress,
    ).first()

    if existing:
        # Restore existing attempt
        return _build_attempt_response(existing, db)

    questions = _select_questions(db, test)
    question_ids = [str(q.id) for q in questions]

    # Build per-question shuffled option order
    question_order = {}
    for q in questions:
        _, original_indices = _build_shuffled_options(q)
        question_order[str(q.id)] = original_indices

    attempt = TestAttempt(
        id=uuid.uuid4(),
        student_id=current_user.id,
        test_id=test_id,
        status=AttemptStatus.in_progress,
        time_limit_seconds=test.duration_minutes * 60,
        question_ids=question_ids,
        question_order=question_order,
    )
    db.add(attempt)

    # Pre-create answer records
    for qid in question_ids:
        answer = Answer(
            id=uuid.uuid4(),
            attempt_id=attempt.id,
            question_id=qid,
            selected_option=None,
            is_marked_for_review=False,
        )
        db.add(answer)

    db.commit()
    db.refresh(attempt)
    return _build_attempt_response(attempt, db)


def _build_attempt_response(attempt: TestAttempt, db: Session) -> AttemptOut:
    questions_out = []
    for i, qid in enumerate(attempt.question_ids):
        q = db.query(Question).filter(Question.id == qid).first()
        if not q:
            continue
        order = attempt.question_order.get(str(qid), [0, 1, 2, 3])
        original_opts = [q.option_a, q.option_b, q.option_c, q.option_d]
        shuffled_opts = [original_opts[idx] for idx in order]
        questions_out.append(QuestionForExam(
            id=str(q.id),
            question_text=q.question_text,
            options=shuffled_opts,
            topic=q.topic,
            difficulty=q.difficulty.value,
            question_number=i + 1,
        ))

    return AttemptOut(
        id=attempt.id,
        test_id=attempt.test_id,
        status=attempt.status,
        started_at=attempt.started_at,
        time_limit_seconds=attempt.time_limit_seconds,
        questions=questions_out,
    )


@router.post("/{attempt_id}/answer")
def save_answer(
    attempt_id: str,
    payload: AnswerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.student_id == current_user.id,
        TestAttempt.status == AttemptStatus.in_progress,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Active attempt not found")

    answer = db.query(Answer).filter(
        Answer.attempt_id == attempt_id,
        Answer.question_id == payload.question_id,
    ).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Question not in this attempt")

    # Map shuffled option index back to original
    if payload.selected_option is not None:
        order = attempt.question_order.get(payload.question_id, [0, 1, 2, 3])
        original_index = order[payload.selected_option]
        answer.selected_option = original_index
    else:
        answer.selected_option = None

    answer.is_marked_for_review = payload.is_marked_for_review
    answer.answered_at = datetime.utcnow()
    db.commit()
    return {"status": "saved"}


@router.post("/{attempt_id}/violation")
def report_violation(
    attempt_id: str,
    payload: ViolationReport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.student_id == current_user.id,
        TestAttempt.status == AttemptStatus.in_progress,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Active attempt not found")

    violation = Violation(
        id=uuid.uuid4(),
        attempt_id=attempt_id,
        violation_type=payload.violation_type,
        details=payload.details,
    )
    db.add(violation)

    # Update counters
    if payload.violation_type == ViolationType.tab_switch:
        attempt.tab_switches += 1
    elif payload.violation_type == ViolationType.fullscreen_exit:
        attempt.fullscreen_exits += 1
    attempt.total_violations += 1

    db.commit()

    # Check if should auto-submit
    test = attempt.test
    should_auto_submit = (
        test.auto_submit_on_violation
        and attempt.total_violations >= test.max_violations
    )

    return {
        "violations": attempt.total_violations,
        "tab_switches": attempt.tab_switches,
        "fullscreen_exits": attempt.fullscreen_exits,
        "auto_submit": should_auto_submit,
    }


@router.post("/{attempt_id}/submit", response_model=ResultOut)
def submit_attempt(
    attempt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    auto: bool = False,
):
    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.student_id == current_user.id,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if attempt.status != AttemptStatus.in_progress:
        # Already submitted, return existing result
        return _build_result(attempt, db)

    # Server-side time validation
    elapsed = (datetime.utcnow() - attempt.started_at).total_seconds()
    grace_seconds = 30
    if elapsed > attempt.time_limit_seconds + grace_seconds:
        attempt.status = AttemptStatus.timed_out
    else:
        attempt.status = AttemptStatus.auto_submitted if auto else AttemptStatus.submitted

    attempt.submitted_at = datetime.utcnow()

    # Score calculation
    answers = db.query(Answer).filter(Answer.attempt_id == attempt_id).all()
    test = attempt.test

    correct = 0
    wrong = 0
    unanswered = 0
    topic_stats: dict = {}  # topic -> {"correct": int, "total": int}

    for ans in answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if not question:
            continue

        topic = question.topic
        if topic not in topic_stats:
            topic_stats[topic] = {"correct": 0, "total": 0}
        topic_stats[topic]["total"] += 1

        if ans.selected_option is None:
            unanswered += 1
        elif ans.selected_option == question.correct_answer:
            correct += 1
            topic_stats[topic]["correct"] += 1
        else:
            wrong += 1

    score = correct * test.marks_per_correct - wrong * test.negative_marks
    max_score = test.total_questions * test.marks_per_correct

    attempt.score = score
    attempt.max_score = max_score
    attempt.correct_count = correct
    attempt.wrong_count = wrong
    attempt.unanswered_count = unanswered
    attempt.topic_scores = topic_stats

    db.commit()
    db.refresh(attempt)
    return _build_result(attempt, db)


def _build_result(attempt: TestAttempt, db: Session) -> ResultOut:
    student = attempt.student
    test = attempt.test
    topic_scores = []
    if attempt.topic_scores:
        for topic, stats in attempt.topic_scores.items():
            total = stats["total"]
            corr = stats["correct"]
            pct = (corr / total * 100) if total > 0 else 0
            topic_scores.append(TopicScore(
                topic=topic, correct=corr, total=total, percentage=round(pct, 1)
            ))

    percentage = (attempt.score / attempt.max_score * 100) if attempt.max_score else 0
    passed = percentage >= test.passing_percentage

    return ResultOut(
        attempt_id=str(attempt.id),
        student_name=student.name,
        student_email=student.email,
        college=student.college,
        test_name=test.name,
        score=attempt.score or 0,
        max_score=attempt.max_score or 0,
        percentage=round(percentage, 1),
        correct_count=attempt.correct_count or 0,
        wrong_count=attempt.wrong_count or 0,
        unanswered_count=attempt.unanswered_count or 0,
        tab_switches=attempt.tab_switches,
        fullscreen_exits=attempt.fullscreen_exits,
        total_violations=attempt.total_violations,
        topic_scores=topic_scores,
        status=attempt.status.value,
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        passed=passed,
    )
