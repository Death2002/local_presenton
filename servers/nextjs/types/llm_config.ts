export interface LLMConfig {
  LLM?: string;

  CUSTOM_LLM_URL?: string;
  CUSTOM_LLM_API_KEY?: string;
  CUSTOM_MODEL?: string;

  DISABLE_IMAGE_GENERATION?: boolean;
  IMAGE_PROVIDER?: string;

  OPENAI_COMPAT_IMAGE_BASE_URL?: string;
  OPENAI_COMPAT_IMAGE_API_KEY?: string;
  OPENAI_COMPAT_IMAGE_MODEL?: string;

  DISABLE_THINKING?: boolean;
  EXTENDED_REASONING?: boolean;

  DISABLE_ANONYMOUS_TRACKING?: string;
}
