from utils.available_models import list_available_openai_compatible_models
from utils.get_env import (
    get_can_change_keys_env,
    get_custom_llm_api_key_env,
    get_custom_llm_url_env,
    get_custom_model_env,
    get_openai_compat_image_api_key_env,
    get_openai_compat_image_base_url_env,
    get_openai_compat_image_model_env,
)
from utils.image_provider import is_image_generation_disabled


async def check_llm_and_image_provider_api_or_model_availability():
    can_change_keys = get_can_change_keys_env() != "false"
    skip_image_validation = is_image_generation_disabled()

    if not can_change_keys:
        custom_model = get_custom_model_env()
        custom_llm_url = get_custom_llm_url_env()
        if not custom_model:
            raise Exception("CUSTOM_MODEL must be provided")
        if not custom_llm_url:
            raise Exception("CUSTOM_LLM_URL must be provided")
        available_models = await list_available_openai_compatible_models(
            custom_llm_url, get_custom_llm_api_key_env() or "null"
        )
        print("-" * 50)
        print("Available models: ", available_models)
        if custom_model not in available_models:
            raise Exception(f"Model {custom_model} is not available")

        if not skip_image_validation:
            if not get_openai_compat_image_api_key_env():
                raise Exception("OPENAI_COMPAT_IMAGE_API_KEY must be provided")
            if not get_openai_compat_image_base_url_env():
                raise Exception("OPENAI_COMPAT_IMAGE_BASE_URL must be provided")
            if not get_openai_compat_image_model_env():
                raise Exception("OPENAI_COMPAT_IMAGE_MODEL must be provided")
