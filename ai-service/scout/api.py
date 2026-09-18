from fastapi import APIRouter
from scout.schemas import ScoutChatRequest, ScoutChatResponse
from scout.service import process_message


router = APIRouter(
    prefix="/scout",
    tags=["Scout"]
)


@router.post("/chat", response_model=ScoutChatResponse)
def chat(request: ScoutChatRequest):

    response = process_message(request.message)

    return ScoutChatResponse(response=response)