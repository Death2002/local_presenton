# Air-Gapped Enterprise Migration Plan

## Goal
Convert Presenton to a fully air-gapped enterprise presentation platform using only self-hosted GLM-5.1 (via OpenAI-compatible gateway) for LLM and self-hosted FLUX for image generation.

## Principle
Use existing `CUSTOM` LLM provider + `openai_compatible` image provider paths — already OpenAI-compatible, minimal risk, maximal reuse.

## Phase 1: Backend Simplification (DONE)
- [x] `enums/llm_provider.py` — stripped to only `CUSTOM`
- [x] `constants/llm.py` — stripped to `DEFAULT_CUSTOM_MODEL`
- [x] `utils/llm_provider.py` — simplified to return `CUSTOM` always
- [x] `utils/llm_config.py` — hardcoded to `OpenAIClientConfig` from env
- [x] `enums/image_provider.py` — stripped to only `OPENAI_COMPATIBLE`
- [x] `utils/image_provider.py` — simplified to always return `openai_compatible`
- [x] `services/image_generation_service.py` — rewritten to use only `openai_compatible`
- [x] `utils/get_env.py` — removed all provider env var helpers, kept only CUSTOM + OPENAI_COMPAT
- [x] `utils/set_env.py` — removed all provider env var setters
- [x] `models/user_config.py` — stripped to CUSTOM LLM + OPENAI_COMPAT image fields
- [x] `utils/user_config.py` — simplified to CUSTOM + OPENAI_COMPAT only
- [x] `utils/model_availability.py` — simplified to CUSTOM + OPENAI_COMPAT checks only
- [x] `utils/web_search.py` — disabled (no-op)
- [x] `utils/ollama.py` — disabled (no-op)
- [x] `utils/available_models.py` — removed anthropic/google model listing
- [x] `utils/llm_calls/generate_web_search_query.py` — disabled (no-op)
- [x] `utils/llm_calls/generate_presentation_outlines.py` — removed web search integration
- [x] `templates/providers.py` — removed provider label switch
- [x] `api/v1/ppt/router.py` — removed anthropic, google, ollama, codex_auth routers
- [x] `api/v1/ppt/endpoints/images.py` — removed stock image search (pexels/pixabay)
- [x] `api/v1/ppt/endpoints/anthropic.py` — stubbed
- [x] `api/v1/ppt/endpoints/google.py` — stubbed
- [x] `api/v1/ppt/endpoints/ollama.py` — stubbed
- [x] `api/v1/ppt/endpoints/codex_auth.py` — stubbed
- [x] `api/v1/ppt/endpoints/outlines.py` — removed web_search logging references
- [x] `api/v1/ppt/endpoints/presentation.py` — removed web_search logging references

## Phase 2: Frontend Simplification (TODO)
- [ ] `utils/providerConstants.ts` — strip to only CUSTOM + OPENAI_COMPAT
- [ ] `settings/TextProvider.tsx` — convert to static label
- [ ] `settings/ImageProvider.tsx` — convert to static label
- [ ] `settings/WebSearchProvider.tsx` — disable/remove
- [ ] `ConfigurationInitializer.tsx` — simplify
- [ ] Delete unused components: `SettingCodex.tsx`, `VertexAzureManualFields.tsx`, `BedrockManualFields.tsx`

## Phase 3: Docker/Infrastructure (TODO)
- [ ] `docker-compose.yml` — remove ~100 provider env vars, keep ~5
- [ ] `start.js` — simplify env forwarding

## Phase 4: Tests (TODO)
- [ ] Update backend tests to match simplified code
- [ ] Run `uv run pytest tests/ -v`
- [ ] Run `npm run lint`

## Key Env Vars (final set)
```
CUSTOM_LLM_URL=http://glm-gateway:8000/v1
CUSTOM_LLM_API_KEY=<key>
CUSTOM_MODEL=glm-5.1
OPENAI_COMPAT_IMAGE_BASE_URL=http://flux-gateway:8000/v1
OPENAI_COMPAT_IMAGE_API_KEY=<key>
OPENAI_COMPAT_IMAGE_MODEL=flux-dev
DISABLE_IMAGE_GENERATION=false
```
