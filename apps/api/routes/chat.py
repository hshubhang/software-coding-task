import json

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.config import get_settings
from api.database import get_db
from api.dependencies import get_current_user
from api.models import User
from api.services.chat_tools import SYSTEM_PROMPT, TOOLS, execute_tool

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@router.post("")
async def chat(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = get_settings()
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    async def generate():
        # Agentic loop: keep calling Claude until no more tool use
        current_messages = messages.copy()

        while True:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=current_messages,
            )

            # Check if Claude wants to use tools
            tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

            if tool_use_blocks:
                # Add assistant response with tool calls
                current_messages.append({"role": "assistant", "content": response.content})

                # Execute each tool and build tool results
                tool_results = []
                for tool_block in tool_use_blocks:
                    result = execute_tool(tool_block.name, user, db)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_block.id,
                        "content": json.dumps(result),
                    })

                current_messages.append({"role": "user", "content": tool_results})
                # Continue the loop to get Claude's final response
                continue

            # No tool use — extract text and stream it
            text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    text += block.text

            # Stream the response as SSE
            yield f"data: {json.dumps({'type': 'text', 'content': text})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            break

    return StreamingResponse(generate(), media_type="text/event-stream")
