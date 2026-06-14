"""Web search is disabled in air-gapped enterprise mode."""


async def search_web_for_information(*args, **kwargs):
    return []
