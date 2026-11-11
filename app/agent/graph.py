from langgraph.graph import StateGraph, START, END

from app.agent.state import InvestigationState
from app.agent.nodes import (
    analyze_incident,
    investigate_performance,
    investigate_avalibility,
    genral_investigation,
    request_clarification,
    discover_azure_resources,
    request_application,
)

def route_after_analysis(state: InvestigationState) -> str:
    """?"""
    return state["next_action"]


builder = StateGraph(InvestigationState)       # batata hai ki workflow kis state structure ke saath kaam karega.

builder.add_node("analyze_incident", analyze_incident)
builder.add_node("investigate_performance", investigate_performance)
builder.add_node("investigate_avalibility", investigate_avalibility)
builder.add_node("genral_investigation", genral_investigation)
builder.add_node("request_clarification", request_clarification)
# builder.add_node("discover_azure_resources", discover_azure_resources)

builder.add_edge(START, "discover_azure_resources")
builder.add_edge("discover_azure_resources", "analyze_incident")

builder.add_conditional_edges(
    "analyze_incident",
    route_after_analysis,
    {
        "investigate_performance": "investigate_performance",
        "investigate_availability": "investigate_avalibility",
        "general_investigation": "genral_investigation",
        "request_clarification": "request_clarification",
    },
)

builder.add_edge("investigate_performance", END)
builder.add_edge("investigate_avalibility", END)
builder.add_edge("genral_investigation", END)
builder.add_edge("request_clarification", END)


workflow = builder.compile()