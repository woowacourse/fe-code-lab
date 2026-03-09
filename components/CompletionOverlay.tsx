'use client';

interface CompletionOverlayProps {
  show: boolean;
  onClose: () => void;
}

export default function CompletionOverlay({
  show,
  onClose,
}: CompletionOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-xl border border-border bg-bg-surface p-8 text-center shadow-2xl">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-extrabold text-text-primary">
          모든 단계를 완료했습니다!
        </h2>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
          <p>
            <strong className="text-text-primary">
              도메인 코드는 한 줄도 바꾸지 않고, UI만 교체할 수 있었습니다.
            </strong>
          </p>
          <p>
            이것이 관심사 분리의 효용입니다. 이제 로또 2단계 미션에서 직접
            적용해보세요!
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 rounded-md bg-green px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green/80"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
