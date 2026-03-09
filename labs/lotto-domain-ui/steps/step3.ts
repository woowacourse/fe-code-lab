import { LabStep } from '@/lib/types';

export const step3: LabStep = {
  badge: 'STEP 3 · 리팩터링',
  title: '도메인에서\nUI를 분리하세요',
  description: '이번 스텝에서는 직접 리팩터링합니다.<br><br>아래 순서대로 진행하세요:<br>① <code>❌</code> 표시된 두 메서드를 <strong>삭제</strong><br>② <code>getNumbers()</code>의 <code>// 여기에 구현하세요</code>를 채우세요<br>③ 테스트를 실행하여 모두 통과하는지 확인',
  mission: [
    '<code>❌</code> 표시된 메서드를 삭제하고, <code>getNumbers()</code>를 구현한 뒤 테스트를 실행하세요.',
    '오른쪽 토론 패널에서 페어와 나눈 이야기를 작성하세요.',
  ],
  insight: '도메인 객체가 <strong>"어떻게 보여줄지"를 모르게</strong> 만드는 것이 핵심입니다.<br><br>번호를 어디에, 어떤 형태로 보여줄지는 <strong>UI의 관심사</strong>이지, Lotto의 관심사가 아닙니다.<br><br>이제 분리된 도메인은 그대로 두고, 새로운 UI를 붙여봅시다.',
  discussion: [
    'getNumbers()가 복사본을 반환해야 하는 이유는 무엇인가요? 원본 배열을 반환하면 어떤 문제가 생길까요?',
    'printNumbers()를 제거한 후, 테스트 코드에서 달라진 점은 무엇인가요?',
    '이제 Lotto 클래스는 "어떻게 보여줄지"에 대해 알고 있나요?',
  ],
  references: [
    {
      title: '해삐 — SSOT 원칙과 데이터 분리',
      url: 'https://github.com/woowacourse/javascript-lotto/pull/413',
      description: '"동일한 대상을 가리키는 데이터는 하나여야 하며 중복이 있어서는 안 된다"',
    },
    {
      title: '아더 — 정적/동적 UI 분리',
      url: 'https://github.com/woowacourse/javascript-lotto/pull/398',
      description: '"항상 존재해야 하는 UI는 정적으로, 데이터 기반 UI는 동적으로 생성"',
    },
  ],
  hint: `복사본을 반환하는 이유: 외부에서 원본 배열을 수정하는 것을 방지합니다 (캡슐화).<br><br><pre><code>getNumbers() {
  return [...this.#numbers];
}</code></pre>`,
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

  // ❌ 이 메서드를 삭제하세요
  printNumbers() {
    console.log("[" + this.#numbers.join(", ") + "]");
  }

  // ❌ 이 메서드를 삭제하세요
  printMatchResult(winningNumbers) {
    const count = this.matchCount(winningNumbers);
    console.log(count + "개 일치");
  }

  // ✏️ 번호 배열을 반환하는 메서드를 구현하세요.
  // 힌트: 원본 대신 복사본을 반환해야 합니다. 왜일까요?
  getNumbers() {
    // 여기에 구현하세요
  }
}`,
    'test.js': `// 새로운 테스트: 분리된 도메인만 검증합니다.
// UI 관련 테스트는 더 이상 없습니다!

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

test("getNumbers: 번호 배열의 복사본을 반환", () => {
  const lotto = new Lotto([3, 1, 5, 2, 6, 4]);
  const numbers = lotto.getNumbers();
  expect(numbers).toEqual([1, 2, 3, 4, 5, 6]);
});

test("getNumbers: 반환된 배열을 수정해도 원본에 영향 없음", () => {
  const lotto = new Lotto([1, 2, 3, 4, 5, 6]);
  const numbers = lotto.getNumbers();
  numbers.push(99);
  expect(lotto.getNumbers().length).toBe(6);
});`
  }
};
