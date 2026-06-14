import { LLMConfig } from "@/types/llm_config";

export const updateLLMConfig = (
  currentConfig: LLMConfig,
  field: string,
  value: string | boolean
): LLMConfig => {
  const fieldMappings: Record<string, keyof LLMConfig> = {
    custom_llm_url: "CUSTOM_LLM_URL",
    custom_llm_api_key: "CUSTOM_LLM_API_KEY",
    custom_model: "CUSTOM_MODEL",
    image_provider: "IMAGE_PROVIDER",
    disable_image_generation: "DISABLE_IMAGE_GENERATION",
    openai_compat_image_base_url: "OPENAI_COMPAT_IMAGE_BASE_URL",
    openai_compat_image_api_key: "OPENAI_COMPAT_IMAGE_API_KEY",
    openai_compat_image_model: "OPENAI_COMPAT_IMAGE_MODEL",
  };

  const configKey = fieldMappings[field];
  if (configKey) {
    return { ...currentConfig, [configKey]: value };
  }

  return currentConfig;
};

export const changeProvider = (
  currentConfig: LLMConfig,
  provider: string
): LLMConfig => {
  return { ...currentConfig, LLM: provider };
};
