from pydantic import BaseModel


class ScoutChatRequest(BaseModel):
    message: str


class ScoutChatResponse(BaseModel):
    response: str