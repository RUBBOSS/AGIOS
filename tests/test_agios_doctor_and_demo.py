import tempfile
import unittest
from pathlib import Path

from agios.demo import run_demo
from agios.doctor import run_doctor
from agios.events import EventJournal


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "agios.json"


class DoctorTests(unittest.TestCase):
    def test_doctor_reports_known_retired_profile_without_failing_privacy(self):
        report = run_doctor(config_path=CONFIG_PATH, profiles_dir=ROOT / "configs")

        self.assertEqual("warning", report["status"])
        checks = {check["id"]: check for check in report["checks"]}
        self.assertEqual("warning", checks["profile-drift"]["status"])
        self.assertIn("localworker", checks["profile-drift"]["detail"])
        self.assertEqual("healthy", checks["privacy-routing"]["status"])
        self.assertEqual("not-configured", checks["event-journal"]["status"])
        self.assertEqual(9, report["inventory"]["agent_count"])

    def test_doctor_reads_only_aggregate_journal_health(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "events.sqlite3"
            with EventJournal(path) as journal:
                journal.append(
                    kind="workflow.created",
                    actor_id="default",
                    subject_id="task-1",
                    correlation_id="flow-1",
                    payload={"objective_digest": "a" * 64},
                )
            report = run_doctor(
                config_path=CONFIG_PATH,
                profiles_dir=ROOT / "configs",
                journal_path=path,
            )
            self.assertEqual(1, report["journal"]["event_count"])
            self.assertNotIn("payload", report["journal"])


class DemonstrationTests(unittest.TestCase):
    def test_demo_delegates_recovers_and_keeps_customer_data_local(self):
        result = run_demo(config_path=CONFIG_PATH)

        self.assertEqual("passed", result["status"])
        self.assertEqual(["researcher", "reviewer"], result["delegated_agents"])
        self.assertEqual(["reviewer"], result["recovered_recipients"])
        self.assertTrue(result["external_customer_data_blocked"])
        self.assertEqual("local", result["customer_route_location"])
        self.assertEqual("qwen3.5-hermes", result["customer_route"])
        self.assertEqual("healthy", result["journal"]["status"])
        self.assertEqual(3, result["journal"]["route_decision_count"])


if __name__ == "__main__":
    unittest.main()
