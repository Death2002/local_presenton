from fastapi import HTTPException

from constants.llm import DEFAULT_CUSTOM_MODEL
from enums.llm_provider import LLMProvider
from utils.get_env import get_custom_model_env


def get_llm_provider():
    return LLMProvider.CUSTOM


def is_custom_llm_selected():
    return True


def get_model():
    return get_custom_model_env() or DEFAULT_CUSTOM_MODEL


def get_large_model() -> str:
    return get_model()
