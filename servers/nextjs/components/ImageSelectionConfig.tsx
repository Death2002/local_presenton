import React from 'react'
import { Switch } from './ui/switch';
import { LLMConfig } from '@/types/llm_config';
import OpenAICompatibleImageFields from '@/components/OpenAICompatibleImageFields';

const ImageSelectionConfig = ({ isImageGenerationDisabled, openImageProviderSelect, setOpenImageProviderSelect, llmConfig, input_field_changed, getApiKeyValue, handleApiKeyInputChange }: {
    isImageGenerationDisabled: boolean,
    openImageProviderSelect: boolean,
    setOpenImageProviderSelect: (open: boolean) => void,
    llmConfig: LLMConfig,
    input_field_changed: (value: string, field: string) => void,
    getApiKeyValue: (field: string) => string,
    handleApiKeyInputChange: (field: string, value: string) => void
}) => {
    return (
        <div className='mt-7'>
            <div className="p-10 flex justify-between items-center bg-white rounded-[12px]">
                <div>
                    <h4 className="text-xl font-normal text-[#191919]">Image Generation Settings</h4>
                    <p className="mt-2 text-sm max-w-[205px] text-gray-500">
                        OpenAI-compatible image generation (FLUX).
                    </p>
                </div>
                <div className='flex items-center gap-4'>
                    <div className="w-[295px]">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-gray-700">
                                Enable Image Generation
                            </label>
                            <Switch
                                checked={!isImageGenerationDisabled}
                                onCheckedChange={(checked) => {
                                    input_field_changed(String(!checked), "disable_image_generation");
                                }}
                            />
                        </div>
                    </div>

                    {!isImageGenerationDisabled && (
                        <OpenAICompatibleImageFields
                            layout="stacked"
                            baseUrl={llmConfig.OPENAI_COMPAT_IMAGE_BASE_URL || ""}
                            apiKey={llmConfig.OPENAI_COMPAT_IMAGE_API_KEY || ""}
                            model={llmConfig.OPENAI_COMPAT_IMAGE_MODEL || ""}
                            onBaseUrlChange={(v) =>
                                input_field_changed(v, "openai_compat_image_base_url")
                            }
                            onApiKeyChange={(v) =>
                                input_field_changed(v, "openai_compat_image_api_key")
                            }
                            onModelChange={(v) =>
                                input_field_changed(v, "openai_compat_image_model")
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ImageSelectionConfig
