import { RootState } from '@/store/store';
import { IMAGE_PROVIDERS, LLM_PROVIDERS } from '@/utils/providerConstants';
import React from 'react'
import { useSelector } from 'react-redux';

const CurrentConfig = () => {
    const userConfigState = useSelector((state: RootState) => state.userConfig);
    const llmConfig = userConfigState.llm_config;
    const textProviderLabel = LLM_PROVIDERS[llmConfig.LLM || ""]?.label || "Custom";
    const selectedTextModel = llmConfig.CUSTOM_MODEL || "";
    const textSummary = selectedTextModel
        ? `${textProviderLabel} (${selectedTextModel})`
        : textProviderLabel;

    const imageSummary = llmConfig.DISABLE_IMAGE_GENERATION
        ? "Image generation disabled"
        : llmConfig.IMAGE_PROVIDER
            ? IMAGE_PROVIDERS[llmConfig.IMAGE_PROVIDER]?.label || llmConfig.IMAGE_PROVIDER
            : "No image provider";

    return (
        <p className="text-[10px] px-2.5 py-0.5 rounded-[50px] text-[#7A5AF8] border border-[#EDEEEF] font-medium ">
            {textSummary} · {imageSummary}
        </p>
    )
}

export default CurrentConfig
