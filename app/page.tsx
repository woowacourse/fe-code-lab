import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-extrabold">Code Lab</h1>
      <p className="text-text-secondary">인터랙티브 코드 실습</p>
      <Link
        href="/labs/lotto-domain-ui"
        className="rounded-lg bg-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-blue/80"
      >
        도메인-UI 분리 실습 시작하기 →
      </Link>
    </main>
  );
}
