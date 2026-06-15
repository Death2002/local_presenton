import os


def _is_truthy(value: str | None) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_can_change_keys_env():
    return os.getenv("CAN_CHANGE_KEYS")


def get_database_url_env():
    return os.getenv("DATABASE_URL")


def get_app_data_directory_env():
    return os.getenv("APP_DATA_DIRECTORY")


def get_fastapi_public_base_url() -> str | None:
    v = (os.getenv("NEXT_PUBLIC_FAST_API") or "").strip().rstrip("/")
    return v or None


def get_temp_directory_env():
    return os.getenv("TEMP_DIRECTORY")


def get_user_config_path_env():
    return os.getenv("USER_CONFIG_PATH")


def get_disable_auth_env():
    return os.getenv("DISABLE_AUTH")


def is_disable_auth_enabled():
    return _is_truthy(get_disable_auth_env())


def get_custom_llm_url_env():
    return os.getenv("CUSTOM_LLM_URL")


def get_custom_llm_api_key_env():
    return os.getenv("CUSTOM_LLM_API_KEY")


def get_custom_model_env():
    return os.getenv("CUSTOM_MODEL")


def get_disable_image_generation_env():
    return os.getenv("DISABLE_IMAGE_GENERATION")


def get_openai_compat_image_base_url_env():
    return os.getenv("OPENAI_COMPAT_IMAGE_BASE_URL")


def get_openai_compat_image_api_key_env():
    return os.getenv("OPENAI_COMPAT_IMAGE_API_KEY")


def get_openai_compat_image_model_env():
    return os.getenv("OPENAI_COMPAT_IMAGE_MODEL")


def get_migrate_database_on_startup_env():
    return os.getenv("MIGRATE_DATABASE_ON_STARTUP")

