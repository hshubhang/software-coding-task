"""Tool definitions for Claude to query dashboard data."""

from sqlalchemy.orm import Session
from api.models import DashboardData, User


TOOLS = [
    {
        "name": "get_summary",
        "description": "Get high-level marketing KPIs: total spend, total revenue, media-driven percentage, time range, and channel list.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_roi",
        "description": "Get ROI (return on investment) per media channel with mean, median, and 90% confidence intervals (ci_lower, ci_upper).",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_contribution",
        "description": "Get each channel's incremental revenue contribution, spend, spend percentage, contribution percentage, ROI, and CPM. Also includes baseline (non-media) revenue.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_response_curves",
        "description": "Get response curve data for each channel showing spend points vs incremental outcome. Shows diminishing returns - how incremental revenue changes as spend increases from 0 to 2.5x current levels.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_spend",
        "description": "Get weekly spend per channel over time, plus weekly revenue. Useful for trend analysis.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
]

SYSTEM_PROMPT = """You are a marketing analytics assistant for a Meridian Marketing Mix Model dashboard.
You help users understand their channel performance, ROI, and budget allocation.

When answering questions:
- Use the tools to fetch real data before answering
- Be specific with numbers and percentages
- Provide actionable insights when relevant
- Keep responses concise but informative
- Format currency values nicely (e.g., $1.2M, $840K)
- When comparing channels, use data to back up claims"""


def execute_tool(tool_name: str, user: User, db: Session) -> dict:
    """Execute a tool call by querying dashboard data."""
    type_map = {
        "get_summary": "summary",
        "get_roi": "roi",
        "get_contribution": "contribution",
        "get_response_curves": "response_curves",
        "get_spend": "spend",
    }
    data_type = type_map.get(tool_name)
    if not data_type:
        return {"error": f"Unknown tool: {tool_name}"}

    entry = (
        db.query(DashboardData)
        .filter(DashboardData.user_id == user.id, DashboardData.data_type == data_type)
        .first()
    )
    if not entry:
        return {"error": f"No {data_type} data found"}
    return entry.data
