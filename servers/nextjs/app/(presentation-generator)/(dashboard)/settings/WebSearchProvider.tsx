"use client";

import React from "react";
import { Search } from "lucide-react";

const WebSearchProvider = () => {
  return (
    <div className="space-y-6 rounded-[12px] bg-[#F9F8F8] p-7">
      <div className="mb-4 rounded-[12px] bg-white p-10 pt-5">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:gap-10">
          <div className="max-w-[300px] shrink-0 pb-2 lg:pb-[20px]">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[4px] bg-[#F4F3FF]">
              <Search className="h-7 w-7 text-[#5146E5]" />
            </div>
            <h3 className="py-2.5 text-xl font-normal text-[#191919]">
              Web Search Settings
            </h3>
            <p className="text-sm text-gray-500">
              Web search is disabled in air-gapped mode.
            </p>
          </div>
          <div className="w-full max-w-[360px] space-y-4">
            <div className="rounded-lg border border-[#EDEEEF] bg-[#FAFAFA] p-4 text-sm text-[#4C5554]">
              Web search is not available in air-gapped enterprise mode. All
              presentation content is generated using only the provided context
              and the local LLM.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSearchProvider;
