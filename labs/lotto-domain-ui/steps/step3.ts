import { LabStep } from '@/lib/types';

export const step3: LabStep = {
  badge: 'STEP 3 · 리팩터링',
  title: '도메인에서\nUI를 분리하세요',
  description: '문제를 확인했으니 이제 해결해봅시다.<br><br><strong>Lotto</strong> 클래스에서 UI 로직(<code>printNumbers</code>, <code>printMatchResult</code>)을 <strong>제거</strong>하고, 대신 외부에서 번호를 가져갈 수 있도록 <code>getNumbers()</code> 메서드를 추가하세요.<br><br>도메인 객체는 <strong>데이터와 비즈니스 로직만</strong> 가져야 합니다.',
  mission: '<code>printNumbers()</code>와 <code>printMatchResult()</code>를 제거하고, <code>getNumbers()</code> 메서드를 추가하세요.',
  insight: '도메인 객체가 "어떻게 보여줄지"를 모르게 만드는 것이 핵심입니다. 번호를 어디에 어떤 형태로 보여줄지는 UI의 관심사이지, Lotto의 관심사가 아닙니다.',
  hint: '<code>getNumbers()</code>는 내부 배열의 복사본을 반환합니다.<br><code>return [...this.#numbers];</code><br><br>복사본을 반환하는 이유: 외부에서 원본 배열을 수정하는 것을 방지합니다 (캡슐화).',
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

  // ✏️ printNumbers()와 printMatchResult()를 제거하고
  // getNumbers() 메서드를 추가하세요.
  // getNumbers()는 번호 배열의 복사본을 반환합니다.

  printNumbers() {
    console.log("[" + this.#numbers.join(", ") + "]");
  }

  printMatchResult(winningNumbers) {
    const count = this.matchCount(winningNumbers);
    console.log(count + "개 일치");
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
