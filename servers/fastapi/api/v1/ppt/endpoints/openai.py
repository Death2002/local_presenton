import sys
import traceback
from typing import Annotated, List
from fastapi import APIRouter, Body, HTTPException

from utils.available_models import list_available_openai_compatible_models

OPENAI_ROUTER = APIRouter(prefix="/openai", tags=["OpenAI"])


@OPENAI_ROUTER.post("/models/available", response_model=List[str])
async def get_available_models(
    url: Annotated[str, Body()],
    api_key: Annotated[str, Body()],
):
    try:
        print(f"[models/available] Listing models for URL: {url}")
        result = await list_available_openai_compatible_models(url, api_key)
        print(f"[models/available] Found {len(result)} models: {result}")
        return result
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        print(f"[models/available] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
