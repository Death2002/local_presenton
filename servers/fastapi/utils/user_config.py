from models.user_config import UserConfig
from utils.get_env import (
    get_custom_llm_api_key_env,
    get_custom_llm_url_env,
    get_custom_model_env,
    get_disable_image_generation_env,
    get_user_config_path_env,
    get_openai_compat_image_base_url_env,
    get_openai_compat_image_api_key_env,
    get_openai_compat_image_model_env,
)
from utils.parsers import parse_bool_or_none
from utils.user_config_store import read_user_config_file, update_user_config_file
from utils.set_env import (
    set_custom_llm_api_key_env,
    set_custom_llm_url_env,
    set_custom_model_env,
    set_disable_image_generation_env,
    set_openai_compat_image_base_url_env,
    set_openai_compat_image_api_key_env,
    set_openai_compat_image_model_env,
)


def get_user_config():
    user_config_path = get_user_config_path_env()

    existing_config = UserConfig()
    try:
        if user_config_path:
            existing_config = UserConfig(**read_user_config_file(user_config_path))
    except Exception:
        print("Error while loading user config")
        pass

    return UserConfig(
        CUSTOM_LLM_URL=existing_config.CUSTOM_LLM_URL or get_custom_llm_url_env(),
        CUSTOM_LLM_API_KEY=existing_config.CUSTOM_LLM_API_KEY
        or get_custom_llm_api_key_env(),
        CUSTOM_MODEL=existing_config.CUSTOM_MODEL or get_custom_model_env(),
        DISABLE_IMAGE_GENERATION=(
            existing_config.DISABLE_IMAGE_GENERATION
            if existing_config.DISABLE_IMAGE_GENERATION is not None
            else (parse_bool_or_none(get_disable_image_generation_env()) or False)
        ),
        OPENAI_COMPAT_IMAGE_BASE_URL=existing_config.OPENAI_COMPAT_IMAGE_BASE_URL
        or get_openai_compat_image_base_url_env(),
        OPENAI_COMPAT_IMAGE_API_KEY=existing_config.OPENAI_COMPAT_IMAGE_API_KEY
        or get_openai_compat_image_api_key_env(),
        OPENAI_COMPAT_IMAGE_MODEL=existing_config.OPENAI_COMPAT_IMAGE_MODEL
        or get_openai_compat_image_model_env(),
    )


def update_env_with_user_config():
    user_config = get_user_config()
    if user_config.CUSTOM_LLM_URL:
        set_custom_llm_url_env(user_config.CUSTOM_LLM_URL)
    if user_config.CUSTOM_LLM_API_KEY:
        set_custom_llm_api_key_env(user_config.CUSTOM_LLM_API_KEY)
    if user_config.CUSTOM_MODEL:
        set_custom_model_env(user_config.CUSTOM_MODEL)
    if user_config.DISABLE_IMAGE_GENERATION is not None:
        set_disable_image_generation_env(str(user_config.DISABLE_IMAGE_GENERATION))
    if user_config.OPENAI_COMPAT_IMAGE_BASE_URL:
        set_openai_compat_image_base_url_env(user_config.OPENAI_COMPAT_IMAGE_BASE_URL)
    if user_config.OPENAI_COMPAT_IMAGE_API_KEY:
        set_openai_compat_image_api_key_env(user_config.OPENAI_COMPAT_IMAGE_API_KEY)
    if user_config.OPENAI_COMPAT_IMAGE_MODEL:
        set_openai_compat_image_model_env(user_config.OPENAI_COMPAT_IMAGE_MODEL)
