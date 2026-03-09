import { LabStep } from '@/lib/types';

export const step1: LabStep = {
  badge: 'STEP 1 · 관찰',
  title: '도메인과 UI가\n섞여 있는 코드',
  description: '아래 <strong>Lotto</strong> 클래스를 살펴보세요.<br><br>이 클래스에는 <strong>여러 가지 역할의 메서드</strong>가 한 곳에 모여 있습니다.<br><br>각 메서드가 <strong>어떤 역할</strong>을 하는지 페어와 이야기해보세요.',
  mission: '코드를 읽고 테스트를 실행해보세요. 모든 테스트가 통과합니다.',
  insight: '하나의 클래스가 "데이터 관리 + 비즈니스 로직 + 출력"을 모두 담당하고 있습니다. 지금은 잘 동작하지만, UI가 바뀌면 어떻게 될까요?',
  discussion: [
    '각 메서드를 "데이터를 다루는 것"과 "결과를 보여주는 것"으로 나눠보세요.',
    'printNumbers()와 matchCount()의 차이는 무엇인가요? 하나를 제거하면 나머지에 영향이 있을까요?',
    '만약 콘솔이 아니라 웹 화면에 결과를 보여줘야 한다면, 어떤 메서드를 바꿔야 할까요?',
  ],
  tabs: [
    { name: 'Lotto.js', readonly: true },
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

  printNumbers() {
    console.log("[" + this.#numbers.join(", ") + "]");
  }

  printMatchResult(winningNumbers) {
    const count = this.matchCount(winningNumbers);
    console.log(count + "개 일치");
  }
}`,
    'test.js': `// 이 테스트들은 읽기 전용입니다.
// 테스트를 실행해보세요 — 모두 통과합니다.

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
