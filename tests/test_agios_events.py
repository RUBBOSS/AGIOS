import sqlite3
import tempfile
import unittest
from pathlib import Path

from agios.events import (
    EventJournal,
    EventStoreError,
    UnsafeEventPayload,
    read_journal_summary,
)


class EventJournalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / "events.sqlite3"

    def tearDown(self):
        self.temp.cleanup()

    def test_journal_is_append_only_hash_chained_and_queryable_as_aggregates(self):
        with EventJournal(self.path) as journal:
            first = journal.append(
                kind="workflow.created",
                actor_id="default",
                subject_id="task-1",
                correlation_id="flow-1",
                payload={"objective_digest": "a" * 64},
                idempotency_key="create-flow-1",
            )
            second = journal.append(
                kind="route.selected",
                actor_id="agios-router",
                subject_id="task-1",
                correlation_id="flow-1",
                causation_id=first.event_id,
                payload={"model_id": "qwen3.5-hermes", "cost_status": "local-unpriced"},
                idempotency_key="route-flow-1",
            )
            self.assertEqual(first.event_hash, second.previous_hash)
            self.assertTrue(journal.verify_chain())
            with self.assertRaises(sqlite3.DatabaseError):
                journal.connection.execute("UPDATE events SET kind='tampered' WHERE sequence=1")
            journal.connection.rollback()
            with self.assertRaises(sqlite3.DatabaseError):
                journal.connection.execute("DELETE FROM events WHERE sequence=1")
            journal.connection.rollback()

        summary = read_journal_summary(self.path)
        self.assertEqual("available", summary["status"])
        self.assertEqual(2, summary["event_count"])
        self.assertEqual(1, summary["route_decision_count"])
        self.assertNotIn("model_id", summary)

    def test_idempotency_replays_same_event_and_rejects_changed_payload(self):
        with EventJournal(self.path) as journal:
            first = journal.append(
                kind="work.result",
                actor_id="researcher",
                subject_id="task-1",
                correlation_id="flow-1",
                payload={"worker_id": "researcher", "result_ref": "artifact:one"},
                idempotency_key="result-1",
            )
            replay = journal.append(
                kind="work.result",
                actor_id="researcher",
                subject_id="task-1",
                correlation_id="flow-1",
                payload={"worker_id": "researcher", "result_ref": "artifact:one"},
                idempotency_key="result-1",
            )
            self.assertEqual(first.event_id, replay.event_id)
            self.assertEqual(1, journal.summary()["event_count"])
            with self.assertRaisesRegex(EventStoreError, "different event"):
                journal.append(
                    kind="work.result",
                    actor_id="researcher",
                    subject_id="task-1",
                    correlation_id="flow-1",
                    payload={"worker_id": "researcher", "result_ref": "artifact:changed"},
                    idempotency_key="result-1",
                )

    def test_payload_rejects_secrets_raw_messages_and_oversized_values(self):
        with EventJournal(self.path) as journal:
            with self.assertRaises(UnsafeEventPayload):
                journal.append(
                    kind="unsafe",
                    actor_id="default",
                    subject_id="task-1",
                    correlation_id="flow-1",
                    payload={"api_key": "not-even-a-real-key"},
                )
            with self.assertRaises(UnsafeEventPayload):
                journal.append(
                    kind="unsafe",
                    actor_id="default",
                    subject_id="task-1",
                    correlation_id="flow-1",
                    payload={"message": "raw customer text"},
                )
            with self.assertRaises(UnsafeEventPayload):
                journal.append(
                    kind="unsafe",
                    actor_id="default",
                    subject_id="task-1",
                    correlation_id="flow-1",
                    payload={"note": "x" * 2049},
                )

    def test_recovery_replays_pending_handoffs_after_restart(self):
        with EventJournal(self.path) as journal:
            journal.append(
                kind="handoff.created",
                actor_id="default",
                subject_id="task-1",
                correlation_id="flow-1",
                payload={"recipient_id": "researcher"},
                idempotency_key="handoff-1",
            )
        with EventJournal(self.path) as recovered:
            self.assertEqual(("researcher",), recovered.recovery_plan("flow-1"))
            recovered.append(
                kind="work.result",
                actor_id="researcher",
                subject_id="task-1",
                correlation_id="flow-1",
                payload={"worker_id": "researcher", "result_ref": "artifact:result"},
                idempotency_key="result-1",
            )
            self.assertEqual((), recovered.recovery_plan("flow-1"))


if __name__ == "__main__":
    unittest.main()
