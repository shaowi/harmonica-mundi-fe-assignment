export type TransferStep = 1 | 2 | 3

export interface TransferStepperProps {
  currentStep: TransferStep
}

const STEPS = [
  { step: 1, label: 'Recipient' },
  { step: 2, label: 'Amount' },
  { step: 3, label: 'Review' },
] as const

export function TransferStepper({ currentStep }: TransferStepperProps) {
  return (
    <nav className="transfer-stepper" aria-label="Transfer steps">
      <ol className="stepper-list">
        {STEPS.map(({ step, label }, index) => {
          const isActive = currentStep === step
          const isCompleted = currentStep > step

          return (
            <li
              key={step}
              className={`stepper-item ${isActive ? 'active' : ''} ${
                isCompleted ? 'completed' : ''
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="stepper-number" aria-hidden="true">
                {step}
              </span>
              <span className="stepper-label">{label}</span>
              {index < STEPS.length - 1 && (
                <span className="stepper-separator" aria-hidden="true">
                  ·
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

