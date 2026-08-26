"use client";

import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  activeTab?: string;
  onChange: (tabId: string) => void;
  className?: string;
};

export default function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id || "");
  const current = activeTab ?? internalActive;

  function handleChange(tabId: string) {
    setInternalActive(tabId);
    onChange(tabId);
  }

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex gap-0 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              current === tab.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
