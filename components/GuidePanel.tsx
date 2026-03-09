'use client';

import { useState } from 'react';
import type { LabStep } from '@/lib/types';

interface GuidePanelProps {
  step: LabStep;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function GuidePanel({
  step,
  currentStep,
  totalSteps,
  isCompleted,
  onPrev,
  onNext,
}: GuidePanelProps) {
  const [showHint, setShowHint] = useState(false);

  // Content comes from trusted lab config files bundled with the app,
  // not from user input, so dangerouslySetInnerHTML is safe here.
  const htmlProps = (html: string) => ({
    dangerouslySetInnerHTML: { __html: html },
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* Badge */}
        <span className="inline-block rounded-full bg-purple/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple">
          {step.badge}
        </span>

        {/* Title */}
        <h2 className="whitespace-pre-line text-xl font-extrabold text-text-primary">
          {step.title}
        </h2>

        {/* Description */}
        <div
          className="guide-html text-sm leading-relaxed text-text-secondary"
          {...htmlProps(step.description)}
        />

        {/* Mission card */}
        <div className="rounded-md bg-bg-elevated border border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-yellow border-b border-border">
            Mission
          </div>
          <div
            className="guide-html p-4 text-sm leading-relaxed text-text-primary"
            {...htmlProps(step.mission)}
          />
        </div>

        {/* Discussion questions */}
        {step.discussion && step.discussion.length > 0 && (
          <div className="rounded-md bg-bg-elevated border border-yellow/30 overflow-hidden">
            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-yellow border-b border-yellow/20 flex items-center gap-1.5">
              <span>💬</span> 페어와 토론하세요
            </div>
            <ul className="p-4 space-y-3">
              {step.discussion.map((q, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                  <span className="mt-0.5 shrink-0 text-yellow font-bold text-xs">Q{i + 1}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hint toggle */}
        {step.hint && (
          <div>
            <button
              onClick={() => setShowHint((v) => !v)}
              className="w-full rounded-md border border-dashed border-border px-4 py-2.5 text-left text-sm text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
            >
              {showHint ? '▾ 힌트 숨기기' : '▸ 힌트 보기'}
            </button>
            {showHint && (
              <div
                className="guide-html mt-2 rounded-md border border-border bg-bg-elevated p-4 text-sm leading-relaxed text-text-secondary"
                {...htmlProps(step.hint)}
              />
            )}
          </div>
        )}

        {/* Insight card — revealed after step completion */}
        {isCompleted ? (
          <div className="rounded-md bg-gradient-to-br from-purple/10 to-purple/5 border border-purple/20 p-4">
            <div className="mb-2 text-sm font-bold text-purple">★ Insight</div>
            <div
              className="guide-html text-sm leading-relaxed text-text-secondary"
              {...htmlProps(step.insight)}
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-purple/20 p-4 text-center">
            <span className="text-xs text-text-muted">★ 미션을 완료하면 Insight가 공개됩니다</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border p-4">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>
        <span className="text-xs text-text-muted">
          {currentStep + 1} / {totalSteps}
        </span>
        <button
          onClick={onNext}
          disabled={currentStep === totalSteps - 1}
          className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
