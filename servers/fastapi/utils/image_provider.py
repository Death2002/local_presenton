from enums.image_provider import ImageProvider
from utils.get_env import get_disable_image_generation_env
from utils.parsers import parse_bool_or_none


def is_image_generation_disabled() -> bool:
    return parse_bool_or_none(get_disable_image_generation_env()) or False


def is_openai_compatible_selected() -> bool:
    return True


def get_selected_image_provider() -> ImageProvider | None:
    return ImageProvider.OPENAI_COMPATIBLE
