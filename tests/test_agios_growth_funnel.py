import tempfile
import time
import unittest
from pathlib import Path

from agios.config import load_config
from agios.events import EventJournal
from agios.growth_funnel import GrowthFunnelStore
from agios.operational import HermesExecutionResult, OperationalError, OperationalService

ROOT = Path(__file__).resolve().parents[1]


class GrowthFunnelStoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = GrowthFunnelStore(Path(self.temp.name) / "funnel.sqlite3")

    def tearDown(self):
        self.temp.cleanup()

    def test_draft_lifecycle_waits_for_owner_review_before_approval(self):
        draft = self.store.create_draft(
            agent_id="writer",
            business_id="growth-studio",
            channel="social",
            objective="Announce the studio launch",
            body="We just opened our doors. Follow along.",
        )
        self.assertEqual("draft", draft["status"])
        submitted = self.store.submit_draft(draft["draft_id"])
        self.assertEqual("awaiting_owner_review", submitted["status"])
        approved = self.store.review_draft(draft["draft_id"], approved=True)
        self.assertEqual("approved", approved["status"])
        self.assertIsNotNone(approved["reviewed_at"])

    def test_draft_rejects_credential_material(self):
        with self.assertRaisesRegex(ValueError, "credential"):
            self.store.create_draft(
                agent_id="writer",
                business_id="growth-studio",
                channel="email",
                objective="Send account details",
                body="Use sk-abcdefghijklmnopqrstuvwx to log in.",
            )

    def test_draft_cannot_review_twice(self):
        draft = self.store.create_draft(
            agent_id="writer",
            business_id="growth-studio",
            channel="landing",
            objective="Ship the landing copy",
            body="Landing copy draft.",
        )
        self.store.submit_draft(draft["draft_id"])
        self.store.review_draft(draft["draft_id"], approved=True)
        with self.assertRaisesRegex(ValueError, "not awaiting"):
            self.store.review_draft(draft["draft_id"], approved=True)

    def test_lead_advance_requires_evidence_to_close(self):
        lead = self.store.create_lead(
            agent_id="closer",
            business_id="growth-studio",
            contact_label="Perfume import lead (initial email)",
            source="instagram-comment",
        )
        self.assertEqual("captured", lead["stage"])
        qualified = self.store.advance_lead(lead["lead_id"], "qualified")
        self.assertEqual("qualified", qualified["stage"])
        self.store.advance_lead(lead["lead_id"], "outreach_drafted")
        self.store.advance_lead(lead["lead_id"], "awaiting_approval")
        approved = self.store.advance_lead(lead["lead_id"], "approved")
        self.assertEqual("approved", approved["stage"])
        with self.assertRaisesRegex(ValueError, "evidence"):
            self.store.advance_lead(lead["lead_id"], "closed")
        closed = self.store.advance_lead(
            lead["lead_id"], "closed", evidence_run_ids=["run-1"]
        )
        self.assertEqual("closed", closed["stage"])
        self.assertEqual(["run-1"], closed["evidence_run_ids"])

    def test_lead_rejects_illegal_stage_jumps(self):
        lead = self.store.create_lead(
            agent_id="closer",
            business_id="growth-studio",
            contact_label="Some label",
            source="form",
        )
        with self.assertRaisesRegex(ValueError, "cannot move"):
            self.store.advance_lead(lead["lead_id"], "approved")


class GrowthFunnelServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.state = Path(self.temp.name)
        self.calls = []

        def runner(run, memory_context, skill_context, workspace):
            self.calls.append(run["agent_id"])
            return HermesExecutionResult("completed", "Verified result", None, "session-1")

        self.service = OperationalService(
            config=load_config(ROOT / "configs" / "agios.json"),
            state_dir=self.state,
            runner=runner,
            skill_loader=lambda selected: ("", tuple(selected)),
        )

    def tearDown(self):
        self.service.executor.shutdown(wait=True)
        self.temp.cleanup()

    def completed_run(self, agent_id: str):
        run = self.service.create_run(
            mode="chat",
            agent_id=agent_id,
            objective="Complete a bounded growth evidence run",
            data_class="internal",
        )
        for _ in range(100):
            current = self.service.sessions.get(run["run_id"])
            if current["status"] not in {"queued", "running"}:
                return current
            time.sleep(0.01)
        self.fail("run did not finish")

    def test_writer_creates_and_owner_reviews_content_draft(self):
        draft = self.service.create_content_draft(
            agent_id="writer",
            business_id="growth-studio",
            channel="social",
            objective="Announce the studio",
            body="We just opened our doors. Follow along.",
        )
        self.assertEqual("draft", draft["status"])
        submitted = self.service.submit_content_draft(draft["draft_id"])
        self.assertEqual("awaiting_owner_review", submitted["status"])
        approved = self.service.review_content_draft(draft["draft_id"], approved=True)
        self.assertEqual("approved", approved["status"])
        with EventJournal(self.service.journal_path) as journal:
            kinds = [event.kind for event in journal.events()]
        self.assertIn("growth.draft_created", kinds)
        self.assertIn("growth.draft_submitted", kinds)
        self.assertIn("growth.draft_reviewed", kinds)

    def test_only_writer_role_can_author_content_drafts(self):
        with self.assertRaisesRegex(OperationalError, "not authorized"):
            self.service.create_content_draft(
                agent_id="closer",
                business_id="growth-studio",
                channel="social",
                objective="Try to write",
                body="Not allowed.",
            )

    def test_only_closer_role_can_capture_leads(self):
        with self.assertRaisesRegex(OperationalError, "not authorized"):
            self.service.capture_lead(
                agent_id="writer",
                business_id="growth-studio",
                contact_label="Some label",
                source="form",
            )

    def test_lead_close_requires_completed_evidence_run_by_closer(self):
        lead = self.service.capture_lead(
            agent_id="closer",
            business_id="growth-studio",
            contact_label="Perfume import lead (initial email)",
            source="instagram-comment",
        )
        evidence = self.completed_run("closer")
        for stage in ("qualified", "outreach_drafted", "awaiting_approval", "approved"):
            lead = self.service.advance_lead(
                lead["lead_id"], agent_id="closer", stage=stage
            )
        closed = self.service.advance_lead(
            lead["lead_id"],
            agent_id="closer",
            stage="closed",
            evidence_run_ids=[evidence["run_id"]],
        )
        self.assertEqual("closed", closed["stage"])
        with EventJournal(self.service.journal_path) as journal:
            serialized = repr([event.payload for event in journal.events()])
        self.assertNotIn("Perfume import lead", serialized)
        self.assertNotIn("initial email", serialized)

    def test_lead_evidence_must_be_a_completed_run_by_same_agent(self):
        lead = self.service.capture_lead(
            agent_id="closer",
            business_id="growth-studio",
            contact_label="Some label",
            source="form",
        )
        with self.assertRaisesRegex(OperationalError, "completed run"):
            self.service.advance_lead(
                lead["lead_id"],
                agent_id="closer",
                stage="closed",
                evidence_run_ids=["unknown-run"],
            )


if __name__ == "__main__":
    unittest.main()
