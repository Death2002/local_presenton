import React, { useEffect, useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronLeft, ChevronUp, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { LLMConfig } from '@/types/llm_config';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { notify } from '@/components/ui/sonner';
import ToolTip from '../ToolTip';
import { Switch } from '../ui/switch';
import { getLLMConfigValidationError, handleSaveLLMConfig } from '@/utils/storeHelpers';
import { getApiUrl } from '@/utils/api';
import OpenAICompatibleImageFields from '@/components/OpenAICompatibleImageFields';

const PresentonMode = ({ currentStep, setStep }: { currentStep: number, setStep: (step: number) => void }) => {
    const [openModelSelect, setOpenModelSelect] = useState(false);
    const userConfigState = useSelector((state: RootState) => state.userConfig);

    const [showApiKey, setShowApiKey] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsChecked, setModelsChecked] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [llmConfig, setLlmConfig] = useState<LLMConfig>(
        userConfigState.llm_config
    );

    const currentModel = llmConfig.CUSTOM_MODEL || '';

    const fetchAvailableModels = async () => {
        if (!llmConfig.CUSTOM_LLM_URL) return;
        setModelsLoading(true);
        try {
            const response = await fetch(getApiUrl('/api/v1/ppt/openai/models/available'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: llmConfig.CUSTOM_LLM_URL,
                    api_key: llmConfig.CUSTOM_LLM_API_KEY
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const normalizedModels: string[] = Array.isArray(data) ? data : [];
                setAvailableModels(normalizedModels);
                setModelsChecked(true);

                if (normalizedModels.length > 0) {
                    const nextModel = normalizedModels.includes(currentModel) ? currentModel : normalizedModels[0];
                    setLlmConfig(prev => ({
                        ...prev,
                        CUSTOM_MODEL: nextModel
                    }));
                }
            } else {
                console.error('Failed to fetch models');
                setAvailableModels([]);
                setModelsChecked(true);
                notify.error("Could not load models", "Check your API key or endpoint and try again.");
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            notify.error("Could not load models", "The server could not list models. Check your API key or endpoint and try again.");
            setAvailableModels([]);
            setModelsChecked(true);
        } finally {
            setModelsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            const validationError = getLLMConfigValidationError(llmConfig);
            if (validationError) {
                notify.warning("Cannot save yet", validationError);
                return;
            }
            setSavingConfig(true);
            await handleSaveLLMConfig(llmConfig);
            notify.success("Configuration saved", "Your configuration was saved successfully.");
            setStep(3)
        } catch (error) {
            notify.error("Could not save configuration", error instanceof Error ? error.message : "Failed to save configuration");
        } finally {
            setSavingConfig(false);
        }
    };

    return (
        <div className='w-full max-w-[660px] font-syne pb-10'>
            <p className='px-2.5 py-0.5 w-fit text-[#7A5AF8] rounded-[50px] border border-[#EDEEEF] text-[10px] font-medium mb-5 font-syne'>PRESENTON</p>
            <div>
                <h2 className='mb-4 text-black text-[26px] font-normal font-unbounded '>Choose your content providers</h2>
                <p className='text-[#000000CC] text-xl font-normal font-syne'>Select the AI engines that will generate your slide text and visuals.</p>
            </div>
            <div className='flex items-center gap-2 bg-[#F0F3F9B2] rounded-[8px] px-6 py-2.5 my-[54px]'>
                <Info className='w-4 h-4 fill-[#003399] stroke-white' />
                <p className='text-sm text-[#5F6062] font-medium'>Connects to self-hosted GLM-5.1 via OpenAI-compatible gateway. All processing stays within your infrastructure.</p>
            </div>

            {/* Text Provider */}
            <div className='p-3 border border-[#EDEEEF] rounded-[11px] bg-white'>
                <div className="flex items-center gap-[24.3px] mb-[42px]">
                    <div className='w-[74px] h-[74px] rounded-[4px] pt-[16.8px] pr-[17.15px] pb-[17.2px] pl-[16.85px] flex items-center justify-center'
                        style={{ backgroundColor: '#4C55541A' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <path d="M20 6.6665V33.3332" stroke="#4C5554" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.66666 11.6665V8.33317C6.66666 7.89114 6.84225 7.46722 7.15481 7.15466C7.46737 6.8421 7.8913 6.6665 8.33332 6.6665H31.6667C32.1087 6.6665 32.5326 6.8421 32.8452 7.15466C33.1577 7.46722 33.3333 7.89114 33.3333 8.33317V11.6665" stroke="#4C5554" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 33.3335H25" stroke="#4C5554" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className='w-full'>
                        <h3 className="text-xl font-normal text-[#191919] pb-1.5">Text Generation Settings</h3>
                        <p className="text-sm text-gray-500">Self-hosted GLM-5.1 via OpenAI-compatible gateway</p>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-4">
                    <div className="relative flex w-full flex-col justify-end items-start">
                        <div className="flex flex-col justify-start w-full gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OpenAI-compatible Base URL
                                </label>
                                <input
                                    type="text"
                                    value={llmConfig.CUSTOM_LLM_URL}
                                    onChange={(e) => setLlmConfig(prev => ({
                                        ...prev,
                                        CUSTOM_LLM_URL: e.target.value
                                    }))}
                                    className="w-full px-2 py-3 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    placeholder="http://your-gateway:8000/v1"
                                />
                            </div>

                            <div>
                                <div className='flex items-center justify-between mb-2'>
                                    <label className="block text-sm font-medium text-gray-700">
                                        API Key
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={llmConfig.CUSTOM_LLM_API_KEY || ''}
                                        onChange={(e) => setLlmConfig(prev => ({
                                            ...prev,
                                            CUSTOM_LLM_API_KEY: e.target.value
                                        }))}
                                        className="w-full px-2 py-3 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your API key"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey((prev) => !prev)}
                                        className='absolute right-2 top-1/2 -translate-y-1/2 bg-white px-2 py-1 cursor-pointer'
                                    >
                                        {showApiKey ? <Eye className='w-4 h-4 text-gray-500' /> : <EyeOff className='w-4 h-4 text-gray-500' />}
                                    </button>
                                </div>
                            </div>

                            {!modelsChecked || (modelsChecked && availableModels.length === 0) ? (
                                <button
                                    onClick={fetchAvailableModels}
                                    disabled={modelsLoading || !llmConfig.CUSTOM_LLM_URL}
                                    className={`mt-2 py-2.5 bg-[#EDEEEF] disabled:opacity-50 disabled:cursor-not-allowed px-3.5 w-full rounded-[48px] text-xs font-semibold text-[#101323] transition-all duration-200 border ${modelsLoading
                                        ? "border-gray-300 cursor-not-allowed text-gray-500"
                                        : "border-[#EDEEEF] text-[#101323] hover:bg-[#EDEEEF]/90 focus:ring-2 focus:ring-blue-500/20"
                                    }`}
                                >
                                    {modelsLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Checking for models...
                                        </span>
                                    ) : (
                                        "Validate & Load Models"
                                    )}
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {modelsChecked && availableModels.length > 0 && (
                        <div className="w-full max-w-[222px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Model
                            </label>
                            <Popover
                                open={openModelSelect}
                                onOpenChange={setOpenModelSelect}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openModelSelect}
                                        className="w-full h-12 px-4 py-4 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors hover:border-gray-400 justify-between"
                                    >
                                        <span className="text-sm truncate font-medium text-gray-900">
                                            {currentModel
                                                ? availableModels.find(model => model === currentModel) || currentModel
                                                : "Select a model"}
                                        </span>
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="p-0"
                                    align="start"
                                    style={{ width: "var(--radix-popover-trigger-width)" }}
                                >
                                    <Command>
                                        <CommandInput placeholder="Search models..." />
                                        <CommandList>
                                            <CommandEmpty>No model found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableModels.map((model, index) => (
                                                    <CommandItem
                                                        key={index}
                                                        value={model}
                                                        onSelect={(value) => {
                                                            setLlmConfig(prev => ({
                                                                ...prev,
                                                                CUSTOM_MODEL: value
                                                            }));
                                                            setOpenModelSelect(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                currentModel === model
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="text-sm font-medium text-gray-900">{model}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Provider */}
            <div className={`p-3 border border-[#EDEEEF] rounded-[11px] relative mt-5 bg-white ${llmConfig.DISABLE_IMAGE_GENERATION ? "bg-[#F9FAFB]" : ""}`}>
                <ToolTip content="Enable/Disable Image Generation" className='flex justify-end items-center absolute top-3 right-3'>
                    <div className='flex justify-end items-center'>
                        <Switch
                            checked={!llmConfig.DISABLE_IMAGE_GENERATION}
                            className='data-[state=checked]:bg-[#4791FF] h-[22px] w-[36px] data-[state=unchecked]:bg-[#E2E0E1]'
                            onCheckedChange={(checked) => setLlmConfig(prev => ({
                                ...prev,
                                DISABLE_IMAGE_GENERATION: !checked
                            }))}
                        />
                    </div>
                </ToolTip>
                <div className={`flex items-center gap-6 ${llmConfig.DISABLE_IMAGE_GENERATION ? "" : "mb-[42px]"}`}>
                    <div className='w-[74px] h-[74px] px-[13.5px] py-[14.2px] rounded-[4px] flex items-center justify-center'
                        style={{ backgroundColor: '#F4F3FF' }}
                    >
                        <img src="/image-markup.svg" className='w-full h-full object-cover' alt='image-markup' />
                    </div>
                    <div>
                        <h3 className="text-xl font-normal text-[#191919]">Image Generation Settings</h3>
                        <p className="text-sm text-gray-500">Self-hosted FLUX via OpenAI-compatible image API</p>
                    </div>
                </div>
                {!llmConfig.DISABLE_IMAGE_GENERATION && (
                    <OpenAICompatibleImageFields
                        layout="stacked"
                        baseUrl={llmConfig.OPENAI_COMPAT_IMAGE_BASE_URL || ""}
                        apiKey={llmConfig.OPENAI_COMPAT_IMAGE_API_KEY || ""}
                        model={llmConfig.OPENAI_COMPAT_IMAGE_MODEL || ""}
                        onBaseUrlChange={(v) =>
                            setLlmConfig((prev) => ({
                                ...prev,
                                OPENAI_COMPAT_IMAGE_BASE_URL: v,
                            }))
                        }
                        onApiKeyChange={(v) =>
                            setLlmConfig((prev) => ({
                                ...prev,
                                OPENAI_COMPAT_IMAGE_API_KEY: v,
                            }))
                        }
                        onModelChange={(v) =>
                            setLlmConfig((prev) => ({
                                ...prev,
                                OPENAI_COMPAT_IMAGE_MODEL: v,
                            }))
                        }
                    />
                )}
            </div>

            <div className='fixed bottom-16 mr-8 max-w-[1440px] right-16 flex justify-end items-center gap-2.5'>
                <button
                    disabled={currentStep === 1}
                    onClick={() => setStep(currentStep - 1)}
                    className='border border-[#EDEEEF] rounded-[53px] px-4 py-1 h-[36px]'
                >
                    <ChevronLeft className='w-4 h-4 text-gray-500' />
                </button>
                <button
                    disabled={savingConfig}
                    onClick={handleSaveConfig}
                    className='border font-syne border-[#EDEEEF] bg-[#7C51F8] rounded-[58px] px-5 py-2.5 text-white text-xs font-semibold'
                >
                    Continue to Finish
                </button>
            </div>
        </div>
    )
}

export default PresentonMode
