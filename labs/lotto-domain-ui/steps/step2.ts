import { LabStep } from '@/lib/types';

export const step2: LabStep = {
  badge: 'STEP 2 · 문제 발견',
  title: 'UI를 바꾸면\n테스트가 깨집니다',
  description: '⚠️ 이 스텝은 새로운 코드에서 시작합니다.<br><br>이제 <strong>웹 UI</strong>로 출력을 바꿔봅시다.<br><code>printNumbers()</code> 메서드를 수정해서 <code>console.log</code> 대신 <strong>HTML 문자열을 반환</strong>하도록 바꿔보세요.<br>수정 후 테스트를 실행해보면... <strong>기존 테스트가 깨집니다!</strong>',
  mission: [
    '<code>printNumbers()</code>에서 <code>console.log</code> 줄을 <strong>제거</strong>하고, HTML 문자열을 <code>return</code>하도록 수정한 뒤 테스트를 실행하세요.',
    '오른쪽 토론 패널에서 페어와 나눈 이야기를 작성하세요.',
  ],
  insight: '5개 테스트 중 <strong>4개는 통과</strong>하고, <strong>1개만 깨졌습니다.</strong><br><br>깨진 테스트는 <strong>출력 방식(console.log)</strong>에 의존하고 있었고, 통과한 테스트는 <strong>입력 → 반환값</strong>만 검증하고 있었습니다.<br><br>출력 방식을 검증하는 테스트가 도메인 클래스 안에 있었기 때문에, UI를 바꾸자 <strong>함께 깨진 것</strong>입니다.<br><br>이것이 <strong>"관심사 분리"</strong>가 필요한 이유입니다.<br>다음 Step에서 이 문제를 해결해봅시다.',
  discussion: [
    '깨진 테스트를 살펴보세요. 이 테스트가 검증하는 건 "도메인 로직"인가요, "출력 방식"인가요?',
    '깨진 테스트와 깨지지 않은 테스트를 비교해보세요. 무엇이 다른가요?',
    '그렇다면, 이 문제를 어떻게 해결할 수 있을까요?',
  ],
  references: [
    {
      title: '메타 — Step1/Step2 도메인 로직 유지 리뷰',
      url: 'https://github.com/woowacourse/javascript-lotto/pull/397',
      description: '"비즈니스 로직과 UI 로직이 완전히 분리되지 않아 UI 변경 시 비즈니스 로직까지 수정해야 하는 위험성"',
    },
    {
      title: '기린 — 검증 책임 분리',
      url: 'https://github.com/woowacourse/javascript-lotto/pull/395',
      description: '"입력값 형식 검증은 UI 계층, 비즈니스 규칙 검증은 도메인 계층의 책임"',
    },
  ],
  hint: `<code>printNumbers()</code> 안에서 console.log 대신 HTML 문자열을 반환하도록 바꿔보세요.<br><br><pre><code>printNumbers() {
  return \`&lt;div class="lotto"&gt;\${this.#numbers.join(", ")}&lt;/div&gt;\`;
}</code></pre>`,
  expectFailure: true,
  tabs: [
    { name: 'Lotto.js', readonly: false },
    { name: 'test.js', readonly: true }
  ],
  files: {
    'Lotto.js': `class Lotto {
  #numbers;

  constructor(numbers) {
    this.#validate(numbers);
    this.#numbers = [...numbers].sort((a, b) => a - b);
  }

  #validate(numbers) {
    if (numbers.length !== 6) {
      throw new Error("로또 번호는 6개여야 합니다.");
    }
    if (new Set(numbers).size !== 6) {
      throw new Error("로또 번호는 중복되지 않아야 합니다.");
    }
    if (numbers.some(n => n < 1 || n > 45)) {
      throw new Error("로또 번호는 1~45 사이여야 합니다.");
    }
  }

  matchCount(targetNumbers) {
    return this.#numbers.filter(n =>
      targetNumbers.includes(n)
    ).length;
  }

  // ✏️ 이 메서드를 수정하세요!
  // console.log 대신 HTML 문자열을 반환하도록 바꿔보세요.
  printNumbers() {
    console.log("[" + this.#numbers.join(", ") + "]");
  }

  printMatchResult(winningNumbers) {
    const count = this.matchCount(winningNumbers);
    console.log(count + "개 일치");
  }
}`,
    'test.js': `// 이 테스트들은 수정할 수 없습니다.
// 원래 있던 테스트들이 여전히 통과할까요?

test("로또 번호가 6개가 아니면 예외", () => {
  expect(() => new Lotto([1, 2, 3])).toThrow();
});

test("중복된 번호가 있으면 예외", () => {
  expect(() => new Lotto([1, 1, 2, 3, 4, 5])).toThrow();
});

test("matchCount: 일치하는 번호 개수를 반환", () => {
  const lotto = new Lotto([1, 2, 3, 4, 5, 6]);
  expect(lotto.matchCount([1, 2, 3, 7, 8, 9])).toBe(3);
});

test("matchCount: 모두 일치하면 6을 반환", () => {
  const lotto = new Lotto([1, 2, 3, 4, 5, 6]);
  expect(lotto.matchCount([1, 2, 3, 4, 5, 6])).toBe(6);
});

test("printNumbers: 콘솔에 번호를 출력", () => {
  const lotto = new Lotto([3, 1, 5, 2, 6, 4]);
  const logged = captureConsole(() => lotto.printNumbers());
  expect(logged).toBe("[1, 2, 3, 4, 5, 6]");
});`
  }
};
