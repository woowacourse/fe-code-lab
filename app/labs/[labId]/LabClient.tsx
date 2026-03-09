'use client';

import { useState, useCallback } from 'react';
import type { LabConfig, TestResult } from '@/lib/types';
import { runTestsInWorker } from '@/lib/test-runner';
import CodeEditor from '@/components/CodeEditor';
import StepIndicator from '@/components/StepIndicator';
import GuidePanel from '@/components/GuidePanel';
import TestResultsPanel from '@/components/TestResultsPanel';
import CompletionOverlay from '@/components/CompletionOverlay';

interface LabClientProps {
  lab: LabConfig;
}

export default function LabClient({ lab }: LabClientProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [stepCompleted, setStepCompleted] = useState<boolean[]>(
    () => new Array(lab.steps.length).fill(false)
  );
  const [userEdits, setUserEdits] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const step = lab.steps[currentStep];
  const tabs = step.tabs;
  const tabNames = tabs.map((t) => t.name);

  const getCodeForTab = useCallback(
    (stepIndex: number, tabIndex: number): string => {
      const key = `${stepIndex}-${tabIndex}`;
      if (key in userEdits) return userEdits[key];
      const s = lab.steps[stepIndex];
      const tabName = s.tabs[tabIndex].name;
      return s.files[tabName] ?? '';
    },
    [userEdits, lab.steps]
  );

  const saveCurrentEdit = useCallback(
    (value: string) => {
      const key = `${currentStep}-${activeTab}`;
      setUserEdits((prev) => ({ ...prev, [key]: value }));
    },
    [currentStep, activeTab]
  );

  const handleTabSwitch = useCallback(
    (tabIndex: number) => {
      // Save current editor content before switching
      const currentCode = getCodeForTab(currentStep, activeTab);
      const key = `${currentStep}-${activeTab}`;
      setUserEdits((prev) => ({ ...prev, [key]: currentCode }));
      setActiveTab(tabIndex);
    },
    [currentStep, activeTab, getCodeForTab]
  );

  const handleStepChange = useCallback(
    (stepIndex: number) => {
      // Save current edits
      const currentCode = getCodeForTab(currentStep, activeTab);
      const key = `${currentStep}-${activeTab}`;
      setUserEdits((prev) => ({ ...prev, [key]: currentCode }));
      setCurrentStep(stepIndex);
      setActiveTab(0);
      setTestResults(null);
    },
    [currentStep, activeTab, getCodeForTab]
  );

  const handlePrev = useCallback(() => {
    if (currentStep > 0) handleStepChange(currentStep - 1);
  }, [currentStep, handleStepChange]);

  const handleNext = useCallback(() => {
    if (currentStep < lab.steps.length - 1) handleStepChange(currentStep + 1);
  }, [currentStep, lab.steps.length, handleStepChange]);

  const handleRunTests = useCallback(async () => {
    setIsRunning(true);
    try {
      const codeBlocks: string[] = [];
      let testCode = '';

      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const code = tab.readonly
          ? step.files[tab.name] ?? ''
          : getCodeForTab(currentStep, i);

        if (tab.name === 'test.js') {
          testCode = code;
        } else {
          codeBlocks.push(code);
        }
      }

      const results = await runTestsInWorker(codeBlocks, testCode);
      setTestResults(results);

      // Determine completion
      const allPass = results.every((r) => r.pass);
      const anyFail = results.some((r) => !r.pass);
      const isComplete = step.expectFailure ? anyFail : allPass;

      if (isComplete) {
        setStepCompleted((prev) => {
          const next = [...prev];
          next[currentStep] = true;
          return next;
        });

        // Show completion overlay if final step
        if (currentStep === lab.steps.length - 1) {
          setTimeout(() => setShowCompletion(true), 800);
        }
      }
    } finally {
      setIsRunning(false);
    }
  }, [tabs, step, currentStep, getCodeForTab, lab.steps.length]);

  const currentCode = getCodeForTab(currentStep, activeTab);
  const currentTabReadonly = tabs[activeTab]?.readonly ?? true;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-deep">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-extrabold text-text-primary">
            {lab.title}
          </h1>
          <span className="rounded-full bg-blue-bg px-2.5 py-0.5 text-xs font-semibold text-blue">
            Lab
          </span>
        </div>
        <StepIndicator
          totalSteps={lab.steps.length}
          currentStep={currentStep}
          completedSteps={stepCompleted}
          onStepClick={handleStepChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Guide Panel */}
        <div className="w-[380px] shrink-0 border-r border-border overflow-hidden">
          <GuidePanel
            step={step}
            currentStep={currentStep}
            totalSteps={lab.steps.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-border bg-bg-surface">
            {tabs.map((tab, i) => (
              <button
                key={tab.name}
                onClick={() => handleTabSwitch(i)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  i === activeTab
                    ? 'border-b-2 border-blue text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="text-xs">{tab.readonly ? '🔒' : '✏️'}</span>
                {tab.name}
              </button>
            ))}
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={currentCode}
              onChange={currentTabReadonly ? undefined : saveCurrentEdit}
              readonly={currentTabReadonly}
            />
          </div>

          {/* Test Results */}
          <div className="h-48 shrink-0 border-t border-border">
            <TestResultsPanel
              results={testResults}
              onRun={handleRunTests}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>

      {/* Completion Overlay */}
      <CompletionOverlay
        show={showCompletion}
        onClose={() => setShowCompletion(false)}
      />
    </div>
  );
}
