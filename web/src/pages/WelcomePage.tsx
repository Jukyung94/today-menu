import { Link } from "react-router-dom";

export function WelcomePage() {
  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <span className="welcome-logo">오늘</span>
        <strong>오늘 메뉴</strong>
      </header>
      <section className="welcome-content">
        <p className="eyebrow">오늘의 한 끼를 더 쉽게</p>
        <h1>
          무엇을 먹을지,
          <br />
          <i>이제 가볍게.</i>
        </h1>
        <p className="welcome-description">
          몇 가지 선택만 하면 오늘의 메뉴를
          <br />
          함께 골라드릴게요.
        </p>
        <div className="entry-actions">
          <Link className="entry-primary" to="/login">
            로그인하고 시작하기 <span>→</span>
          </Link>
          <Link className="entry-secondary" to="/recommend">
            게스트로 시작하기
          </Link>
        </div>
        <p className="entry-note">
          게스트 기록은 나중에 계정으로 옮길 수 있어요.
        </p>
      </section>
      <div className="welcome-footer">
        <span>오늘의 추천</span>
        <b>🍽️</b>
        <span>식사 기록</span>
      </div>
    </main>
  );
}
