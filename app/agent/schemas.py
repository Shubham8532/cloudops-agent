# schemas.py — Output ka contract
# Define karta hai ki LLM ka analysis kis structure aur allowed values mein aana chahiye.

from typing import Literal
from pydantic import BaseModel, Field


class IncidentAnalysis(BaseModel):
    """LLM ke incident analysis response ka expected structure define karta hai."""

    reasoning_summary: str = Field(description="A short, simple explanation of why this problem fits the selected category")
    investigation_plan: list[str] = Field(description="An ordered list of steps to investigate the incident, e.g. ['Check CPU', 'Inspect latency metrics']")
    incident_type: Literal[
        "performance",
        "availability",
        "general",
    ] = Field(description="The type of incident reported by the user")

    next_action: Literal[
        "investigate_performance",
        "investigate_availability",
        "general_investigation",
        "request_clarification",
    ] = Field(description="The next step the agent should take based on analysis")
    