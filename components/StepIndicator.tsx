'use client';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: boolean[];
  onStepClick: (step: number) => void;
}

export default function StepIndicator({
  totalSteps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === i;
        const isCompleted = completedSteps[i];

        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <div
                className={`h-px w-4 ${
                  completedSteps[i - 1] ? 'bg-green' : 'bg-border'
                }`}
              />
            )}
            <button
              onClick={() => onStepClick(i)}
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                isActive
                  ? 'border-blue bg-blue-bg text-blue shadow-[0_0_8px_rgba(88,166,255,0.3)]'
                  : isCompleted
                    ? 'border-green-border bg-green-bg text-green'
                    : 'border-border text-text-muted'
              }`}
            >
              {stepNum}
            </button>
          </div>
        );
      })}
    </div>
  );
}
