from typing import Optional
from pydantic import BaseModel


class UserConfig(BaseModel):
    LLM: Optional[str] = None

    CUSTOM_LLM_URL: Optional[str] = None
    CUSTOM_LLM_API_KEY: Optional[str] = None
    CUSTOM_MODEL: Optional[str] = None

    DISABLE_IMAGE_GENERATION: Optional[bool] = None
    IMAGE_PROVIDER: Optional[str] = None

    OPENAI_COMPAT_IMAGE_BASE_URL: Optional[str] = None
    OPENAI_COMPAT_IMAGE_API_KEY: Optional[str] = None
    OPENAI_COMPAT_IMAGE_MODEL: Optional[str] = None
