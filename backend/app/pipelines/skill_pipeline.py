from typing import Any, Dict, List, Optional
from app.ai.evaluation.models import EvaluationFinding
from app.ai.graph.skill_graph import SkillGraph
from app.core.constants import FindingCategory, FindingStatus
from app.db.repositories.skill_repository import SkillRepository


class SkillPipeline:
    """Updates student skill proficiencies across PostgreSQL and Neo4j based on evaluation evidence."""

    def __init__(self):
        self.skill_repo = SkillRepository()
        self.skill_graph = SkillGraph()

    def _resolve_skill(self, finding: EvaluationFinding, all_skills: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        # 1. Exact match by name
        for s in all_skills:
            if s["name"].lower() == finding.criterion.lower():
                return s

        crit_lower = finding.criterion.lower()

        # 2. Keyword match
        if any(w in crit_lower for w in ["part", "recital", "deponent", "heading", "demarcation", "particular", "title"]):
            for s in all_skills:
                if "Parties" in s["name"]:
                    return s
        if any(w in crit_lower for w in ["jurisdiction", "statut", "evidence", "court", "act", "section"]):
            for s in all_skills:
                if "Jurisdiction" in s["name"]:
                    return s
        if any(w in crit_lower for w in ["verif", "jurat", "oath", "attest", "stamp", "notary", "signature"]):
            for s in all_skills:
                if "Verification" in s["name"]:
                    return s
        if any(w in crit_lower for w in ["terminat", "dispute", "breach", "notice", "arbitrat"]):
            for s in all_skills:
                if "Termination" in s["name"]:
                    return s
        if any(w in crit_lower for w in ["considerat", "remunerat", "averment", "character", "duty", "clause", "fellow"]):
            for s in all_skills:
                if "Consideration" in s["name"]:
                    return s

        # 3. Category match fallback
        cat_map = {
            FindingCategory.STRUCTURE: "Parties & Recitals Demarcation",
            FindingCategory.FORMATTING: "Verification Clauses & Jurats",
            FindingCategory.CLAUSE_COVERAGE: "Operative Consideration & Remuneration",
            FindingCategory.GAP: "Jurisdiction & Statutory References",
            FindingCategory.CONTRADICTION: "Termination & Dispute Resolution",
        }
        target_name = cat_map.get(finding.category)
        if target_name:
            for s in all_skills:
                if s["name"] == target_name:
                    return s

        return all_skills[0] if all_skills else None

    def process_evaluation_skills(
        self,
        user_id: str,
        evaluation_id: str,
        findings: List[EvaluationFinding]
    ) -> None:
        all_skills = self.skill_repo.list_all()
        if not all_skills:
            return

        for f in findings:
            skill = self._resolve_skill(f, all_skills)
            if not skill:
                continue

            skill_id = skill["id"]
            current_record = self.skill_repo.get_student_skill(user_id, skill_id)

            earned_ratio = (f.score / f.max_score) if f.max_score > 0 else 0.0
            score_points = round(earned_ratio * 100.0, 2)

            if current_record:
                old_score = float(current_record["proficiency_score"])
                # Moving average
                new_score = round((old_score * 0.6) + (score_points * 0.4), 2)
                delta = round(new_score - old_score, 2)
                new_conf = min(1.0, float(current_record["confidence_level"]) + 0.15)
            else:
                new_score = score_points
                delta = score_points
                new_conf = 0.50

            student_skill = self.skill_repo.upsert_student_skill(
                user_id=user_id,
                skill_id=skill_id,
                proficiency_score=new_score,
                confidence_level=new_conf
            )

            student_skill_id = student_skill.get("id") if isinstance(student_skill, dict) else None
            if student_skill_id:
                try:
                    self.skill_repo.log_skill_history(
                        student_skill_id=student_skill_id,
                        score_delta=delta,
                        reason=f"Evaluation {evaluation_id}: {f.explanation}",
                        evaluation_id=evaluation_id
                    )
                except Exception:
                    pass

            # Update graph node connection in Neo4j Aura
            try:
                self.skill_graph.update_student_skill(user_id=user_id, skill_id=skill_id, score=new_score)
            except Exception:
                pass