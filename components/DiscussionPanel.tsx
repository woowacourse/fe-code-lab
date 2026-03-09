'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { LabReference } from '@/lib/types';

interface DiscussionPanelProps {
  labId: string;
  stepIndex: number;
  questions: string[];
  references?: LabReference[];
  isSubmitted: boolean;
  onSubmit: (answer: string) => void;
}

function getStorageKey(labId: string, stepIndex: number) {
  return `lab-discussion-${labId}-step${stepIndex}`;
}

const MIN_LENGTH = 50;

export default function DiscussionPanel({
  labId,
  stepIndex,
  questions,
  references,
  isSubmitted,
  onSubmit,
}: DiscussionPanelProps) {
  const [answer, setAnswer] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [questionHeight, setQuestionHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(labId, stepIndex));
    setAnswer(saved ?? '');
    setShowPreview(false);
    setIsEditing(false);
    setIsExpanded(false);
    setQuestionHeight(null);
  }, [labId, stepIndex]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleChange = useCallback(
    (value: string) => {
      setAnswer(value);
      localStorage.setItem(getStorageKey(labId, stepIndex), value);
    },
    [labId, stepIndex]
  );

  const handleSubmit = () => {
    if (answer.trim().length < MIN_LENGTH) return;
    onSubmit(answer);
    setIsEditing(false);
    setIsExpanded(false);
  };

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const currentH = questionHeight ?? questionRef.current?.offsetHeight ?? 200;
      dragRef.current = { startY: e.clientY, startHeight: currentH };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [questionHeight]
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const delta = e.clientY - dragRef.current.startY;
    const newH = Math.max(80, Math.min(500, dragRef.current.startHeight + delta));
    setQuestionHeight(newH);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const canSubmit = answer.trim().length >= MIN_LENGTH;
  const charCount = answer.trim().length;
  const progress = Math.min(charCount / MIN_LENGTH, 1);
  const hasRefs = references && references.length > 0;

  const markdownPreview = (
    <div className="flex-1 overflow-y-auto p-4 prose-discussion text-sm leading-relaxed text-text-secondary">
      {answer ? <ReactMarkdown>{answer}</ReactMarkdown> : (
        <span className="text-text-muted/50 italic">마크다운 미리보기가 여기에 표시됩니다</span>
      )}
    </div>
  );

  const textEditor = (autoFocusOn: boolean) => (
    <textarea
      value={answer}
      onChange={(e) => handleChange(e.target.value)}
      autoFocus={autoFocusOn}
      placeholder={`페어와 토론한 내용을 간단히 정리하세요.\n\n예:\n## Q1. 메서드 역할 구분\n- matchCount()는 계산, printNumbers()는 출력\n\n## Q2. 차이점\n- ...`}
      className="flex-1 w-full resize-none bg-bg-deep px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:outline-none font-mono"
    />
  );

  const footer = (
    <div className="border-t border-border px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${canSubmit ? 'bg-green' : 'bg-yellow/70'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className={`text-xs tabular-nums ${canSubmit ? 'text-green' : 'text-text-muted'}`}>
          {charCount}/{MIN_LENGTH}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {canSubmit ? '자동 저장됨' : `${MIN_LENGTH - charCount}자 더 작성해주세요`}
        </span>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={() => { setIsEditing(false); setIsExpanded(false); }}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              취소
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`rounded-md px-5 py-2 text-sm font-semibold transition-all ${
              canSubmit
                ? 'bg-yellow text-bg-deep hover:bg-yellow/80 shadow-sm shadow-yellow/20'
                : 'bg-yellow/30 text-text-muted cursor-not-allowed'
            }`}
          >
            {isEditing ? '다시 제출' : '제출하기'}
          </button>
        </div>
      </div>
    </div>
  );

  const editorArea = (expanded: boolean) => {
    if (isSubmitted && !isEditing) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="prose-discussion text-sm leading-relaxed text-text-secondary">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
          <div className="border-t border-border px-4 py-2.5 flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              수정하기
            </button>
          </div>
        </div>
      );
    }

    // Expanded modal: side-by-side (left editor, right preview)
    if (expanded) {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
            <span className="text-sm font-semibold text-text-secondary">
              {isEditing ? '토론 내용 수정' : '토론한 내용을 정리해주세요'}
            </span>
            <span className="text-[10px] text-text-muted">✏️ 편집 &nbsp;|&nbsp; 👁 미리보기</span>
          </div>

          {/* Side-by-side: Editor | Preview */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden border-r border-border/50">
              {textEditor(true)}
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {markdownPreview}
            </div>
          </div>

          {footer}
        </div>
      );
    }

    // Sidebar: vertical split (top editor, bottom preview) or toggle
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <span className="text-sm font-semibold text-text-secondary">
            {isEditing ? '토론 내용 수정' : '토론한 내용을 정리해주세요'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className={`text-xs transition-colors ${
                showPreview
                  ? 'text-blue font-semibold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {showPreview ? '👁 미리보기 ON' : '👁 미리보기'}
            </button>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              title="크게 보기"
            >
              ↗ 크게 보기
            </button>
          </div>
        </div>

        {/* Editor + optional live preview below */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex flex-col overflow-hidden ${showPreview ? 'flex-1 basis-1/2' : 'flex-1'}`}>
            {textEditor(false)}
          </div>
          {showPreview && (
            <>
              <div className="shrink-0 border-t border-border/50 px-4 py-1">
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">미리보기</span>
              </div>
              <div className="flex-1 basis-1/2 overflow-y-auto">
                {markdownPreview}
              </div>
            </>
          )}
        </div>

        {footer}
      </div>
    );
  };

  return (
    <>
      <div className={`flex h-full flex-col bg-bg-surface ${isDragging ? 'select-none' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-bold uppercase tracking-wide text-yellow flex items-center gap-1.5">
            <span>💬</span> 토론 정리
          </span>
          {isSubmitted && !isEditing && (
            <span className="flex items-center gap-1 text-sm font-semibold text-green">
              ✓ 제출 완료
            </span>
          )}
        </div>

        {/* Questions + References (resizable) */}
        <div
          ref={questionRef}
          className="border-b border-border overflow-y-auto shrink-0"
          style={questionHeight != null ? { height: questionHeight } : undefined}
        >
          <div className="px-4 py-4 space-y-3">
            <ul className="space-y-2.5">
              {questions.map((q, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                  <span className="shrink-0 text-yellow font-bold">Q{i + 1}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>

            {/* References — collapsible */}
            {hasRefs && (
              <div className="pt-2 border-t border-border/50">
                <button
                  onClick={() => setShowReferences((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide hover:text-text-secondary transition-colors w-full text-left"
                >
                  <span className="text-[10px]">{showReferences ? '▾' : '▸'}</span>
                  📎 참고 코드리뷰 ({references!.length})
                </button>
                {showReferences && (
                  <div className="mt-2 space-y-1.5">
                    {references!.map((ref, i) => (
                      <a
                        key={i}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded px-2 py-1.5 transition-colors hover:bg-yellow/5 group"
                      >
                        <span className="text-sm font-medium text-blue group-hover:underline">{ref.title}</span>
                        {ref.description && (
                          <span className="block mt-0.5 text-xs text-text-muted leading-relaxed">
                            {ref.description}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vertical resize handle */}
        <div
          className={`h-1 shrink-0 cursor-row-resize transition-colors ${
            isDragging ? 'bg-blue' : 'bg-transparent hover:bg-blue/30'
          }`}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onDoubleClick={() => setQuestionHeight(null)}
        />

        {/* Editor area */}
        {editorArea(false)}
      </div>

      {/* Expanded fullscreen modal */}
      {isExpanded && !(isSubmitted && !isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/80 backdrop-blur-sm p-6">
          <div className="flex h-full w-full max-w-3xl flex-col rounded-lg border border-border bg-bg-surface shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-sm font-bold uppercase tracking-wide text-yellow flex items-center gap-1.5">
                <span>💬</span> 토론 정리
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                ✕ 닫기 (Esc)
              </button>
            </div>

            {/* Questions summary */}
            <div className="border-b border-border px-5 py-3 bg-yellow/5">
              <ul className="space-y-1.5">
                {questions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary leading-relaxed">
                    <span className="shrink-0 text-yellow font-bold">Q{i + 1}</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Editor — fills remaining space */}
            {editorArea(true)}
          </div>
        </div>
      )}
    </>
  );
}
