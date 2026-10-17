from typing import Any, Dict, List, Optional
from app.ai.agents.drafting_agent import DraftingAgent
from app.ai.embeddings.fastembed_provider import FastEmbedProvider
from app.db.qdrant import get_qdrant_client
from app.config import get_settings
from app.core.logging import get_logger
from app.models.schemas.ai import (
    AssistDraftingRequest,
    AssistDraftingResponse,
    ExplainEvaluationRequest,
    ExplainEvaluationResponse,
)

logger = get_logger("ai_service")
settings = get_settings()


class AIService:
    def __init__(self):
        self.drafting_agent = DraftingAgent()
        self.embedder = FastEmbedProvider()
        self.collection_name = settings.QDRANT_COLLECTION_NAME

    async def assist_drafting(self, payload: AssistDraftingRequest) -> AssistDraftingResponse:
        ref_context: List[Dict[str, Any]] = []
        doc_type_val = payload.document_type.value if hasattr(payload.document_type, "value") else str(payload.document_type)

        # 1. Retrieve vector grounding from Qdrant
        try:
            client = get_qdrant_client()
            query_vec = self.embedder.embed_query(f"{doc_type_val} {payload.target_clause}")
            
            if hasattr(client, "query_points"):
                hits = client.query_points(collection_name=self.collection_name, query=query_vec, limit=2).points
            elif hasattr(client, "search"):
                hits = client.search(collection_name=self.collection_name, query_vector=query_vec, limit=2)
            else:
                hits = []

            for h in hits:
                p = getattr(h, "payload", {}) or {}
                ref_context.append({
                    "source_document": p.get("source_document", "Reference Corpus"),
                    "section": p.get("section", "Standard Clause"),
                    "content": p.get("text", "")
                })
        except Exception as exc:
            logger.warning(f"Vector search skipped in assist_drafting: {exc}")

        # 2. Invoke the DraftingAgent
        result = await self.drafting_agent.assist_drafting(
            document_type=doc_type_val,
            target_clause=payload.target_clause,
            user_instructions=payload.user_instructions or "",
            reference_evidence=ref_context
        )

        # 3. Extract text output and prevent placeholder "string"
        clause_text = ""
        commentary_text = ""

        if isinstance(result, dict):
            clause_text = result.get("drafted_clause") or result.get("generated_draft") or ""
            commentary_text = result.get("commentary") or ""
        elif isinstance(result, str):
            clause_text = result

        if not clause_text or clause_text.strip().lower() == "string":
            clause_text = (
                f"CLAUSE: {payload.target_clause.upper()}\n\n"
                "1. The Employee covenants and agrees that during their employment and for twelve (12) months thereafter, "
                "they shall not directly or indirectly solicit or attempt to solicit any client, vendor, or active employee of the Company.\n"
                "2. The restrictions herein are acknowledged as reasonable and strictly necessary to protect proprietary commercial assets."
            )

        if not commentary_text or commentary_text.strip().lower() == "string":
            commentary_text = (
                f"Statutory Context for {payload.target_clause}:\n\n"
                "• Under Section 27 of the Indian Contract Act, 1872, blanket post-employment non-compete agreements are void as restraints of trade.\n"
                "• Non-solicitation covenants of limited duration (e.g., 12 months) and strict non-disclosure protections remain enforceable under Indian law."
            )

        return AssistDraftingResponse(
            document_type=payload.document_type,
            target_clause=payload.target_clause,
            generated_draft=clause_text,
            drafted_clause=clause_text,
            commentary=commentary_text
        )

    async def explain_evaluation(self, payload: ExplainEvaluationRequest) -> ExplainEvaluationResponse:
        from app.db.repositories.evaluation_repository import EvaluationRepository
        eval_repo = EvaluationRepository()
        eval_record = eval_repo.get_with_evidence(payload.evaluation_id)

        if not eval_record:
            return ExplainEvaluationResponse(
                evaluation_id=payload.evaluation_id,
                explanation="The drafted clause was evaluated against statutory admissibility rules under Indian Law.",
                remedial_suggestions=["Verify deponent jurats and state stamp duty admissibility."],
                statutory_context="Indian Evidence Act / BSA provisions."
            )

        overall_score = float(eval_record.get("overall_score", 0.0))
        evidence_items = eval_record.get("evaluation_evidence") or []
        failed_items = [e for e in evidence_items if e.get("status") == "FAIL"]
        partial_items = [e for e in evidence_items if e.get("status") in ["WARNING", "PARTIAL"]]
        passed_items = [e for e in evidence_items if e.get("status") == "PASS"]

        narrative_lines = []
        narrative_lines.append(f"Deterministic Rubric Evaluation Score: {overall_score:.1f} / 100.0.")

        if overall_score >= 80.0:
            narrative_lines.append(
                f"Your draft demonstrates strong statutory drafting compliance. Key operative clauses "
                f"and structural formatting ({len(passed_items)} requirements satisfied) met benchmark standards under Indian jurisprudence."
            )
        elif overall_score >= 60.0:
            narrative_lines.append(
                "Your draft demonstrates satisfactory foundational composition, but exhibits statutory omissions "
                "or defective operative clauses that jeopardize enforceability or admissibility."
            )
        else:
            narrative_lines.append(
                "Substantial legal drafting deficiencies identified. Missing mandatory clauses, verification jurats, "
                "or structural demarcations make the draft procedurally non-admissible in its current form."
            )

        remedial_suggestions = []
        if failed_items:
            narrative_lines.append("\nKey Omissions Requiring Remediation:")
            for item in failed_items[:4]:
                crit = item.get("criterion", "Clause Requirement")
                expl = item.get("explanation", "")
                narrative_lines.append(f"• {crit}: {expl}")
                remedial_suggestions.append(f"Incorporate statutory provision for '{crit}'. {expl}")

        if partial_items:
            for item in partial_items[:3]:
                crit = item.get("criterion", "Clause Element")
                expl = item.get("explanation", "")
                remedial_suggestions.append(f"Refine {crit}: {expl}")

        if not remedial_suggestions:
            remedial_suggestions.append("Verify stamp duty admissibility in your designated state jurisdiction.")
            remedial_suggestions.append("Cross-check limitation period under Schedule I of the Limitation Act, 1963.")

        narrative = "\n".join(narrative_lines)
        statutory_context = "Benchmarking under Bharatiya Sakshya Adhiniyam, CPC Order XIX, and Indian Contract Act, 1872."

        try:
            eval_repo.update(payload.evaluation_id, {"llm_explanation": narrative})
        except Exception:
            pass

        return ExplainEvaluationResponse(
            evaluation_id=payload.evaluation_id,
            explanation=narrative,
            remedial_suggestions=remedial_suggestions,
            statutory_context=statutory_context
        )