'use client';

import type { TestResult } from '@/lib/types';

interface TestResultsPanelProps {
  results: TestResult[] | null;
  onRun: () => void;
  isRunning: boolean;
}

export default function TestResultsPanel({
  results,
  onRun,
  isRunning,
}: TestResultsPanelProps) {
  const passCount = results?.filter((r) => r.pass).length ?? 0;
  const failCount = results ? results.length - passCount : 0;
  const allPassed = results !== null && failCount === 0;

  const titleStatus = results
    ? allPassed
      ? ' — ✓ 통과'
      : ` — ✗ ${failCount}개 실패`
    : '';

  return (
    <div className="flex h-full flex-col border-t border-border bg-bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-semibold text-text-secondary">
          테스트 결과{titleStatus}
        </span>
        <button
          onClick={onRun}
          disabled={isRunning}
          className="rounded-md bg-green/90 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green disabled:opacity-50"
        >
          {isRunning ? '실행 중…' : '▶ 테스트 실행'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {results === null ? (
          <p className="py-4 text-center text-sm text-text-muted">
            코드를 작성하고 테스트를 실행해보세요
          </p>
        ) : (
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i}>
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 ${
                    r.pass
                      ? 'bg-green-bg text-green'
                      : 'bg-red-bg text-red'
                  }`}
                >
                  <span className="text-xs">{r.pass ? '✓' : '✗'}</span>
                  <span className="font-mono text-xs">{r.name}</span>
                </div>
                {!r.pass && r.error && (
                  <p className="mt-1 pl-7 text-xs text-text-muted">
                    {r.error}
                  </p>
                )}
              </div>
            ))}

            {/* Summary */}
            <div className="mt-3 border-t border-border pt-2">
              {allPassed ? (
                <p className="text-xs font-semibold text-green">
                  ✓ {passCount}개 테스트 모두 통과!
                </p>
              ) : (
                <p className="text-xs font-semibold text-red">
                  ✗ {failCount}개 실패 / {passCount}개 통과
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
