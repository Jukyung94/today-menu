import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type View = "quiz" | "result" | "log" | "history";
const questions = [
  [
    "어떤 종류가 당기세요?",
    "오늘의 기분에 가장 가까운 것을 골라주세요.",
    [
      ["🍚", "한식"],
      ["🥟", "중식"],
      ["🍝", "양식"],
      ["🍣", "일식"],
    ],
  ],
  [
    "어떤 식사가 좋으세요?",
    "오늘은 어떤 한 끼를 원하시나요?",
    [
      ["🍚", "밥"],
      ["🍜", "면"],
      ["🥘", "국물"],
      ["🥗", "가벼운 메뉴"],
    ],
  ],
  [
    "오늘은 어떤 맛인가요?",
    "취향에 맞춰 다음 질문을 바꿔드릴게요.",
    [
      ["🌶️", "매콤한 맛"],
      ["🫧", "담백한 맛"],
      ["❄️", "시원한 맛"],
      ["✨", "상관없어요"],
    ],
  ],
  [
    "어떤 상황인가요?",
    "마지막 질문이에요.",
    [
      ["🙋", "혼자 먹어요"],
      ["💪", "든든하게"],
      ["⏱️", "빨리 먹고 싶어요"],
      ["👥", "여럿이 함께"],
    ],
  ],
] as const;
const menus = [
  [
    "제육덮밥",
    "🍛",
    "매콤하고 든든한 한 끼가 필요한 오늘과 잘 맞아요.",
    ["한식", "밥", "매콤한 맛"],
  ],
  [
    "닭갈비 덮밥",
    "🍲",
    "평소 취향은 살리되, 조금 다른 메뉴를 골라봤어요.",
    ["한식", "밥", "새로운 선택"],
  ],
  [
    "김치찌개",
    "🥘",
    "밥과 함께 편안하게 즐기기 좋은 든든한 메뉴예요.",
    ["한식", "국물", "따뜻한"],
  ],
] as const;

export function RecommendationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const randomMode = searchParams.get("mode") === "random";
  const [view, setView] = useState<View>(() =>
    randomMode ? "result" : "quiz",
  );
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() =>
    randomMode ? ["내 취향 기반 랜덤 추천"] : [],
  );
  const [selectedMenu, setSelectedMenu] = useState("");
  const [rating, setRating] = useState(5);
  const [saved, setSaved] = useState(false);
  const restart = () => {
    setStep(0);
    setAnswers([]);
    setView("quiz");
  };
  const select = (value: string) => {
    setAnswers((current) => [...current, value]);
    if (step === questions.length - 1) setView("result");
    else setStep((current) => current + 1);
  };
  return (
    <main className="app">
      <header>
        <button className="brand" onClick={() => navigate("/")}>
          <b>오늘</b> 오늘 메뉴
        </button>
        <nav>
          <button
            className={view === "history" ? "active" : ""}
            onClick={() => setView("history")}
          >
            기록
          </button>
          <span>김</span>
        </nav>
      </header>
      {view === "quiz" && (
        <section className="quiz">
          <button
            className="text-button"
            onClick={() => (step ? setStep(step - 1) : navigate("/"))}
          >
            ← 이전
          </button>
          <div className="progress">
            <span>오늘의 메뉴 추천</span>
            <span>
              {step + 1} / {questions.length}
            </span>
          </div>
          <div className="bar">
            <i style={{ width: `${(step + 1) * 25}%` }} />
          </div>
          <p className="eyebrow">취향 선택</p>
          <h2>{questions[step][0]}</h2>
          <p className="description">{questions[step][1]}</p>
          <div className="choices">
            {questions[step][2].map(([emoji, label]) => (
              <button key={label} onClick={() => select(label)}>
                <b>{emoji}</b>
                <strong>{label}</strong>
                <i>→</i>
              </button>
            ))}
          </div>
          <button
            className="text-button center"
            onClick={() => select("상관없어요")}
          >
            잘 모르겠어요
          </button>
        </section>
      )}
      {view === "result" && (
        <section className="result">
          <p className="eyebrow">오늘의 추천</p>
          <h2>
            취향에 맞춰
            <br />
            <i>3가지 메뉴</i>를 골랐어요.
          </h2>
          <p className="pill">{answers.join(" · ")}</p>
          <div className="menu-list">
            {menus.map(([name, emoji, note, tags], index) => (
              <article key={name}>
                <em>0{index + 1}</em>
                <b className="food">{emoji}</b>
                <div>
                  <h3>{name}</h3>
                  <p>
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </p>
                  <small>{note}</small>
                </div>
                <button
                  onClick={() => {
                    setSelectedMenu(name);
                    setSaved(false);
                    setView("log");
                  }}
                >
                  이 메뉴 선택 →
                </button>
              </article>
            ))}
          </div>
          <p className="result-actions">
            <button onClick={restart}>조건 바꾸기</button>
            <button onClick={() => navigate("/")}>나중에 결정하기</button>
          </p>
        </section>
      )}
      {view === "log" && (
        <section className="log">
          <div>
            <p className="eyebrow">식사 기록</p>
            <h2>
              {selectedMenu}
              <br />
              맛있게 드셨나요?
            </h2>
            <p className="description">
              한 줄 메모와 사진으로 오늘의 한 끼를 남겨보세요.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
          >
            <label>만족도</label>
            <p className="stars">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  className={rating >= score ? "on" : ""}
                  onClick={() => setRating(score)}
                  key={score}
                >
                  ★
                </button>
              ))}
            </p>
            <label htmlFor="note">
              짧은 메모 <small>선택</small>
            </label>
            <textarea
              id="note"
              placeholder="예: 매콤해서 기분 전환이 됐어요."
            />
            <label className="upload" htmlFor="photo">
              <input id="photo" type="file" accept="image/*" />
              <b>＋</b>
              <strong>사진 한 장 추가하기</strong>
              <small>선택 · 사진은 비공개로 저장돼요</small>
            </label>
            <button className="primary">식사 기록 저장하기 →</button>
            {saved && (
              <p className="saved">
                기록했어요. 다음 추천에 취향을 반영할게요.
              </p>
            )}
          </form>
        </section>
      )}
      {view === "history" && (
        <section className="history">
          <p className="eyebrow">나의 식사 기록</p>
          <h2>
            이번 달,
            <br />
            <i>12번의 맛있는 선택</i>
          </h2>
          <div className="stats">
            <article>
              <small>가장 자주 고른 음식</small>
              <strong>한식 · 밥</strong>
            </article>
            <article>
              <small>가장 좋아하는 맛</small>
              <strong>매콤한 맛 🌶️</strong>
            </article>
            <article>
              <small>사진이 있는 기록</small>
              <strong>8장</strong>
            </article>
          </div>
          <p className="recent-title">최근 기록</p>
          {[
            ["오늘", "제육덮밥", "맛있어요 · 사진 1장", "🍛"],
            ["어제", "냉모밀", "괜찮아요 · 사진 1장", "🍜"],
            ["7월 22일", "김치찌개", "맛있어요", "🥘"],
          ].map(([date, food, detail, emoji]) => (
            <article className="history-row" key={food}>
              <small>{date}</small>
              <strong>
                {food}
                <span>{detail}</span>
              </strong>
              <b>{emoji}</b>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
