import { Link, useNavigate } from "react-router-dom";

const recordedDays = 12;
const minimumDays = 7;

export function ModePage() {
  const navigate = useNavigate();
  const canUseRandom = recordedDays >= minimumDays;

  return (
    <main className="mode-page">
      <Link className="auth-back" to="/">
        ← 돌아가기
      </Link>
      <section className="mode-content">
        <p className="eyebrow">오늘의 메뉴 추천</p>
        <h1>
          어떤 방식으로
          <br />
          골라볼까요?
        </h1>
        <p className="mode-description">
          직접 취향을 알려주거나, 쌓인 식사 기록에 맡겨보세요.
        </p>
        <div className="mode-options">
          <button className="mode-card" onClick={() => navigate("/recommend")}>
            <span className="mode-icon">☝️</span>
            <span className="mode-copy">
              <strong>오늘의 취향 직접 고르기</strong>
              <small>4가지 질문으로 지금 당기는 메뉴를 찾아요.</small>
            </span>
            <i>→</i>
          </button>
          <button
            className="mode-card random"
            disabled={!canUseRandom}
            onClick={() => navigate("/recommend?mode=random")}
          >
            <span className="mode-icon">🎲</span>
            <span className="mode-copy">
              <strong>내 취향으로 랜덤 추천</strong>
              <small>
                {canUseRandom
                  ? `최근 ${recordedDays}일 기록을 바탕으로 바로 추천해요.`
                  : `최근 ${minimumDays}일의 식사 기록이 쌓이면 사용할 수 있어요.`}
              </small>
            </span>
            <i>{canUseRandom ? "→" : "잠김"}</i>
          </button>
        </div>
        <p className={canUseRandom ? "record-status ready" : "record-status"}>
          <b>{canUseRandom ? "✓" : "○"}</b> 랜덤 추천 조건: 최근 {minimumDays}일
          동안 식사 기록 남기기{" "}
          <span>
            {recordedDays} / {minimumDays}일
          </span>
        </p>
      </section>
    </main>
  );
}
