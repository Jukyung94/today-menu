import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <main className="auth-page">
      <Link className="auth-back" to="/">
        ← 돌아가기
      </Link>
      <section className="auth-card">
        <span className="welcome-logo">오늘</span>
        <p className="eyebrow">나의 메뉴 취향 저장하기</p>
        <h1>반가워요!</h1>
        <p>
          로그인하면 식사 기록과 취향을
          <br />
          다음 추천에 반영할 수 있어요.
        </p>
        <button
          className="auth-provider kakao"
          onClick={() => navigate("/mode")}
        >
          카카오로 계속하기
        </button>
        <button
          className="auth-provider"
          onClick={() => navigate("/mode")}
        >
          Google로 계속하기
        </button>
        <button className="auth-guest" onClick={() => navigate("/mode")}>
          게스트로 계속하기
        </button>
      </section>
    </main>
  );
}
