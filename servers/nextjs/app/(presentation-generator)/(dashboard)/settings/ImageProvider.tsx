import ToolTip from '@/components/ToolTip'
import { Switch } from '@/components/ui/switch'
import { LLMConfig } from '@/types/llm_config'
import OpenAICompatibleImageFields from '@/components/OpenAICompatibleImageFields'
import React, { useState } from 'react'

const ImageProvider = ({ llmConfig, setLlmConfig }: { llmConfig: LLMConfig, setLlmConfig: (config: any) => void }) => {
    const [openaiCompatListMeta, setOpenaiCompatListMeta] = useState<{
        modelsChecked: boolean
        modelCount: number
    }>({ modelsChecked: false, modelCount: 0 })

    const isImageGenerationDisabled = llmConfig.DISABLE_IMAGE_GENERATION ?? false;
    const handleChangeImageGenerationDisabled = (value: boolean) => {
        setLlmConfig((prev: any) => ({
            ...prev,
            DISABLE_IMAGE_GENERATION: value
        }));
    }

    return (
        <div className="space-y-6 bg-[#F9F8F8] p-7 rounded-[12px] ">
            <div className="mb-4 bg-white p-10 pt-5 rounded-[12px]">
                <ToolTip content="Enable/Disable Image Generation" className='flex justify-end items-center'>
                    <div className='flex justify-end items-center'>
                        <Switch
                            checked={!isImageGenerationDisabled}
                            className='data-[state=checked]:bg-[#4791FF] data-[state=unchecked]:bg-gray-400'
                            onCheckedChange={(checked) => handleChangeImageGenerationDisabled(!checked)}
                        />
                    </div>
                </ToolTip>
                <div className='flex items-center justify-between'>
                    <div className="max-w-[290px] pb-[50px]">
                        <div className='w-[60px] h-[60px] px-[13.5px] py-[14.2px] rounded-[4px] flex items-center justify-center'
                            style={{ backgroundColor: '#F4F3FF' }}
                        >
                            <img src="/image-markup.svg" className='w-full h-full object-cover' alt='image-markup' />
                        </div>
                        <h3 className="text-xl font-normal text-[#191919] py-2.5">Image Generation Settings</h3>
                        <p className="text-sm text-gray-500">
                            OpenAI-compatible image generation (FLUX)
                        </p>
                    </div>
                    <div className=''>
                        {!isImageGenerationDisabled && (
                            <OpenAICompatibleImageFields
                                layout="textProviderSettings"
                                baseUrl={llmConfig.OPENAI_COMPAT_IMAGE_BASE_URL || ""}
                                apiKey={llmConfig.OPENAI_COMPAT_IMAGE_API_KEY || ""}
                                model={llmConfig.OPENAI_COMPAT_IMAGE_MODEL || ""}
                                onBaseUrlChange={(v) => {
                                    setLlmConfig((prev: any) => ({ ...prev, OPENAI_COMPAT_IMAGE_BASE_URL: v }));
                                }}
                                onApiKeyChange={(v) => {
                                    setLlmConfig((prev: any) => ({ ...prev, OPENAI_COMPAT_IMAGE_API_KEY: v }));
                                }}
                                onModelChange={(v) => {
                                    setLlmConfig((prev: any) => ({ ...prev, OPENAI_COMPAT_IMAGE_MODEL: v }));
                                }}
                                onModelListMetaChange={setOpenaiCompatListMeta}
                            />
                        )}
                    </div>
                </div>
            </div>

            {!isImageGenerationDisabled &&
                openaiCompatListMeta.modelsChecked &&
                openaiCompatListMeta.modelCount === 0 && (
                    <>
                        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-sm text-yellow-800">
                                No models found. Make sure your provider credentials are valid and the provider is reachable.
                            </p>
                        </div>
                        <div className="flex w-full justify-end">
                            <div className="w-[205px]">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Image model id</label>
                                <input
                                    type="text"
                                    placeholder="e.g. dall-e-3, flux-dev"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    value={llmConfig.OPENAI_COMPAT_IMAGE_MODEL || ""}
                                    onChange={(e) => {
                                        setLlmConfig((prev: any) => ({
                                            ...prev,
                                            OPENAI_COMPAT_IMAGE_MODEL: e.target.value,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
        </div>
    )
}

export default ImageProvider
