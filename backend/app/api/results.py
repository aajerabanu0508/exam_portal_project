import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import TestAttempt, User, AttemptStatus
from app.schemas.schemas import ResultOut, ResultListItem, AdminStats
from app.api.deps import require_trainer
from app.api.attempts import _build_result

router = APIRouter(prefix="/api/results", tags=["results"])


@router.get("", response_model=List[ResultListItem])
def list_results(
    search: Optional[str] = Query(None),
    test_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    q = db.query(TestAttempt).filter(
        TestAttempt.status != AttemptStatus.in_progress
    )
    if test_id:
        q = q.filter(TestAttempt.test_id == test_id)

    attempts = q.order_by(TestAttempt.submitted_at.desc()).offset(skip).limit(limit).all()

    results = []
    for attempt in attempts:
        student = attempt.student
        test = attempt.test
        if search:
            search_lower = search.lower()
            if (
                search_lower not in student.name.lower()
                and search_lower not in student.email.lower()
                and search_lower not in test.name.lower()
            ):
                continue

        percentage = (attempt.score / attempt.max_score * 100) if attempt.max_score else 0
        passed = percentage >= test.passing_percentage

        results.append(ResultListItem(
            attempt_id=str(attempt.id),
            student_name=student.name,
            student_email=student.email,
            college=student.college,
            test_name=test.name,
            score=attempt.score or 0,
            max_score=attempt.max_score or 0,
            percentage=round(percentage, 1),
            total_violations=attempt.total_violations,
            status=attempt.status.value,
            submitted_at=attempt.submitted_at,
            passed=passed,
        ))
    return results


@router.get("/export/csv")
def export_csv(
    test_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    q = db.query(TestAttempt).filter(TestAttempt.status != AttemptStatus.in_progress)
    if test_id:
        q = q.filter(TestAttempt.test_id == test_id)
    attempts = q.order_by(TestAttempt.submitted_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student Name", "Email", "College", "Student ID",
        "Test Name", "Score", "Max Score", "Percentage",
        "Correct", "Wrong", "Unanswered",
        "Tab Switches", "Fullscreen Exits", "Total Violations",
        "Status", "Submitted At", "Passed"
    ])

    for attempt in attempts:
        student = attempt.student
        test = attempt.test
        percentage = (attempt.score / attempt.max_score * 100) if attempt.max_score else 0
        passed = percentage >= test.passing_percentage
        writer.writerow([
            student.name, student.email, student.college or "", student.student_id or "",
            test.name,
            attempt.score or 0, attempt.max_score or 0, round(percentage, 1),
            attempt.correct_count or 0, attempt.wrong_count or 0, attempt.unanswered_count or 0,
            attempt.tab_switches, attempt.fullscreen_exits, attempt.total_violations,
            attempt.status.value,
            attempt.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if attempt.submitted_at else "",
            "Yes" if passed else "No",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=results.csv"},
    )


@router.get("/stats/admin", response_model=AdminStats)
def admin_stats(db: Session = Depends(get_db), _=Depends(require_trainer)):
    from app.models.models import Test
    total_students = db.query(User).filter(User.role == "student").count()
    total_tests = db.query(Test).count()

    completed = db.query(TestAttempt).filter(
        TestAttempt.status != AttemptStatus.in_progress,
        TestAttempt.score != None,
    ).all()

    total_attempts = len(completed)
    scores = [a.score for a in completed if a.score is not None]
    max_scores = [a.max_score for a in completed if a.max_score is not None]

    avg_score = (sum(scores) / len(scores)) if scores else 0
    highest = max(scores) if scores else 0
    lowest = min(scores) if scores else 0

    passed = 0
    for a in completed:
        if a.max_score and a.score is not None:
            pct = a.score / a.max_score * 100
            if pct >= a.test.passing_percentage:
                passed += 1

    pass_pct = (passed / total_attempts * 100) if total_attempts else 0

    return AdminStats(
        total_students=total_students,
        total_tests=total_tests,
        total_attempts=total_attempts,
        average_score=round(avg_score, 2),
        highest_score=highest,
        lowest_score=lowest,
        pass_percentage=round(pass_pct, 1),
    )


@router.get("/{attempt_id}", response_model=ResultOut)
def get_result(
    attempt_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_trainer),
):
    attempt = db.query(TestAttempt).filter(TestAttempt.id == attempt_id).first()
    if not attempt:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Result not found")
    return _build_result(attempt, db)
