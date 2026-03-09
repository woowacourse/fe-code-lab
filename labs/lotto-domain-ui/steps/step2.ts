import { LabStep } from '@/lib/types';

export const step2: LabStep = {
  badge: 'STEP 2 · 문제 발견',
  title: 'UI를 바꾸면\n테스트가 깨집니다',
  description: '이제 <strong>웹 UI</strong>로 출력을 바꿔봅시다.<br><br><code>printNumbers()</code> 메서드를 수정해서 <code>console.log</code> 대신 <strong>HTML 문자열을 반환</strong>하도록 바꿔보세요.<br><br>수정 후 테스트를 실행해보면... <strong>기존 테스트가 깨집니다!</strong>',
  mission: '<code>printNumbers()</code>가 <code>console.log</code> 대신 HTML 문자열을 반환하도록 수정하세요. 그리고 테스트를 실행해보세요.',
  insight: 'UI 변경이 도메인 테스트까지 깨뜨리는 상황입니다. 도메인과 UI가 섞여 있으면, 한쪽을 바꿀 때 다른 쪽도 영향을 받습니다. 이것이 "관심사 분리"가 필요한 이유입니다.',
  discussion: [
    '깨진 테스트를 살펴보세요. 이 테스트가 검증하는 건 "도메인 로직"인가요, "출력 방식"인가요?',
    'UI를 바꿨을 뿐인데 왜 도메인 테스트가 깨질까요? 이 구조의 문제는 무엇인가요?',
    '만약 콘솔 → 웹 → 모바일로 UI가 계속 바뀐다면, 매번 테스트를 다시 써야 할까요?',
  ],
  hint: '<code>printNumbers()</code> 안에서 console.log 대신<br><code>return "&lt;div class=\\"lotto\\"&gt;" + this.#numbers.join(", ") + "&lt;/div&gt;";</code><br>처럼 HTML을 반환하도록 바꿔보세요.',
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
