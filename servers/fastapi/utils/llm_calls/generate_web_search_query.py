"""Web search query generation is disabled in air-gapped enterprise mode."""


async def generate_web_search_query(*args, **kwargs):
    return None
