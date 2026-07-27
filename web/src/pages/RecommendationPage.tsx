import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  apiClient,
  ensureGuestAuth,
  type AnswerValue,
  type MealLog,
  type MenuRecommendation,
  type RecommendationContext,
} from "../api";
import { useRecommendationFlow } from "../state/useRecommendationFlow";

type View = "flow" | "log" | "history";

function contextLabels(context: RecommendationContext) {
  return [
    context.category,
    context.mealForm,
    ...(context.tastes ?? []),
    context.situation,
  ].filter(
    (value): value is string =>
      Boolean(value) && value !== "ANY" && value !== "UNKNOWN",
  );
}

function foodEmoji(name: string) {
  if (name.includes("찌개") || name.includes("탕")) return "🥘";
  if (name.includes("면") || name.includes("모밀")) return "🍜";
  if (name.includes("밥")) return "🍛";
  return "🍽️";
}

function formatMealDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const day = 86_400_000;
  const difference = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) /
      day,
  );
  if (difference === 0) return "오늘";
  if (difference === 1) return "어제";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function RecommendationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "random"
    ? "PERSONALIZED_RANDOM"
    : "GUIDED";
  const flow = useRecommendationFlow(mode);
  const [view, setView] = useState<View>("flow");
  const [selectedResult, setSelectedResult] =
    useState<MenuRecommendation | null>(null);
  const [selectedValues, setSelectedValues] = useState<AnswerValue[]>([]);
  const [numberValue, setNumberValue] = useState("");
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [history, setHistory] = useState<MealLog[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const question =
    flow.session?.status === "IN_PROGRESS"
      ? flow.session.nextQuestion
      : null;
  const questionKey = question?.key;

  useEffect(() => {
    setSelectedValues([]);
    setNumberValue("");
  }, [questionKey]);

  useEffect(() => {
    if (view !== "history") return;
    let active = true;
    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        await ensureGuestAuth();
        const logs = await apiClient.listMealLogs();
        if (active) setHistory(logs);
      } catch (error) {
        if (active) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "식사 기록을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    }
    void loadHistory();
    return () => {
      active = false;
    };
  }, [view, saved]);

  const labels = useMemo(
    () => contextLabels(flow.session?.context ?? { contextVersion: 0 }),
    [flow.session?.context],
  );

  function toggleValue(value: AnswerValue) {
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function selectResult(result: MenuRecommendation) {
    setSelectedResult(result);
    setSaved(false);
    setFormError(null);
    setView("log");
    void apiClient
      .submitFeedback({
        resultId: result.resultId,
        actionType: "SELECTED",
      })
      .catch(() => undefined);
  }

  async function saveMealLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedResult || saving) return;
    setSaving(true);
    setSaved(false);
    setFormError(null);
    try {
      const uploaded = photo ? await apiClient.upload(photo) : null;
      await apiClient.createMealLog({
        recommendationResultId: selectedResult.resultId,
        foodId: selectedResult.food.id,
        rating,
        note: note.trim() || undefined,
        photoIds: uploaded ? [uploaded.id] : undefined,
        eatenAt: new Date().toISOString(),
      });
      setSaved(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "식사 기록을 저장하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

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

      {view === "flow" &&
        (flow.status === "LOADING" || flow.status === "RECOVERING") && (
          <section className="quiz flow-message" aria-live="polite">
            <b>{flow.status === "RECOVERING" ? "↻" : "🍽️"}</b>
            <h2>
              {flow.status === "RECOVERING"
                ? "최신 답변을 불러오고 있어요."
                : "오늘의 추천을 준비하고 있어요."}
            </h2>
          </section>
        )}

      {view === "flow" && flow.status === "ERROR" && (
        <section className="quiz flow-message" role="alert">
          <b>!</b>
          <h2>추천을 이어가지 못했어요.</h2>
          <p className="description">{flow.error}</p>
          <button className="primary" onClick={() => void flow.retry()}>
            다시 시도하기 →
          </button>
        </section>
      )}

      {view === "flow" && question && flow.status !== "ERROR" && (
        <section className="quiz">
          <button
            className="text-button"
            onClick={() => navigate("/mode")}
          >
            ← 추천 방식
          </button>
          <div className="progress">
            <span>오늘의 메뉴 추천</span>
            <span>
              {flow.session?.status === "IN_PROGRESS"
                ? `${flow.session.progress.current} / ${flow.session.progress.estimatedTotal}`
                : null}
            </span>
          </div>
          <div className="bar">
            <i
              style={{
                width: `${
                  flow.session?.status === "IN_PROGRESS"
                    ? (flow.session.progress.current /
                        flow.session.progress.estimatedTotal) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="eyebrow">취향 선택</p>
          <h2>{question.text}</h2>
          {question.description && (
            <p className="description">{question.description}</p>
          )}

          {question.selectionType === "NUMBER" ? (
            <form
              className="number-answer"
              onSubmit={(event) => {
                event.preventDefault();
                if (numberValue) void flow.answer([Number(numberValue)]);
              }}
            >
              <input
                type="number"
                value={numberValue}
                onChange={(event) => setNumberValue(event.target.value)}
                aria-label={question.text}
                required
              />
              <button className="primary" disabled={flow.status === "SUBMITTING"}>
                다음 →
              </button>
            </form>
          ) : (
            <>
              <div className="choices">
                {(question.options ?? [])
                  .filter((option) => !option.isFallback)
                  .map((option) => {
                    const selected = selectedValues.includes(option.value);
                    return (
                      <button
                        key={String(option.value)}
                        className={selected ? "selected" : ""}
                        disabled={flow.status === "SUBMITTING"}
                        onClick={() => {
                          if (question.selectionType === "MULTIPLE") {
                            toggleValue(option.value);
                          } else {
                            void flow.answer([option.value]);
                          }
                        }}
                      >
                        <b>{option.icon ?? "•"}</b>
                        <strong>{option.label}</strong>
                        <i>{selected ? "✓" : "→"}</i>
                      </button>
                    );
                  })}
              </div>
              {question.selectionType === "MULTIPLE" && (
                <button
                  className="primary choice-submit"
                  disabled={
                    selectedValues.length === 0 ||
                    flow.status === "SUBMITTING"
                  }
                  onClick={() => void flow.answer(selectedValues)}
                >
                  선택 완료 →
                </button>
              )}
              {question.options?.find((option) => option.isFallback) && (
                <button
                  className="text-button center"
                  disabled={flow.status === "SUBMITTING"}
                  onClick={() => {
                    const fallback = question.options?.find(
                      (option) => option.isFallback,
                    );
                    if (fallback) void flow.answer([fallback.value]);
                  }}
                >
                  잘 모르겠어요
                </button>
              )}
            </>
          )}
        </section>
      )}

      {view === "flow" &&
        flow.session?.status === "COMPLETED" &&
        flow.status !== "ERROR" && (
          <section className="result">
            <p className="eyebrow">오늘의 추천</p>
            <h2>
              취향에 맞춰
              <br />
              <i>{flow.session.recommendations.length}가지 메뉴</i>를 골랐어요.
            </h2>
            {labels.length > 0 && <p className="pill">{labels.join(" · ")}</p>}
            <div className="menu-list">
              {flow.session.recommendations.map((result) => (
                <article key={result.resultId}>
                  <em>{String(result.rank).padStart(2, "0")}</em>
                  <b className="food">{foodEmoji(result.food.name)}</b>
                  <div>
                    <h3>{result.food.name}</h3>
                    <p>
                      {result.matchedTags.map((tag) => (
                        <span key={tag.key}>{tag.label}</span>
                      ))}
                    </p>
                    <small>{result.reason}</small>
                  </div>
                  <button onClick={() => selectResult(result)}>
                    이 메뉴 선택 →
                  </button>
                </article>
              ))}
            </div>
            <p className="result-actions">
              <button onClick={flow.restart}>조건 바꾸기</button>
              <button onClick={() => navigate("/")}>나중에 결정하기</button>
            </p>
          </section>
        )}

      {view === "log" && selectedResult && (
        <section className="log">
          <div>
            <button className="text-button" onClick={() => setView("flow")}>
              ← 추천 결과
            </button>
            <p className="eyebrow">식사 기록</p>
            <h2>
              {selectedResult.food.name}
              <br />
              맛있게 드셨나요?
            </h2>
            <p className="description">
              한 줄 메모와 사진으로 오늘의 한 끼를 남겨보세요.
            </p>
          </div>
          <form onSubmit={saveMealLog}>
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
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="예: 매콤해서 기분 전환이 됐어요."
            />
            <label className="upload" htmlFor="photo">
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setPhoto(event.target.files?.[0] ?? null)
                }
              />
              <b>＋</b>
              <strong>{photo ? photo.name : "사진 한 장 추가하기"}</strong>
              <small>선택 · 사진은 비공개로 저장돼요</small>
            </label>
            <button className="primary" disabled={saving}>
              {saving ? "저장하고 있어요..." : "식사 기록 저장하기 →"}
            </button>
            {formError && (
              <p className="inline-error" role="alert">
                {formError}
              </p>
            )}
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
            최근,
            <br />
            <i>{history.length}번의 맛있는 선택</i>
          </h2>
          <div className="stats">
            <article>
              <small>기록한 식사</small>
              <strong>{history.length}끼</strong>
            </article>
            <article>
              <small>평균 만족도</small>
              <strong>
                {history.length
                  ? (
                      history.reduce((sum, log) => sum + log.rating, 0) /
                      history.length
                    ).toFixed(1)
                  : "-"}{" "}
                ★
              </strong>
            </article>
            <article>
              <small>사진이 있는 기록</small>
              <strong>{history.filter((log) => log.photoUrl).length}장</strong>
            </article>
          </div>
          <p className="recent-title">최근 기록</p>
          {historyLoading && <p className="description">불러오고 있어요...</p>}
          {historyError && (
            <p className="inline-error" role="alert">
              {historyError}
            </p>
          )}
          {history.map((log) => (
            <article className="history-row" key={log.id}>
              <small>{formatMealDate(log.eatenAt)}</small>
              <strong>
                {log.menuName}
                <span>
                  {log.note ?? `만족도 ${log.rating}점`}
                  {log.photoUrl ? " · 사진 1장" : ""}
                </span>
              </strong>
              <b>{log.menuEmoji ?? foodEmoji(log.menuName)}</b>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
