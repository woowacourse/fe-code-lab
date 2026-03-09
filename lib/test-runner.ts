import { TestResult } from './types';

export function runTestsInWorker(
  codeBlocks: string[],
  testCode: string
): Promise<TestResult[]> {
  return new Promise((resolve) => {
    const worker = new Worker('/code-executor.js');
    const timeout = setTimeout(() => {
      worker.terminate();
      resolve([{ name: '시간 초과', pass: false, error: '코드 실행이 5초를 초과했습니다' }]);
    }, 5000);

    worker.onmessage = (e: MessageEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data.results as TestResult[]);
    };

    worker.onerror = (e: ErrorEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve([{ name: '실행 오류', pass: false, error: e.message }]);
    };

    worker.postMessage({ codeBlocks, testCode });
  });
}
