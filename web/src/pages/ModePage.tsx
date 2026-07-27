import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  apiClient,
  ensureGuestAuth,
  type RecommendationEligibility,
} from "../api";

type EligibilityState =
  | { status: "LOADING" }
  | { status: "READY"; data: RecommendationEligibility }
  | { status: "ERROR"; message: string };

export function ModePage() {
  const navigate = useNavigate();
  const [eligibility, setEligibility] = useState<EligibilityState>({
    status: "LOADING",
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await ensureGuestAuth();
        const data = await apiClient.getRecommendationEligibility();
        if (active) setEligibility({ status: "READY", data });
      } catch (error) {
        if (active) {
          setEligibility({
            status: "ERROR",
            message:
              error instanceof Error
                ? error.message
                : "추천 자격을 확인하지 못했습니다.",
          });
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const data =
    eligibility.status === "READY" ? eligibility.data : null;
  const canUseRandom = data?.eligible ?? false;
  const recordedDays = data?.recordedDays ?? 0;
  const requiredDays = data?.requiredDays ?? 7;

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
              <small>몇 가지 질문으로 지금 당기는 메뉴를 찾아요.</small>
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
                {eligibility.status === "LOADING"
                  ? "식사 기록을 확인하고 있어요."
                  : canUseRandom
                    ? `최근 ${recordedDays}일 기록을 바탕으로 바로 추천해요.`
                    : `최근 ${requiredDays}일의 식사 기록이 쌓이면 사용할 수 있어요.`}
              </small>
            </span>
            <i>{canUseRandom ? "→" : "잠김"}</i>
          </button>
        </div>
        {eligibility.status === "ERROR" ? (
          <p className="record-status error" role="alert">
            {eligibility.message}
          </p>
        ) : (
          <p className={canUseRandom ? "record-status ready" : "record-status"}>
            <b>{canUseRandom ? "✓" : "○"}</b> 랜덤 추천 조건: 최근{" "}
            {requiredDays}일 동안 식사 기록 남기기{" "}
            <span>
              {recordedDays} / {requiredDays}일
            </span>
          </p>
        )}
      </section>
    </main>
  );
}
