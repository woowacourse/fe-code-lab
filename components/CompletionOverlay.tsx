'use client';

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import type { LabStep } from '@/lib/types';

interface CompletionOverlayProps {
  show: boolean;
  onClose: () => void;
  labId: string;
  steps: LabStep[];
}

function getDiscussion(labId: string, stepIndex: number): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`lab-discussion-${labId}-step${stepIndex}`) ?? '';
}

function buildCopyText(steps: LabStep[], labId: string): string {
  const lines: string[] = ['# 관심사 분리 Lab - 토론 정리\n'];
  steps.forEach((step, i) => {
    const content = getDiscussion(labId, i);
    lines.push(`## ${step.badge}: ${step.title.replace(/\n/g, ' ')}`);
    if (step.discussion) {
      step.discussion.forEach((q, qi) => {
        lines.push(`> Q${qi + 1}. ${q}`);
      });
    }
    lines.push('');
    lines.push(content || '(작성하지 않음)');
    lines.push('');
  });
  lines.push('---');
  lines.push(`작성일: ${new Date().toLocaleDateString('ko-KR')}`);
  return lines.join('\n');
}

type Phase = 'celebrate' | 'timeline';

export default function CompletionOverlay({
  show,
  onClose,
  labId,
  steps,
}: CompletionOverlayProps) {
  const [phase, setPhase] = useState<Phase>('celebrate');
  const [copied, setCopied] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showRocket, setShowRocket] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Fire confetti when overlay shows
  useEffect(() => {
    if (!show) return;
    setPhase('celebrate');
    setVisibleSteps(0);
    setCopied(false);
    setShowRocket(true);
    setShowCard(false);

    // Show card and fire confetti after rocket passes center (~1.2s)
    const cardTimer = setTimeout(() => {
      setShowCard(true);
      const fire = () => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6, x: 0.3 },
          colors: ['#3fb950', '#58a6ff', '#d29922', '#bc8cff', '#f85149'],
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6, x: 0.7 },
          colors: ['#3fb950', '#58a6ff', '#d29922', '#bc8cff', '#f85149'],
        });
      };
      fire();
      setTimeout(fire, 600);
    }, 1200);

    // Hide rocket after animation ends
    const rocketTimer = setTimeout(() => setShowRocket(false), 2600);

    return () => {
      clearTimeout(cardTimer);
      clearTimeout(rocketTimer);
    };
  }, [show]);

  // Animate timeline steps appearing one by one
  useEffect(() => {
    if (phase !== 'timeline') return;
    if (visibleSteps >= steps.length) return;
    const t = setTimeout(() => setVisibleSteps((v) => v + 1), 200);
    return () => clearTimeout(t);
  }, [phase, visibleSteps, steps.length]);

  const handleShowTimeline = useCallback(() => {
    setPhase('timeline');
    setVisibleSteps(0);
  }, []);

  const handleCopy = useCallback(() => {
    const text = buildCopyText(steps, labId);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [steps, labId]);

  if (!show) return null;

  const discussions = steps.map((_, i) => getDiscussion(labId, i));
  const hasAnyDiscussion = discussions.some((d) => d.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      {phase === 'celebrate' && (
        <>
          {/* Rocket flying from bottom to top */}
          {showRocket && (
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZagUJqtSMlC4Nh73mszXgjG0x5R2aTxK8JRhp67QSOA-Qb4YdYb1TkZBEj0COzuHykMtARbEifHrD4_YAS9xrxl961J66sx17JwmMFokDuWgIhBsYk6evljNR3BIYyJ-eARiOmxuOp7ia/s1600/space_rocket_kids_naname.png"
              alt="로켓"
              className="animate-rocket-launch fixed z-[60] w-48 h-48 object-contain"
              style={{ left: '50%', top: '50%', marginLeft: '-96px', marginTop: '-96px' }}
            />
          )}

          {/* Celebration card (appears after rocket passes) */}
          {showCard && (
            <div className="mx-4 max-w-md rounded-xl border border-border bg-bg-surface p-8 text-center shadow-2xl animate-fade-in">
              <div className="text-6xl">🎉</div>
              <h2 className="mt-4 text-2xl font-extrabold text-text-primary">
                모든 단계를 완료했습니다!
              </h2>
              <div className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
                <p>
                  <strong className="text-text-primary">
                    도메인 코드는 한 줄도 바꾸지 않고, UI만 교체할 수 있었습니다.
                  </strong>
                </p>
                <p>이것이 관심사 분리의 효용입니다.</p>
              </div>
              <button
                onClick={handleShowTimeline}
                className="mt-6 rounded-md bg-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue/80"
              >
                여정 돌아보기
              </button>
            </div>
          )}
        </>
      )}

      {phase === 'timeline' && (
        <div className="mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-bg-surface shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-extrabold text-text-primary">
              학습 여정 돌아보기
            </h2>
            <button
              onClick={onClose}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              ✕ 닫기
            </button>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="completion-timeline">
              {steps.map((step, i) => {
                const content = discussions[i];
                const isVisible = i < visibleSteps;
                return (
                  <div
                    key={i}
                    className={`completion-timeline-item transition-all duration-500 ${
                      isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {/* Step badge + title */}
                    <div className="completion-timeline-dot" />
                    <div className="mb-1">
                      <span className="inline-block rounded-full bg-purple/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple">
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-primary mb-2">
                      {step.title.replace(/\n/g, ' ')}
                    </h3>

                    {/* Discussion content */}
                    {content ? (
                      <div className="rounded-md border border-border bg-bg-deep p-3 prose-discussion text-xs leading-relaxed text-text-secondary">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-border p-3 text-xs text-text-muted italic">
                        토론 내용이 작성되지 않았습니다
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Meaning message */}
            {visibleSteps >= steps.length && (
              <div className="mt-6 rounded-md bg-gradient-to-br from-green/10 to-blue/10 border border-green/20 p-5 animate-fade-in">
                <h3 className="text-sm font-extrabold text-green mb-3">
                  이 여정이 전하는 의미
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
                  <p>
                    <strong className="text-text-primary">관찰 → 문제 발견 → 리팩터링 → 완성.</strong>
                  </p>
                  <p>
                    같은 도메인 코드를 <strong className="text-text-primary">한 줄도 바꾸지 않고</strong> UI를 교체하는 여정을 걸었습니다.
                  </p>
                  <p>
                    이것은 단순한 코드 분리 기법이 아닙니다.{' '}
                    <strong className="text-text-primary">"변경의 이유가 다른 것들은 분리해야 한다"</strong>는
                    소프트웨어 설계의 핵심 원칙을 직접 경험한 것입니다.
                  </p>
                  <p>
                    로또 미션에서, 그리고 앞으로의 프로젝트에서{' '}
                    <strong className="text-text-primary">"이 코드가 바뀌는 이유는 무엇인가?"</strong>를
                    스스로에게 물어보세요. 그 질문이 좋은 설계의 시작입니다.
                  </p>
                </div>
              </div>
            )}

            {/* Memo save guide */}
            {visibleSteps >= steps.length && hasAnyDiscussion && (
              <div className="mt-4 rounded-md border border-yellow/30 bg-yellow/5 p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📝</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-yellow mb-1">
                      토론 내용을 저장해두세요!
                    </h4>
                    <p className="text-xs leading-relaxed text-text-secondary mb-3">
                      페어와 나눈 토론 내용은 소중한 학습 기록입니다.
                      아래 버튼을 눌러 클립보드에 복사한 뒤, 메모 앱(Notion, Apple Notes 등)에 저장해두세요.
                      나중에 코드리뷰를 받거나 설계를 고민할 때 다시 꺼내볼 수 있습니다.
                    </p>
                    <button
                      onClick={handleCopy}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                        copied
                          ? 'bg-green text-bg-deep'
                          : 'bg-yellow text-bg-deep hover:bg-yellow/80'
                      }`}
                    >
                      {copied ? '✓ 클립보드에 복사됨!' : '📋 토론 내용 전체 복사'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md bg-green px-6 py-2.5 text-sm font-semibold text-bg-deep transition-colors hover:bg-green/80"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
