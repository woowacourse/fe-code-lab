import { LabStep } from '@/lib/types';

export const step4: LabStep = {
  badge: 'STEP 4 · 완성',
  title: '도메인은 그대로,\nUI만 새로 붙이기',
  description: '도메인 분리가 완료되었습니다!<br><br>이제 <strong>Lotto 클래스를 전혀 수정하지 않고</strong>, 별도의 <strong>UI 함수</strong>를 만들어서 웹 화면에 로또 번호를 표시해보세요.<br><br>도메인 코드 한 줄 안 바꾸고 UI를 교체할 수 있다는 것을 직접 경험해보세요!',
  mission: '<code>renderLottoToHTML(lotto)</code> 함수를 작성하세요. Lotto 객체를 받아 HTML 문자열을 반환합니다.',
  insight: '도메인은 Step 3에서 완성한 그대로입니다. UI가 콘솔이든 웹이든 모바일이든, 도메인 코드는 바뀌지 않습니다. 이것이 관심사 분리의 진짜 효용입니다.',
  discussion: [
    'Lotto.js 탭을 확인해보세요. Step 3에서 완성한 코드가 한 줄도 바뀌지 않았습니다. 왜 가능할까요?',
    'renderLottoToHTML은 Lotto 클래스 안에 있어야 할까요, 밖에 있어야 할까요? 그 이유는?',
    '만약 "모바일 앱용 렌더링"이 추가된다면, 어떤 파일만 추가하면 될까요?',
  ],
  hint: 'Lotto의 <code>getNumbers()</code>로 번호를 꺼내고,<br>HTML 문자열을 조합하면 됩니다.<br><br>예: <code>const numbers = lotto.getNumbers();</code><br><code>return "&lt;div class=\\"lotto-numbers\\"&gt;" + numbers.map(n =&gt; "&lt;span class=\\"lotto-ball\\"&gt;" + n + "&lt;/span&gt;").join("") + "&lt;/div&gt;";</code>',
  tabs: [
    { name: 'Lotto.js', readonly: true },
    { name: 'ui.js', readonly: false },
    { name: 'test.js', readonly: true }
  ],
  files: {
    'Lotto.js': `// ✅ 도메인 코드 — Step 3에서 완성. 수정하지 않습니다!
class Lotto {
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

  getNumbers() {
    return [...this.#numbers];
  }
}`,
    'ui.js': `// ✏️ renderLottoToHTML 함수를 작성하세요!
//
// - Lotto 객체를 인자로 받습니다.
// - 각 번호를 <span> 태그로 감싼 HTML 문자열을 반환합니다.
// - 전체를 <div class="lotto-numbers">로 감쌉니다.
//
// 예시 출력:
// <div class="lotto-numbers">
//   <span class="lotto-ball">1</span>
//   <span class="lotto-ball">2</span>
//   ...
// </div>

function renderLottoToHTML(lotto) {
  // 여기에 구현하세요

}`,
    'test.js': `// 도메인 테스트 — 변경 없이 여전히 통과합니다!
test("matchCount: 일치하는 번호 개수를 반환", () => {
  const lotto = new Lotto([1, 2, 3, 4, 5, 6]);
  expect(lotto.matchCount([1, 2, 3, 7, 8, 9])).toBe(3);
});

test("getNumbers: 번호 배열의 복사본을 반환", () => {
  const lotto = new Lotto([3, 1, 5, 2, 6, 4]);
  expect(lotto.getNumbers()).toEqual([1, 2, 3, 4, 5, 6]);
});

// UI 테스트 — 새로 추가된 UI 함수를 검증합니다.
test("renderLottoToHTML: lotto-numbers 클래스를 가진 div를 반환", () => {
  const lotto = new Lotto([1, 2, 3, 4, 5, 6]);
  const html = renderLottoToHTML(lotto);
  expect(html.includes("lotto-numbers")).toBe(true);
});

test("renderLottoToHTML: 각 번호가 lotto-ball span에 포함", () => {
  const lotto = new Lotto([3, 1, 5, 2, 6, 4]);
  const html = renderLottoToHTML(lotto);
  expect(html.includes("lotto-ball")).toBe(true);
  expect(html.includes(">1<")).toBe(true);
  expect(html.includes(">6<")).toBe(true);
});

test("renderLottoToHTML: 6개의 번호가 모두 포함", () => {
  const lotto = new Lotto([10, 20, 30, 40, 5, 15]);
  const html = renderLottoToHTML(lotto);
  [5, 10, 15, 20, 30, 40].forEach(n => {
    expect(html.includes(">" + n + "<")).toBe(true);
  });
});`
  }
};
