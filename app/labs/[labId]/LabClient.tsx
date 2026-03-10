'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { LabConfig, TestResult } from '@/lib/types';
import { runTestsInWorker } from '@/lib/test-runner';
import CodeEditor from '@/components/CodeEditor';
import StepIndicator from '@/components/StepIndicator';
import GuidePanel from '@/components/GuidePanel';
import TestResultsPanel from '@/components/TestResultsPanel';
import DiscussionPanel from '@/components/DiscussionPanel';
import CompletionOverlay from '@/components/CompletionOverlay';

interface LabClientProps {
  lab: LabConfig;
}

export default function LabClient({ lab }: LabClientProps) {
  const [stepCompleted, setStepCompleted] = useState<boolean[]>(() => {
    if (typeof window === 'undefined') return new Array(lab.steps.length).fill(false);
    try {
      const saved = localStorage.getItem(`lab:${lab.id}:completed`);
      if (saved) {
        const parsed = JSON.parse(saved) as boolean[];
        if (parsed.length === lab.steps.length) return parsed;
      }
    } catch { /* ignore */ }
    return new Array(lab.steps.length).fill(false);
  });
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const match = window.location.hash.match(/step=(\d+)/);
    if (match) {
      const idx = Number(match[1]) - 1;
      if (idx >= 0 && idx < lab.steps.length) {
        const allPrevCompleted = Array.from({ length: idx }, (_, i) => i).every(
          (i) => {
            try {
              const saved = localStorage.getItem(`lab:${lab.id}:completed`);
              if (saved) return (JSON.parse(saved) as boolean[])[i];
            } catch { /* ignore */ }
            return false;
          }
        );
        if (allPrevCompleted) return idx;
      }
    }
    return 0;
  });
  const [activeTab, setActiveTab] = useState(0);
  const [userEdits, setUserEdits] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(`lab:${lab.id}:edits`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [testPanelOpen, setTestPanelOpen] = useState(true);
  const [discussionSubmitted, setDiscussionSubmitted] = useState<boolean[]>(
    () => new Array(lab.steps.length).fill(false)
  );
  const [discussionWidth, setDiscussionWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  // 스텝 변경 시 해시 업데이트
  useEffect(() => {
    window.location.hash = `step=${currentStep + 1}`;
  }, [currentStep]);

  // 에디터 코드 변경 시 localStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem(`lab:${lab.id}:edits`, JSON.stringify(userEdits));
    } catch {
      // localStorage 용량 초과 등 무시
    }
  }, [lab.id, userEdits]);

  // 스텝 완료 상태 localStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem(`lab:${lab.id}:completed`, JSON.stringify(stepCompleted));
    } catch {
      // localStorage 용량 초과 등 무시
    }
  }, [lab.id, stepCompleted]);

  // 브라우저 뒤로가기/앞으로가기 대응
  useEffect(() => {
    const onHashChange = () => {
      const match = window.location.hash.match(/step=(\d+)/);
      if (match) {
        const stepIndex = Number(match[1]) - 1;
        if (stepIndex >= 0 && stepIndex < lab.steps.length) {
          const canAccess = stepIndex === 0 ||
            Array.from({ length: stepIndex }, (_, i) => i).every((i) => stepCompleted[i]);
          if (canAccess) {
            setCurrentStep(stepIndex);
            setActiveTab(0);
            setTestResults(null);
          } else {
            window.location.hash = `step=${currentStep + 1}`;
          }
        }
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [lab.steps.length, stepCompleted, currentStep]);

  const step = lab.steps[currentStep];
  const tabs = step.tabs;
  const hasDiscussion = step.discussion && step.discussion.length > 0;

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
      const currentCode = getCodeForTab(currentStep, activeTab);
      const key = `${currentStep}-${activeTab}`;
      setUserEdits((prev) => ({ ...prev, [key]: currentCode }));
      setActiveTab(tabIndex);
    },
    [currentStep, activeTab, getCodeForTab]
  );

  const handleStepChange = useCallback(
    (stepIndex: number) => {
      const canAccess = stepIndex === 0 ||
        Array.from({ length: stepIndex }, (_, i) => i).every((i) => stepCompleted[i]);
      if (!canAccess) return;

      const currentCode = getCodeForTab(currentStep, activeTab);
      const key = `${currentStep}-${activeTab}`;
      setUserEdits((prev) => ({ ...prev, [key]: currentCode }));
      setCurrentStep(stepIndex);
      setActiveTab(0);
      setTestResults(null);
    },
    [currentStep, activeTab, getCodeForTab, stepCompleted]
  );

  const handlePrev = useCallback(() => {
    if (currentStep > 0) handleStepChange(currentStep - 1);
  }, [currentStep, handleStepChange]);

  const handleNext = useCallback(() => {
    if (currentStep < lab.steps.length - 1) handleStepChange(currentStep + 1);
  }, [currentStep, lab.steps.length, handleStepChange]);

  const handleDiscussionSubmit = useCallback(
    (_answer: string) => {
      setDiscussionSubmitted((prev) => {
        const next = [...prev];
        next[currentStep] = true;
        return next;
      });
    },
    [currentStep]
  );

  const handleFinishLab = useCallback(() => {
    setShowCompletion(true);
  }, []);

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

      const passCount = results.filter((r) => r.pass).length;
      const failCount = results.filter((r) => !r.pass).length;
      const allPass = failCount === 0;

      let isComplete: boolean;
      if (typeof step.expectFailure === 'object') {
        isComplete =
          passCount === step.expectFailure.passCount &&
          failCount === step.expectFailure.failCount;
      } else if (step.expectFailure) {
        isComplete = failCount > 0;
      } else {
        isComplete = allPass;
      }

      if (isComplete) {
        setStepCompleted((prev) => {
          const next = [...prev];
          next[currentStep] = true;
          return next;
        });
      }
    } finally {
      setIsRunning(false);
    }
  }, [tabs, step, currentStep, getCodeForTab, lab.steps.length]);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startWidth: discussionWidth };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [discussionWidth]
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - e.clientX;
      const newWidth = Math.min(600, Math.max(280, dragRef.current.startWidth + delta));
      setDiscussionWidth(newWidth);
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const handleResizeDoubleClick = useCallback(() => {
    setDiscussionWidth(340);
  }, []);

  const currentCode = getCodeForTab(currentStep, activeTab);
  const currentTabReadonly = tabs[activeTab]?.readonly ?? true;

  return (
    <div className={`flex h-screen flex-col overflow-hidden bg-bg-deep ${isDragging ? 'select-none cursor-col-resize' : ''}`}>
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

      {/* Main Content: Guide | Editor+Tests | Discussion */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Guide Panel */}
        <div className="w-[340px] shrink-0 border-r border-border overflow-hidden">
          <GuidePanel
            step={step}
            currentStep={currentStep}
            totalSteps={lab.steps.length}
            isCompleted={stepCompleted[currentStep]}
            isDiscussionSubmitted={discussionSubmitted[currentStep]}
            onPrev={handlePrev}
            onNext={handleNext}
            onFinish={handleFinishLab}
          />
        </div>

        {/* Center — Code Editor + Test Results (bottom toggle) */}
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

          {/* Test Results — bottom collapsible panel */}
          <TestResultsPanel
            results={testResults}
            onRun={handleRunTests}
            isRunning={isRunning}
            isOpen={testPanelOpen}
            onToggle={() => setTestPanelOpen((v) => !v)}
            expectFailure={step.expectFailure}
          />
        </div>

        {/* Right — Discussion Panel (resizable) */}
        {hasDiscussion && (
          <>
            {/* Resize Handle */}
            <div
              className={`group relative w-1 shrink-0 cursor-col-resize transition-colors ${
                isDragging ? 'bg-blue' : 'bg-border hover:bg-blue/50'
              }`}
              onPointerDown={handleResizeStart}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onDoubleClick={handleResizeDoubleClick}
            >
              <div
                className={`absolute inset-y-0 -left-1 -right-1 ${
                  isDragging ? '' : 'group-hover:bg-blue/10'
                }`}
              />
              {/* Drag indicator dots */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                <div className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                <div className="w-0.5 h-0.5 rounded-full bg-text-muted" />
              </div>
            </div>
            <div
              className="shrink-0 overflow-hidden"
              style={{ width: discussionWidth }}
            >
              <DiscussionPanel
                labId={lab.id}
                stepIndex={currentStep}
                questions={step.discussion!}
                references={step.references}
                isSubmitted={discussionSubmitted[currentStep]}
                onSubmit={handleDiscussionSubmit}
              />
            </div>
          </>
        )}
      </div>

      {/* Completion Overlay */}
      <CompletionOverlay
        show={showCompletion}
        onClose={() => setShowCompletion(false)}
        labId={lab.id}
        steps={lab.steps}
      />
    </div>
  );
}
