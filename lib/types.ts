export interface LabTab {
  name: string;
  readonly: boolean;
}

export interface LabStep {
  badge: string;
  title: string;
  description: string;
  mission: string;
  insight: string;
  hint?: string;
  expectFailure?: boolean;
  tabs: LabTab[];
  files: Record<string, string>;
}

export interface LabConfig {
  id: string;
  title: string;
  description: string;
  steps: LabStep[];
}

export interface TestResult {
  name: string;
  pass: boolean;
  error?: string;
}
