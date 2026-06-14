from typing import Optional

from fastapi import HTTPException
from llmai import OpenAIClientConfig
from llmai.shared import ClientConfig

from utils.get_env import get_custom_llm_api_key_env, get_custom_llm_url_env


def get_llm_config(*, use_openai_responses_api: bool = False) -> ClientConfig:
    base_url = get_custom_llm_url_env()
    if not base_url:
        raise HTTPException(
            status_code=400,
            detail="Custom LLM URL is not set. Configure INTERNAL_LLM_URL.",
        )
    return OpenAIClientConfig(
        base_url=base_url,
        api_key=get_custom_llm_api_key_env() or "null",
    )


def get_extra_body() -> Optional[dict]:
    return None
