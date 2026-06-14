"use client";
import { useState, useEffect } from "react";
import CustomConfig from "./CustomConfig";
import { updateLLMConfig } from "@/utils/providerUtils";
import { LLMConfig } from "@/types/llm_config";
import ImageSelectionConfig from "./ImageSelectionConfig";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  text: string;
  showProgress: boolean;
}

interface LLMProviderSelectionProps {
  initialLLMConfig: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  buttonState: ButtonState;
  setButtonState: (
    state: ButtonState | ((prev: ButtonState) => ButtonState)
  ) => void;
}

export default function LLMProviderSelection({
  initialLLMConfig,
  onConfigChange,
  setButtonState,
}: LLMProviderSelectionProps) {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(initialLLMConfig);
  const [openImageProviderSelect, setOpenImageProviderSelect] = useState(false);
  const isImageGenerationDisabled = llmConfig.DISABLE_IMAGE_GENERATION ?? false;

  useEffect(() => {
    onConfigChange(llmConfig);
  }, [llmConfig]);

  useEffect(() => {
    const needsModelSelection =
      llmConfig.LLM === "custom" && !llmConfig.CUSTOM_MODEL;

    const needsOpenAICompatImageConfig =
      !llmConfig.DISABLE_IMAGE_GENERATION &&
      llmConfig.IMAGE_PROVIDER === "openai_compatible" &&
      (!llmConfig.OPENAI_COMPAT_IMAGE_BASE_URL?.trim() ||
        !llmConfig.OPENAI_COMPAT_IMAGE_API_KEY?.trim() ||
        !llmConfig.OPENAI_COMPAT_IMAGE_MODEL?.trim());

    setButtonState({
      isLoading: false,
      isDisabled: needsModelSelection || needsOpenAICompatImageConfig,
      text: needsModelSelection
        ? "Please Select a Model"
        : needsOpenAICompatImageConfig
          ? "Please Configure Custom Image API"
          : "Save Configuration",
      showProgress: false,
    });
  }, [llmConfig]);

  const input_field_changed = (new_value: string | boolean, field: string) => {
    const updatedConfig = updateLLMConfig(llmConfig, field, new_value);
    setLlmConfig(updatedConfig);
  };

  const getApiKeyValue = (_field?: string) => "";

  const handleApiKeyInputChange = (_field: string | undefined, _value: string) => {};

  useEffect(() => {
    setLlmConfig((prevConfig) => {
      if (!prevConfig.DISABLE_IMAGE_GENERATION && !prevConfig.IMAGE_PROVIDER) {
        return { ...prevConfig, IMAGE_PROVIDER: "openai_compatible" };
      }
      return prevConfig;
    });
  }, []);

  return (
    <div className="h-full flex flex-col mt-10">
      <div className="p-2 rounded-2xl border border-gray-200">
        <Tabs
          value={llmConfig.LLM || "custom"}
          onValueChange={(provider) => {
            setLlmConfig({ ...llmConfig, LLM: provider });
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-1 bg-transparent h-10">
            <TabsTrigger value="custom">Custom LLM</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-0 custom_scrollbar">
        <Tabs
          value={llmConfig.LLM || "custom"}
          onValueChange={() => {}}
          className="w-full"
        >
          <TabsContent value="custom" className="mt-6">
            <CustomConfig
              customLlmUrl={llmConfig.CUSTOM_LLM_URL || ""}
              customLlmApiKey={llmConfig.CUSTOM_LLM_API_KEY || ""}
              customModel={llmConfig.CUSTOM_MODEL || ""}
              disableThinking={llmConfig.DISABLE_THINKING || false}
              onInputChange={input_field_changed}
            />
          </TabsContent>
        </Tabs>

        <ImageSelectionConfig
          isImageGenerationDisabled={isImageGenerationDisabled}
          openImageProviderSelect={openImageProviderSelect}
          setOpenImageProviderSelect={setOpenImageProviderSelect}
          llmConfig={llmConfig}
          input_field_changed={input_field_changed}
          getApiKeyValue={getApiKeyValue}
          handleApiKeyInputChange={handleApiKeyInputChange}
        />
      </div>
    </div>
  );
}
