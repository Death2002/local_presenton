"use client";
import React, { useState, useEffect } from "react";
import { Loader2, ChevronRight } from "lucide-react";
import { notify } from "@/components/ui/sonner";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import {
  getLLMConfigValidationError,
  handleSaveLLMConfig,
} from "@/utils/storeHelpers";
import { useRouter } from "next/navigation";
import { LLMConfig } from "@/types/llm_config";
import SettingSideBar from "./SettingSideBar";
import TextProvider from "./TextProvider";
import ImageProvider from "./ImageProvider";
import WebSearchProvider from "./WebSearchProvider";
import PrivacySettings from "./PrivacySettings";
import { IMAGE_PROVIDERS, LLM_PROVIDERS } from "@/utils/providerConstants";
import LogoutButton from "@/components/Auth/LogoutButton";

const SettingsPage = () => {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<
    "text-provider" | "image-provider" | "web-search-provider" | "privacy" | "session"
  >("text-provider");
  const userConfigState = useSelector((state: RootState) => state.userConfig);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(
    userConfigState.llm_config
  );
  const canChangeKeys = userConfigState.can_change_keys;
  const [buttonState, setButtonState] = useState({
    isLoading: false,
    isDisabled: false,
    text: "Save Configuration",
  });

  const handleSaveConfig = async () => {
    const validationError = getLLMConfigValidationError(llmConfig);
    if (validationError) {
      notify.warning("Cannot save settings", validationError);
      return;
    }

    try {
      setButtonState((prev) => ({
        ...prev,
        isLoading: true,
        isDisabled: true,
        text: "Saving Configuration...",
      }));
      await handleSaveLLMConfig(llmConfig);
      notify.success("Settings saved", "Your configuration was saved successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.";
      notify.error("Could not save settings", message);
    } finally {
      setButtonState({
        isLoading: false,
        isDisabled: false,
        text: "Save Configuration",
      });
    }
  };

  useEffect(() => {
    if (!canChangeKeys) {
      router.push("/dashboard");
    }
  }, [canChangeKeys, router]);

  if (!canChangeKeys) {
    return null;
  }

  const textProviderKey = llmConfig.LLM || "custom";
  const textProviderLabel =
    LLM_PROVIDERS[textProviderKey]?.label || textProviderKey;
  const selectedTextModel = llmConfig.CUSTOM_MODEL || "";
  const textSummary = selectedTextModel
    ? `${textProviderLabel} (${selectedTextModel})`
    : textProviderLabel;

  const imageSummary = llmConfig.DISABLE_IMAGE_GENERATION
    ? "Image generation disabled"
    : llmConfig.IMAGE_PROVIDER
      ? IMAGE_PROVIDERS[llmConfig.IMAGE_PROVIDER]?.label || llmConfig.IMAGE_PROVIDER
      : "No image provider";
  const webSearchSummary = "Web: Disabled";

  return (
    <div className="h-screen font-syne flex flex-col overflow-hidden relative">
      <main className="w-full mx-auto gap-6 overflow-hidden flex">
        <SettingSideBar
          mode="presenton"
          setMode={() => {}}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
        />
        <div className="w-full">
          <div className="sticky top-0 right-0 z-50 py-[28px] backdrop-blur mb-4">
            <div className="flex gap-3 items-center">
              <h3 className="text-[28px] tracking-[-0.84px] font-unbounded font-normal text-black flex items-center gap-2">
                Settings
              </h3>
              <p className="text-[10px] px-2.5 py-0.5 rounded-[50px] text-[#7A5AF8] border border-[#EDEEEF] font-medium">
                {textSummary} · {imageSummary} · {webSearchSummary}
              </p>
            </div>
          </div>

          {selectedProvider === "text-provider" && (
            <TextProvider
              onInputChange={(value, field) => {
                setLlmConfig(prev => ({ ...prev, [field]: value }));
              }}
              llmConfig={llmConfig}
            />
          )}
          {selectedProvider === "image-provider" && (
            <ImageProvider llmConfig={llmConfig} setLlmConfig={setLlmConfig} />
          )}
          {selectedProvider === "web-search-provider" && <WebSearchProvider />}
          {selectedProvider === "privacy" && <PrivacySettings />}
          {selectedProvider === "session" && (
            <div className="w-full max-w-lg space-y-5 rounded-[20px] border border-[#EDEEEF] bg-white p-7">
              <div>
                <h4 className="font-unbounded text-lg font-normal text-black">Sign out</h4>
                <p className="mt-2 font-syne text-sm leading-relaxed text-[#494A4D]">
                  End your session on this deployment.
                </p>
              </div>
              <LogoutButton
                label="Sign out"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[58px] border border-[#EDEEEF] bg-[#7C51F8] px-5 py-3 font-syne text-xs font-semibold text-white transition hover:bg-[#6d46e6]"
              />
            </div>
          )}
        </div>
      </main>

      {selectedProvider !== "session" && (
        <div className="mx-auto fixed bottom-20 right-5">
          <button
            onClick={handleSaveConfig}
            disabled={buttonState.isDisabled}
            style={{
              background:
                "linear-gradient(270deg, #D5CAFC 2.4%, #E3D2EB 27.88%, #F4DCD3 69.23%, #FDE4C2 100%)",
              color: "#101323",
            }}
            className={`w-full font-syne font-semibold flex items-center justify-center gap-2 py-3 px-5 rounded-[58px] transition-all duration-500 ${
              buttonState.isDisabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {buttonState.isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {buttonState.text}
              </div>
            ) : (
              buttonState.text
            )}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
