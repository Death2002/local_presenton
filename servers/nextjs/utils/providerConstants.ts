export interface LLMProviderOption {
  value: string;
  label: string;
  description?: string;
  model_value?: string;
  model_label?: string;
  url?: string;
  icon?: string;
  getApiKeyUrl?: string;
}

export interface ImageProviderOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  requiresApiKey?: boolean;
  apiKeyField?: string;
  apiKeyFieldLabel?: string;
  getApiKeyUrl?: string;
}

export const IMAGE_PROVIDERS: Record<string, ImageProviderOption> = {
  openai_compatible: {
    value: "openai_compatible",
    label: "Custom",
    description:
      "OpenAI-compatible /v1/images endpoint (FLUX, LiteLLM, vLLM, etc.)",
    icon: "/providers/custom.svg",
    requiresApiKey: false,
    apiKeyField: "OPENAI_COMPAT_IMAGE_BASE_URL",
    apiKeyFieldLabel: "OpenAI-compatible base URL",
  },
};

export const LLM_PROVIDERS: Record<string, LLMProviderOption> = {
  custom: {
    value: "custom",
    label: "Custom",
    description: "OpenAI-compatible LLM",
    icon: "/providers/custom.svg",
  },
};
