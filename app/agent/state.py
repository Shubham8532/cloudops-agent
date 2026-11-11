# state.py — Shared memory
# Investigation ka current status, user question, plan, evidence aur notes store karta hai.

from typing import TypedDict, Literal




class InvestigationState(TypedDict):

    user_question: str
    selected_resource_id: str
    discovered_resources: list[dict[str, str]]   # Resources ko shared state mein store karega
    available_resources: list[dict[str, str]]  # Azure subscription ke available resources ki list, jaise storage accounts, VMs, etc.
    selected_resoruces: dict[str, str]
    status: Literal[
        "started",
        "planning",
        "in_progress",
        "investigating",
        "completed",
        "needs_clarification",
        "failed",
    ]    # workflow ki current state represent karega --> eg. "in_progress", "completed", "pending_review"

    incident_type: Literal[
        "performance",
        "availability",
        "general",
    ]

    reasoning_summary: str
    investigation_plan: list[str]   # Investigation ke proposed steps, e.g. ["Check CPU", "Inspect latency metrics"].

    next_action: Literal[
        "investigate_performance",
        "investigate_availability",
        "general_investigation",
        "request_clarification",
    ]   # LLM ke decision ke basis par LangGraph next node choose karega.

    investigation_notes: list[str]  # Investigation ke dauraan mili observations.
    evidence: list[dict[str, str]]  # Supporting evidence, e.g. {"source": "Azure Monitor", "description": "High latency", "link": "..."}

    final_answer: str  # User ko diya jaane wala final investigation result.

    