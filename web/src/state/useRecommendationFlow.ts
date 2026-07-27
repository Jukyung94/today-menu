import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  apiClient,
  clearRecommendationSessionId,
  ensureGuestAuth,
  readRecommendationSessionId,
  saveRecommendationSessionId,
  type AnswerValue,
  type RecommendationMode,
  type RecommendationSession,
} from "../api";

type FlowStatus =
  | "LOADING"
  | "READY"
  | "SUBMITTING"
  | "RECOVERING"
  | "ERROR";

interface RecommendationFlowState {
  status: FlowStatus;
  session: RecommendationSession | null;
  error: string | null;
}

const initialState: RecommendationFlowState = {
  status: "LOADING",
  session: null,
  error: null,
};

export function useRecommendationFlow(mode: RecommendationMode) {
  const [state, setState] = useState(initialState);
  const started = useRef(false);

  const start = useCallback(
    async (forceNew = false) => {
      setState({ status: "LOADING", session: null, error: null });
      try {
        await ensureGuestAuth();
        const savedSessionId = forceNew
          ? null
          : readRecommendationSessionId();
        let session: RecommendationSession;

        if (savedSessionId) {
          try {
            session =
              await apiClient.getRecommendationSession(savedSessionId);
            if (session.mode !== mode) {
              session = await apiClient.createRecommendationSession({ mode });
            }
          } catch (error) {
            if (
              error instanceof ApiError &&
              error.code !== "SESSION_EXPIRED"
            ) {
              throw error;
            }
            session = await apiClient.createRecommendationSession({ mode });
          }
        } else {
          session = await apiClient.createRecommendationSession({ mode });
        }

        saveRecommendationSessionId(session.sessionId);
        setState({ status: "READY", session, error: null });
      } catch (error) {
        setState({
          status: "ERROR",
          session: null,
          error:
            error instanceof Error
              ? error.message
              : "추천을 시작하지 못했습니다.",
        });
      }
    },
    [mode],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  const answer = useCallback(
    async (selectedValues: AnswerValue[]) => {
      const session = state.session;
      if (
        !session ||
        session.status !== "IN_PROGRESS" ||
        state.status !== "READY"
      ) {
        return;
      }
      const question = session.nextQuestion;

      setState((current) => ({
        ...current,
        status: "SUBMITTING",
        error: null,
      }));
      try {
        const next = await apiClient.submitAnswer(session.sessionId, {
          sessionVersion: session.version,
          questionKey: question.key,
          selectedValues,
        });
        setState({ status: "READY", session: next, error: null });
      } catch (error) {
        let failure: unknown = error;
        if (
          error instanceof ApiError &&
          error.code === "SESSION_VERSION_CONFLICT"
        ) {
          setState((current) => ({ ...current, status: "RECOVERING" }));
          try {
            const recovered = await apiClient.getRecommendationSession(
              session.sessionId,
            );
            setState({ status: "READY", session: recovered, error: null });
            return;
          } catch (recoveryError) {
            failure = recoveryError;
          }
        }
        setState((current) => ({
          ...current,
          status: "ERROR",
          error:
            failure instanceof Error
              ? failure.message
              : "답변을 저장하지 못했습니다.",
        }));
      }
    },
    [state.session, state.status],
  );

  const restart = useCallback(() => {
    clearRecommendationSessionId();
    void start(true);
  }, [start]);

  return { ...state, answer, restart, retry: start };
}
