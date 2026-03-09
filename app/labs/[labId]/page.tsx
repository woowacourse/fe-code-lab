import { lottoDomainUiLab } from '@/labs/lotto-domain-ui';
import LabClient from './LabClient';

// For now, we only have one lab, so we can hardcode it.
// Later this will look up by labId param.
export default async function LabPage() {
  return <LabClient lab={lottoDomainUiLab} />;
}
