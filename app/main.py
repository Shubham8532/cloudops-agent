from app.agent.graph import workflow


if __name__ == "__main__":
    initial_state = {
        "user_question": "Why is checkout latency increasing?",
        "investigation_notes": [],
        "evidence": [],
        "status": "started",
        "final_answer": "",
    }

    result = workflow.invoke(initial_state)

    print("Incident type:", result["incident_type"])
    print("Reason:", result["reasoning_summary"])
    print("Investigation plan:", result["investigation_plan"])
    print("Selected action:", result["next_action"])
    print("Status:", result["status"])
    print("Notes:", result["investigation_notes"])
    print("Azure resources:", len(result["discovered_resources"]))