import { setLLMConfig } from "@/store/slices/userConfig";
import { store } from "@/store/store";
import { LLMConfig } from "@/types/llm_config";

function isProvided(value: unknown): boolean {
  return value !== "" && value !== null && value !== undefined;
}

function parseOptionalBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return undefined;
}

export const normalizeLLMConfig = (llmConfig: LLMConfig): LLMConfig => {
  const normalizedConfig: LLMConfig = { ...llmConfig };

  if (!normalizedConfig.LLM) {
    normalizedConfig.LLM = "custom";
  }

  const parsedDisableImageGeneration = parseOptionalBool(
    (normalizedConfig as Record<string, unknown>).DISABLE_IMAGE_GENERATION
  );
  if (parsedDisableImageGeneration !== undefined) {
    normalizedConfig.DISABLE_IMAGE_GENERATION = parsedDisableImageGeneration;
  }

  if (
    normalizedConfig.OPENAI_COMPAT_IMAGE_BASE_URL &&
    normalizedConfig.OPENAI_COMPAT_IMAGE_API_KEY &&
    normalizedConfig.OPENAI_COMPAT_IMAGE_MODEL
  ) {
    normalizedConfig.IMAGE_PROVIDER = "openai_compatible";
  }

  if (!normalizedConfig.DISABLE_IMAGE_GENERATION && !normalizedConfig.IMAGE_PROVIDER) {
    normalizedConfig.DISABLE_IMAGE_GENERATION = true;
  }

  return normalizedConfig;
};

export const getLLMConfigValidationError = (
  inputConfig: LLMConfig
): string | null => {
  const llmConfig = normalizeLLMConfig(inputConfig);

  if (!llmConfig.LLM) {
    return "Select a text provider.";
  }

  if (!llmConfig.DISABLE_IMAGE_GENERATION && !llmConfig.IMAGE_PROVIDER) {
    return "Select an image provider, or turn off image generation.";
  }

  const llm = llmConfig.LLM;

  if (llm === "custom") {
    if (!isProvided(llmConfig.CUSTOM_LLM_URL)) {
      return "Enter your custom LLM endpoint URL (OpenAI-compatible).";
    }
    if (!isProvided(llmConfig.CUSTOM_MODEL)) {
      return 'No model selected for your custom endpoint. Use "Check models" after entering the URL, then choose a model.';
    }
  } else {
    return "Unsupported or unknown text provider.";
  }

  if (!llmConfig.DISABLE_IMAGE_GENERATION) {
    if (llmConfig.IMAGE_PROVIDER === "openai_compatible") {
      if (
        !isProvided(llmConfig.OPENAI_COMPAT_IMAGE_BASE_URL?.trim()) ||
        !isProvided(llmConfig.OPENAI_COMPAT_IMAGE_API_KEY?.trim()) ||
        !isProvided(llmConfig.OPENAI_COMPAT_IMAGE_MODEL?.trim())
      ) {
        return "OpenAI-compatible image API requires base URL, API key, and model.";
      }
    } else {
      return "Select a valid image provider.";
    }
  }

  return null;
};

export const handleSaveLLMConfig = async (llmConfig: LLMConfig) => {
  const normalizedConfig = normalizeLLMConfig(llmConfig);
  const validationError = getLLMConfigValidationError(normalizedConfig);
  if (validationError) {
    throw new Error(validationError);
  }

  if (typeof window !== "undefined" && window.electron?.setUserConfig) {
    await window.electron.setUserConfig(normalizedConfig);
  } else {
    await fetch("/api/user-config", {
      method: "POST",
      body: JSON.stringify(normalizedConfig),
    });
  }

  store.dispatch(setLLMConfig(normalizedConfig));
};

export const hasValidLLMConfig = (llmConfig: LLMConfig) =>
  getLLMConfigValidationError(llmConfig) === null;
