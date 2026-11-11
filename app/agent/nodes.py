import os

from typing import Literal
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from azure.identity import AzureCliCredential

from app.agent.state import InvestigationState
from app.agent.schemas import IncidentAnalysis
from app.tools.azure.resource_inventory import (
    get_selected_subscription_id,
    list_azure_resources,
)

load_dotenv()

llm = ChatGroq(
    model=os.environ["GROQ_MODEL"],
    temperature=0,
)


structured_llm = llm.with_structured_output(IncidentAnalysis)



def analyze_incident(state: InvestigationState) -> dict:
    """Incident ko analyze karta hai aur ek structured response return karta hai."""

    prompt = f"""
You are an Azure cloud incident investigation planner.
Analyze the user's question and return a structured response.

Requirements:
- Select the most suitable incident category.
- Create an ordered investigation plan.
- Choose the next action based on the analysis.
- Request clarification if essential information is missing.
- Never invent metrics, logs, resources, or findings.
- No Azure investigation tools are connected yet.

User question:
{state["user_question"]}
"""

    analysis = structured_llm.invoke(prompt)

    return {
        "incident_type": analysis.incident_type,
        "reasoning_summary": analysis.reasoning_summary,
        "investigation_plan": analysis.investigation_plan,
        "next_action": analysis.next_action,
        "status": (
            "needs_clarification" if analysis.next_action == "request_clarification" else "planning"
        )
    }


def investigate_performance(state: InvestigationState) -> dict:
    """Performance issues ko investigate karta hai."""

    return{
        "investigation_notes": [
            f"Performance investigation selected:"
            for step in state["investigation_plan"]
        ],
        "status": "investigating",
    }


def investigate_avalibility(state: InvestigationState) -> dict:
    """Availability issues ko investigate karta hai."""

    return {
        "investigation_notes": [
            f"Availability investigation selected: {step}"
            for step in state["investigation_plan"]
        ],
        "status": "investigating",
    }


def genral_investigation(state: InvestigationState) -> dict:
    """General investigation ke liye plan execute karta hai."""

    return {
        "investigation_notes": [
            f"General investigation selected: {step}"
            for step in state["investigation_plan"]
        ],
        "status": "investigating",
    }


def request_clarification(state: InvestigationState) -> dict:
    """User se clarification request karta hai agar investigation ke liye essential information missing ho."""

    return {
        "investigation_notes": [
            f"Requesting clarification from user:"
            for step in state["investigation_plan"]
        ],
        "status": "needs_clarification",
    }

# def discover_azure_resources(state: InvestigationState) -> dict:
#     """Azure resources ko discover karta hai aur shared state mein store karta hai."""

#     credential = AzureCliCredential()
#     subscription_id = get_selected_subscription_id()
#     resources = list_azure_resources(credential, subscription_id)
    

#     return {
#         "discovered_resources": resources,
#         "investigation_notes": [
#             f"Discovered {len(resources)} Azure resources."
#         ],
#     }

# def request_resource_selection(state: InvestigationState) -> dict:
#     """User se application ke baare mein clarification request karega"""

#     return {
#         "status": "needs_clarification",
#         "investigation_notes": [
#             "Please select the application to investigate."
#         ],
#     }