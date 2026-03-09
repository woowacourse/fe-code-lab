# fe-code-lab MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 브라우저 기반 인터랙티브 코드 실습 웹앱. 크루들이 단계별로 코드를 작성하고 테스트 결과(Red/Green)를 확인하며 "도메인-UI 분리"를 TDD적으로 체험한다.

**Architecture:** Next.js App Router + TypeScript. 실습 데이터(코드, 테스트, 가이드)는 `labs/` 디렉터리에 선언적으로 정의. CodeMirror 6 에디터에서 코드 작성, Web Worker에서 사용자 코드 실행 및 테스트 수행. Vercel 배포.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, CodeMirror 6, Web Worker

**Security Note:** Web Worker 내에서 동적 코드 실행을 사용합니다. 이는 교육용 도구로서 학생이 작성한 코드를 브라우저 내에서 실행하기 위한 의도적 설계입니다.

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `.gitignore`, `.nvmrc`

**Step 1: Next.js + Tailwind 프로젝트 생성**

```bash
cd /Users/makerjun/git/woowacourse/fe-code-lab
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

**Step 2: 추가 의존성 설치**

```bash
npm install @codemirror/state @codemirror/view @codemirror/lang-javascript @codemirror/theme-one-dark @codemirror/commands @codemirror/language
```

**Step 3: .nvmrc 생성**

```
22
```

**Step 4: 빌드 확인**

```bash
npm run build
```
Expected: 빌드 성공

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: 디자인 토큰 및 글로벌 스타일

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: globals.css에 디자인 토큰 정의**

기존 단일 HTML의 CSS 변수를 Tailwind CSS 4의 `@theme` 블록으로 마이그레이션:

```css
@import "tailwindcss";

@theme {
  --color-bg-deep: #0d1117;
  --color-bg-surface: #161b22;
  --color-bg-elevated: #1c2333;
  --color-bg-card: #21283b;
  --color-border: #30363d;
  --color-border-active: #58a6ff;

  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-text-muted: #6e7681;

  --color-green: #3fb950;
  --color-green-bg: rgba(63, 185, 80, 0.12);
  --color-green-border: rgba(63, 185, 80, 0.3);
  --color-red: #f85149;
  --color-red-bg: rgba(248, 81, 73, 0.12);
  --color-red-border: rgba(248, 81, 73, 0.3);
  --color-yellow: #d29922;
  --color-blue: #58a6ff;
  --color-blue-bg: rgba(88, 166, 255, 0.08);
  --color-purple: #bc8cff;

  --font-sans: 'Pretendard', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
}

