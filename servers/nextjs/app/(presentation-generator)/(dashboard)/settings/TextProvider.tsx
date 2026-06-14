import { Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LLMConfig } from "@/types/llm_config";
import { getApiUrl } from "@/utils/api";
import { notify } from "@/components/ui/sonner";

interface ModelOption {
  value: string;
  label: string;
}

const TextProvider = ({
  onInputChange,
  llmConfig,
}: {
  onInputChange: (value: string | boolean, field: string) => void;
  llmConfig: LLMConfig;
}) => {
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsChecked, setModelsChecked] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const currentCustomUrl = llmConfig.CUSTOM_LLM_URL || "";
  const currentApiKey = llmConfig.CUSTOM_LLM_API_KEY || "";
  const currentModel = llmConfig.CUSTOM_MODEL || "";

  useEffect(() => {
    setAvailableModels([]);
    setModelsChecked(false);
    if (currentModel) {
      onInputChange("", "CUSTOM_MODEL");
    }
  }, [currentCustomUrl, currentApiKey]);

  const fetchAvailableModels = async () => {
    if (!currentCustomUrl) return;

    setModelsLoading(true);
    try {
      const response = await fetch(
        getApiUrl("/api/v1/ppt/openai/models/available"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: currentCustomUrl,
            api_key: currentApiKey,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const normalizedModels: ModelOption[] = Array.isArray(data)
          ? data
              .filter((m): m is string => typeof m === "string")
              .map((model) => ({
                value: model,
                label: model,
              }))
          : [];

        setAvailableModels(normalizedModels);
        setModelsChecked(true);

        if (normalizedModels.length > 0) {
          const firstModel = normalizedModels[0].value;
          onInputChange(firstModel, "CUSTOM_MODEL");
        }
      } else {
        setAvailableModels([]);
        setModelsChecked(true);
        notify.error("Could not load models", "Check your endpoint URL and API key.");
      }
    } catch {
      notify.error("Could not load models", "Something went wrong. Check your network.");
      setAvailableModels([]);
      setModelsChecked(true);
    } finally {
      setModelsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-[#F9F8F8] p-7 rounded-[12px]">
      <div className="mb-4 flex flex-col gap-8 rounded-[12px] bg-white pt-5 pb-10 px-10 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="max-w-[290px] shrink-0">
          <div
            className="w-[60px] h-[60px] rounded-[4px] flex items-center justify-center"
            style={{ backgroundColor: "#4C55541A" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M15.9459 5.31543V26.5767" stroke="#4C5554" strokeWidth="1.59459" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.31531 9.30192V6.64426C5.31531 6.29183 5.45531 5.95384 5.70451 5.70463C5.95372 5.45543 6.29171 5.31543 6.64414 5.31543H25.2477C25.6002 5.31543 25.9382 5.45543 26.1874 5.70463C26.4366 5.95384 26.5766 6.29183 26.5766 6.64426V9.30192" stroke="#4C5554" strokeWidth="1.59459" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11.9594 26.5762H19.9324" stroke="#4C5554" strokeWidth="1.59459" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-xl font-normal text-[#191919] py-2.5">
            Text Generation Settings
          </h3>
          <p className="text-sm text-gray-500">
            Custom OpenAI-compatible LLM (GLM-5.1)
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-stretch justify-end gap-4 sm:items-end">
          <div className="flex w-full min-w-0 flex-wrap gap-4 sm:justify-end">
            {/* Custom URL */}
            <div className="w-[262px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI-compatible URL
              </label>
              <input
                type="text"
                value={currentCustomUrl}
                onChange={(e) => onInputChange(e.target.value, "CUSTOM_LLM_URL")}
                className="w-full px-2 py-3 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="http://glm-gateway:8000/v1"
              />
            </div>

            {/* API Key */}
            <div className="w-[262px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={currentApiKey}
                  onChange={(e) => onInputChange(e.target.value, "CUSTOM_LLM_API_KEY")}
                  className="w-full px-2 py-3 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="Enter your API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 cursor-pointer"
                >
                  {showApiKey ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>
          </div>

          {/* Check models button */}
          {(!modelsChecked || (modelsChecked && availableModels.length === 0)) && (
            <button
              onClick={fetchAvailableModels}
              disabled={modelsLoading || !currentCustomUrl}
              className={`mt-4 py-2.5 bg-[#EDEEEF] px-3.5 w-fit rounded-[48px] text-xs font-semibold text-[#101323] transition-all duration-200 border ${
                modelsLoading
                  ? "border-gray-300 cursor-not-allowed text-gray-500"
                  : "border-[#EDEEEF] hover:bg-[#E8F0FF]/90"
              }`}
            >
              {modelsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking for models...
                </span>
              ) : (
                "Check models"
              )}
            </button>
          )}

          {/* Model selection */}
          {modelsChecked && availableModels.length > 0 && (
            <div className="w-[262px] mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model
              </label>
              <select
                value={currentModel}
                onChange={(e) => onInputChange(e.target.value, "CUSTOM_MODEL")}
                className="w-full h-12 px-4 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a model</option>
                {availableModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              {!currentModel && (
                <p className="mt-1 text-xs text-yellow-700">
                  Please select a model before saving.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {modelsChecked && availableModels.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No models found. Make sure your endpoint URL and API key are valid.
          </p>
        </div>
      )}
    </div>
  );
};

export default TextProvider;
