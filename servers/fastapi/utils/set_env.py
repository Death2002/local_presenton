import os


def set_temp_directory_env(value):
    os.environ["TEMP_DIRECTORY"] = value


def set_user_config_path_env(value):
    os.environ["USER_CONFIG_PATH"] = value


def set_custom_llm_url_env(value):
    os.environ["CUSTOM_LLM_URL"] = value


def set_custom_llm_api_key_env(value):
    os.environ["CUSTOM_LLM_API_KEY"] = value


def set_custom_model_env(value):
    os.environ["CUSTOM_MODEL"] = value


def set_disable_image_generation_env(value):
    os.environ["DISABLE_IMAGE_GENERATION"] = value


def set_openai_compat_image_base_url_env(value: str):
    os.environ["OPENAI_COMPAT_IMAGE_BASE_URL"] = value


def set_openai_compat_image_api_key_env(value: str):
    os.environ["OPENAI_COMPAT_IMAGE_API_KEY"] = value


def set_openai_compat_image_model_env(value: str):
    os.environ["OPENAI_COMPAT_IMAGE_MODEL"] = value