body {
  background: var(--color-bg-deep);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
```

**Step 2: layout.tsx에 Pretendard, JetBrains Mono 폰트 로드**

Google Fonts link를 `<head>`에 추가.

**Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: add design tokens and global styles"
```

---

## Task 3: 실습 데이터 타입 정의

**Files:**
- Create: `lib/types.ts`

**Step 1: 타입 정의**

```typescript
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
```

**Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: define lab data types"
```

---

## Task 4: 로또 도메인-UI 분리 실습 데이터

**Files:**
- Create: `labs/lotto-domain-ui/steps/step1.ts`
- Create: `labs/lotto-domain-ui/steps/step2.ts`
- Create: `labs/lotto-domain-ui/steps/step3.ts`
- Create: `labs/lotto-domain-ui/steps/step4.ts`
- Create: `labs/lotto-domain-ui/index.ts`

**Step 1: 기존 HTML의 FILES/STEPS 데이터를 TS 모듈로 변환**

각 `stepN.ts`에서 `LabStep` 객체를 export. 코드 내용은 기존 `index.html`의 `FILES` 객체에서 가져옴.

`index.ts`에서 4단계를 조합하여 `LabConfig`로 export:

```typescript
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
```

**Step 2: Commit**

```bash
git add labs/
git commit -m "feat: add lotto domain-ui separation lab data"
```

---

## Task 5: 미니 테스트 프레임워크 (Web Worker)

**Files:**
- Create: `lib/test-runner.ts`
- Create: `public/code-executor.js` (Web Worker)

**Step 1: public/code-executor.js 작성**

Worker 내부에서 `test`, `expect`, `captureConsole` 함수를 정의하고
사용자 코드 + 테스트 코드를 동적으로 실행하여 결과를 `postMessage`로 반환.

(교육용 도구로서 학생 코드를 브라우저 내 Worker에서 실행하는 의도적 설계)

**Step 2: lib/test-runner.ts 작성**

```typescript
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

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data.results);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve([{ name: '실행 오류', pass: false, error: e.message }]);
    };

    worker.postMessage({ codeBlocks, testCode });
  });
}
```

**Step 3: Commit**

```bash
git add lib/test-runner.ts public/code-executor.js
git commit -m "feat: add test runner with Web Worker execution"
```

---

## Task 6: CodeMirror 에디터 컴포넌트

**Files:**
- Create: `components/CodeEditor.tsx`

**Step 1: CodeMirror 6 React 래퍼 컴포넌트 작성**

```typescript
'use client';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
}
```

- `useRef`와 `useEffect`로 CodeMirror `EditorView` 생성/정리
- `@codemirror/lang-javascript`로 JS syntax highlighting
- `@codemirror/theme-one-dark` 기반 커스텀 테마 적용
- `readonly` prop에 따라 `EditorState.readOnly` 설정
- `onChange` 콜백으로 편집 내용 전달

**Step 2: Commit**

```bash
git add components/CodeEditor.tsx
git commit -m "feat: add CodeMirror editor component"
```

---

## Task 7: UI 컴포넌트 구현

**Files:**
- Create: `components/StepIndicator.tsx`
- Create: `components/GuidePanel.tsx`
- Create: `components/TestResultsPanel.tsx`
- Create: `components/CompletionOverlay.tsx`

**Step 1: StepIndicator** — 상단 원형 번호 + 커넥터 라인

**Step 2: GuidePanel** — 좌측. 단계 설명, 미션 카드, 힌트 토글, 인사이트 카드, 이전/다음 버튼

**Step 3: TestResultsPanel** — 하단. 테스트 실행 버튼, pass/fail 결과 목록, 요약

**Step 4: CompletionOverlay** — 전체 완료 축하 모달

**Step 5: Commit**

```bash
git add components/
git commit -m "feat: add UI components (guide, tests, steps, completion)"
```

---

## Task 8: 실습 페이지 조합

**Files:**
- Create: `app/labs/[labId]/page.tsx`
- Create: `app/labs/[labId]/LabClient.tsx`
- Modify: `app/page.tsx`

**Step 1: LabClient.tsx — 메인 클라이언트 컴포넌트**

State: `currentStep`, `activeTab`, `stepCompleted[]`, `userEdits{}`, `testResults`

Layout:
```
┌─ TopBar (StepIndicator) ─────────────────┐
├─ GuidePanel │ EditorTabs + CodeEditor ───┤
│             │ TestResultsPanel           │
└──────────────────────────────────────────┘
```

**Step 2: page.tsx — 서버 컴포넌트**

`labId` params로 config 조회, `LabClient`에 전달.

**Step 3: app/page.tsx — 랜딩 페이지**

실습 목록을 카드로 보여주고 `/labs/[labId]`로 링크.

**Step 4: dev 서버에서 동작 확인**

```bash
npm run dev
# http://localhost:3000/labs/lotto-domain-ui 접속
# Step 1~4 전체 흐름 수동 테스트
```

**Step 5: Commit**

```bash
git add app/ components/
git commit -m "feat: assemble lab page with all components"
```

---

## Task 9: 빌드 및 배포

**Files:**
- Modify: `next.config.ts` (필요 시)

**Step 1: 프로덕션 빌드 확인**

```bash
npm run build
```
Expected: 빌드 성공

**Step 2: Push**

```bash
git push origin main
```

**Step 3: Vercel 배포**

Vercel 대시보드에서 `woowacourse/fe-code-lab` 연결 또는 CLI:

```bash
npx vercel --yes
```

---

## 실행 순서 요약

| Task | 내용 | 의존성 |
|------|------|--------|
| 1 | Next.js 프로젝트 초기화 | 없음 |
| 2 | 디자인 토큰 & 스타일 | Task 1 |
| 3 | 타입 정의 | Task 1 |
| 4 | 실습 데이터 모듈화 | Task 3 |
| 5 | 테스트 프레임워크 (Worker) | Task 3 |
| 6 | CodeMirror 에디터 | Task 2 |
| 7 | UI 컴포넌트 | Task 2 |
| 8 | 실습 페이지 조합 | Task 4, 5, 6, 7 |
| 9 | 빌드 & 배포 | Task 8 |
