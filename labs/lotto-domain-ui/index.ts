import { LabConfig } from '@/lib/types';
import { step1 } from './steps/step1';
import { step2 } from './steps/step2';
import { step3 } from './steps/step3';
import { step4 } from './steps/step4';

export const lottoDomainUiLab: LabConfig = {
  id: 'lotto-domain-ui',
  title: '도메인-UI 분리 실습',
  description: '도메인 로직과 UI 로직을 분리하는 경험을 단계별로 체험합니다.',
  steps: [step1, step2, step3, step4],
};
