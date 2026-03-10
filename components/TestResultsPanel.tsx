'use client';

import type { TestResult } from '@/lib/types';

interface TestResultsPanelProps {
  results: TestResult[] | null;
  onRun: () => void;
  isRunning: boolean;
  isOpen: boolean;
  onToggle: () => void;
  expectFailure?: boolean | { passCount: number; failCount: number };
}

export default function TestResultsPanel({
  results,
  onRun,
  isRunning,
  isOpen,
  onToggle,
  expectFailure,
}: TestResultsPanelProps) {
  const passCount = results?.filter((r) => r.pass).length ?? 0;
  const failCount = results ? results.length - passCount : 0;
  const allPassed = results !== null && failCount === 0;

  const isExpectedFailure = results !== null && !!expectFailure && failCount > 0;
  const isStepComplete = results !== null && (
    typeof expectFailure === 'object'
      ? passCount === expectFailure.passCount && failCount === expectFailure.failCount
      : expectFailure
        ? failCount > 0
        : allPassed
  );

  const statusBadge = results
    ? isStepComplete && isExpectedFailure
      ? { text: `${passCount}개 통과, ${failCount}개 실패 — 의도된 결과입니다!`, color: 'text-yellow' }
      : allPassed
        ? { text: `✓ ${passCount}개 통과`, color: 'text-green' }
        : { text: `✗ ${failCount}개 실패`, color: 'text-red' }
    : null;

  return (
    <div className="border-t border-border bg-bg-surface">
      {/* Header — always visible, acts as toggle */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2 hover:bg-bg-elevated/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">{isOpen ? '▾' : '▸'}</span>
          <span className="text-xs font-semibold text-text-secondary">테스트 결과</span>
          {statusBadge && (
            <span className={`text-xs font-semibold ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          )}
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onRun}
            disabled={isRunning}
            className="rounded-md bg-green/90 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green disabled:opacity-50"
          >
            {isRunning ? '실행 중…' : '▶ 테스트 실행'}
          </button>
        </div>
      </button>

      {/* Body — collapsible */}
      {isOpen && (
        <div className="max-h-[200px] overflow-y-auto border-t border-border/50 px-4 py-2 text-sm">
          {results === null ? (
            <p className="py-2 text-center text-xs text-text-muted">
              코드를 작성하고 테스트를 실행해보세요
            </p>
          ) : (
            <div className="space-y-1">
              {results.map((r, i) => (
                <div key={i}>
                  <div
                    className={`flex items-center gap-2 rounded px-2.5 py-1 ${
                      r.pass
                        ? 'bg-green-bg text-green'
                        : isExpectedFailure
                          ? 'bg-yellow-bg text-yellow'
                          : 'bg-red-bg text-red'
                    }`}
                  >
                    <span className="text-xs">{r.pass ? '✓' : isExpectedFailure ? '⚡' : '✗'}</span>
                    <span className="font-mono text-xs">{r.name}</span>
                  </div>
                  {!r.pass && r.error && (
                    <p className="mt-0.5 pl-6 text-xs text-text-muted">
                      {r.error}
                    </p>
                  )}
                </div>
              ))}
              {isStepComplete && isExpectedFailure && (
                <div className="mt-2 rounded-md bg-yellow-bg px-3 py-2 text-xs text-yellow">
                  이 테스트가 깨진 것이 바로 이번 스텝의 핵심입니다! 왜 깨졌는지 토론 패널에서 페어와 이야기해보세요.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
