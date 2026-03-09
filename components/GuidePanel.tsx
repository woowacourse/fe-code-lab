'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { LabStep } from '@/lib/types';

interface GuidePanelProps {
  step: LabStep;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  isDiscussionSubmitted: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function GuidePanel({
  step,
  currentStep,
  totalSteps,
  isCompleted,
  isDiscussionSubmitted,
  onPrev,
  onNext,
  onFinish,
}: GuidePanelProps) {
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = useCallback(() => {
    if (!hintRef.current) return;
    const codeEl = hintRef.current.querySelector('pre code');
    if (!codeEl) return;
    navigator.clipboard.writeText(codeEl.textContent || '');
    setCopied(true);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const hasDiscussion = step.discussion && step.discussion.length > 0;
  const canAdvance = isCompleted && (!hasDiscussion || isDiscussionSubmitted);
  const isLastStep = currentStep === totalSteps - 1;

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

        {/* Mission checklist */}
        <div className="rounded-md bg-bg-elevated border border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-yellow border-b border-border">
            Mission
          </div>
          <div className="p-4 space-y-3">
            {step.mission.map((item, i) => {
              const checked = i === 0 ? isCompleted : isDiscussionSubmitted;
              return (
                <label key={i} className="flex items-start gap-3 cursor-default">
                  <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border text-[11px] font-bold transition-colors ${checked ? 'border-green bg-green text-bg-deep' : 'border-text-muted/40 text-text-muted'}`}>
                    {checked ? '✓' : ''}
                  </span>
                  <span
                    className={`guide-html text-sm leading-relaxed transition-colors ${checked ? 'text-text-muted line-through decoration-text-muted/40' : 'text-text-primary'}`}
                    {...htmlProps(item)}
                  />
                </label>
              );
            })}
          </div>
        </div>

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
              <div className="mt-2 rounded-md border border-border bg-bg-elevated p-4 text-sm leading-relaxed text-text-secondary">
                <div
                  ref={hintRef}
                  className="guide-html"
                  {...htmlProps(step.hint)}
                />
                {step.hint.includes('<pre>') && (
                  <button
                    onClick={handleCopyCode}
                    className="mt-2 flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
                  >
                    {copied ? '✓ 복사됨' : '📋 코드 복사'}
                  </button>
                )}
              </div>
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

      {/* Bottom navigation */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between p-4">
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
          {isLastStep ? (
            canAdvance ? (
              <button
                onClick={onFinish}
                className="rounded-md bg-green px-4 py-2 text-sm font-semibold text-bg-deep transition-colors hover:bg-green/80"
              >
                미션 완료!
              </button>
            ) : (
              <button
                disabled
                className="rounded-md border border-border px-4 py-2 text-sm text-text-muted cursor-not-allowed opacity-40"
              >
                미션 완료!
              </button>
            )
          ) : canAdvance ? (
            <button
              onClick={onNext}
              className="rounded-md bg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue/80"
            >
              Next →
            </button>
          ) : (
            <button
              disabled
              className="rounded-md border border-border px-4 py-2 text-sm text-text-muted cursor-not-allowed opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
