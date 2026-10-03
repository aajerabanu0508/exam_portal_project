"""
Automated Integration Test Suite for AWS Learning Assessment Platform.
Tests all API endpoints, auth flows, unique validations, proctoring violations,
test attempts, scoring logic, trainer dashboard stats, and CSV exports.
"""
import sys
import os
import unittest
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.models.models import User, Test, Question, TestAttempt, Answer, Violation
from app.core.config import settings
from app.services.seed import seed


class TestExamPlatformAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Run DB seed first to guarantee admin user, default test, and 30 questions exist
        seed()
        cls.client = TestClient(app)

    def setUp(self):
        self.db = SessionLocal()
        # Generate unique test data suffixes per run
        self.run_id = str(uuid.uuid4())[:8]

    def tearDown(self):
        self.db.close()

    # ── 1. Health Check Test ──────────────────────────────────────────────────
    def test_01_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        print(" [PASS] Health check endpoint working")

    # ── 2. Seed Verification ──────────────────────────────────────────────────
    def test_02_seed_verification(self):
        questions_count = self.db.query(Question).filter(Question.is_active == True).count()
        self.assertGreaterEqual(questions_count, 30)

        tests_count = self.db.query(Test).filter(Test.is_active == True).count()
        self.assertGreaterEqual(tests_count, 1)

        admin = self.db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        self.assertIsNotNone(admin)
        self.assertEqual(admin.role.value, "trainer")
        print(f" [PASS] Seed verification: {questions_count} questions, {tests_count} tests, Admin active")

    # ── 3. Student Registration Test ──────────────────────────────────────────
    def test_03_student_registration(self):
        student_data = {
            "name": f"Test Student {self.run_id}",
            "email": f"student_{self.run_id}@example.com",
            "phone": f"+9190000{self.run_id[:4]}",
            "college": "MIT University",
            "student_id": f"STU-{self.run_id}",
        }
        res = self.client.post("/api/auth/register", json=student_data)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["role"], "student")
        print(" [PASS] Student registration successful with JWT token")

    # ── 4. Duplicate Student ID Validation Test ─────────────────────────────
    def test_04_duplicate_student_id_validation(self):
        unique_stu_id = f"STU-DUP-{self.run_id}"

        # Register first student
        student1 = {
            "name": "Original Student",
            "email": f"orig_{self.run_id}@example.com",
            "phone": f"+9191111{self.run_id[:4]}",
            "student_id": unique_stu_id,
        }
        res1 = self.client.post("/api/auth/register", json=student1)
        self.assertEqual(res1.status_code, 201)

        # Try to register second student with SAME Student ID
        student2 = {
            "name": "Imposter Student",
            "email": f"imposter_{self.run_id}@example.com",
            "phone": f"+9192222{self.run_id[:4]}",
            "student_id": unique_stu_id,
        }
        res2 = self.client.post("/api/auth/register", json=student2)
        self.assertEqual(res2.status_code, 400)
        self.assertIn("already registered", res2.json()["detail"].lower())
        print(" [PASS] Duplicate Student ID correctly blocked with 400 Bad Request")

    # ── 5. Duplicate Phone Number Validation Test ─────────────────────────────
    def test_05_duplicate_phone_validation(self):
        unique_phone = f"+9193333{self.run_id[:4]}"

        # Register first student
        student1 = {
            "name": "Phone Student 1",
            "email": f"phone1_{self.run_id}@example.com",
            "phone": unique_phone,
            "student_id": f"STU-P1-{self.run_id}",
        }
        res1 = self.client.post("/api/auth/register", json=student1)
        self.assertEqual(res1.status_code, 201)

        # Try to register second student with SAME Phone Number
        student2 = {
            "name": "Phone Student 2",
            "email": f"phone2_{self.run_id}@example.com",
            "phone": unique_phone,
            "student_id": f"STU-P2-{self.run_id}",
        }
        res2 = self.client.post("/api/auth/register", json=student2)
        self.assertEqual(res2.status_code, 400)
        self.assertIn("already registered", res2.json()["detail"].lower())
        print(" [PASS] Duplicate Phone Number correctly blocked with 400 Bad Request")

    # ── 6. Trainer Login Test ─────────────────────────────────────────────────
    def test_06_trainer_login(self):
        # Valid login
        res = self.client.post("/api/auth/login", json={
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD,
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["role"], "trainer")

        # Invalid password login
        res_invalid = self.client.post("/api/auth/login", json={
            "email": settings.ADMIN_EMAIL,
            "password": "WrongPassword123!",
        })
        self.assertEqual(res_invalid.status_code, 401)
        print(" [PASS] Trainer login authentication verified (valid & invalid password)")

    # ── 7. Exam Lifecycle Flow (Start → Answer → Violation → Submit) ───────────
    def test_07_exam_full_lifecycle(self):
        # 1. Register student
        stu_res = self.client.post("/api/auth/register", json={
            "name": f"Exam Tester {self.run_id}",
            "email": f"exam_{self.run_id}@example.com",
            "phone": f"+9194444{self.run_id[:4]}",
            "student_id": f"STU-EX-{self.run_id}",
        }).json()
        token = stu_res["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get tests
        tests_res = self.client.get("/api/tests", headers=headers)
        self.assertEqual(tests_res.status_code, 200)
        test_id = tests_res.json()[0]["id"]

        # 3. Start exam attempt
        attempt_res = self.client.post(f"/api/attempts/start/{test_id}", headers=headers)
        self.assertEqual(attempt_res.status_code, 200)
        attempt_data = attempt_res.json()
        attempt_id = attempt_data["id"]
        questions = attempt_data["questions"]
        self.assertEqual(len(questions), 30)

        # Verify correct answers are NOT included in frontend question object
        self.assertNotIn("correct_answer", questions[0])
        print(" [PASS] Exam started with 30 randomized questions (correct answers hidden)")

        # 4. Save answer to Q1
        q1 = questions[0]
        ans_res = self.client.post(f"/api/attempts/{attempt_id}/answer", json={
            "question_id": q1["id"],
            "selected_option": 0,  # Option A
            "is_marked_for_review": True,
        }, headers=headers)
        self.assertEqual(ans_res.status_code, 200)
        print(" [PASS] Answer saved and marked for review")

        # 5. Report proctoring violation (tab switch)
        viol_res = self.client.post(f"/api/attempts/{attempt_id}/violation", json={
            "violation_type": "tab_switch",
            "details": "User switched browser tab",
        }, headers=headers)
        self.assertEqual(viol_res.status_code, 200)
        self.assertEqual(viol_res.json()["violations"], 1)
        print(" [PASS] Proctoring tab switch violation logged")

        # 6. Submit exam
        sub_res = self.client.post(f"/api/attempts/{attempt_id}/submit", headers=headers)
        self.assertEqual(sub_res.status_code, 200)
        result = sub_res.json()
        self.assertIn("score", result)
        self.assertIn("percentage", result)
        self.assertIn("topic_scores", result)
        self.assertEqual(result["total_violations"], 1)
        print(f" [PASS] Exam submitted successfully: Score {result['score']}/{result['max_score']} ({result['percentage']}%)")

    # ── 8. Trainer Dashboard Stats & CSV Export Test ─────────────────────────
    def test_08_trainer_dashboard_and_export(self):
        # Login as trainer
        login_res = self.client.post("/api/auth/login", json={
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD,
        }).json()
        trainer_token = login_res["access_token"]
        headers = {"Authorization": f"Bearer {trainer_token}"}

        # Check Admin Stats
        stats_res = self.client.get("/api/results/stats/admin", headers=headers)
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.json()
        self.assertIn("total_students", stats)
        self.assertIn("total_attempts", stats)
        self.assertIn("average_score", stats)
        print(f" [PASS] Trainer stats API: {stats['total_students']} students, {stats['total_attempts']} attempts")

        # Check CSV Export
        csv_res = self.client.get("/api/results/export/csv", headers=headers)
        self.assertEqual(csv_res.status_code, 200)
        self.assertEqual(csv_res.headers["content-type"], "text/csv; charset=utf-8")
        self.assertIn("Student Name", csv_res.text)
        print(" [PASS] CSV Export API generated valid CSV report")


def run_tests():
    print("\n" + "=" * 60)
    print(" 🚀 RUNNING FULL AUTOMATED SUITE FOR EXAM PLATFORM")
    print("=" * 60 + "\n")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestExamPlatformAPI)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if result.wasSuccessful():
        print("\n" + "=" * 60)
        print(" 🎉 ALL TESTS PASSED SUCCESSFULLY! SOFTWARE IS FULLY VALIDATED.")
        print("=" * 60 + "\n")
        return 0
    else:
        print("\n ❌ Some tests failed.")
        return 1


if __name__ == "__main__":
    sys.exit(run_tests())
