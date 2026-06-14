"""Ollama is not supported in air-gapped enterprise mode."""


async def list_pulled_ollama_models():
    return []


async def pull_ollama_model(model: str):
    return
    yield
