import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import { API_BASE_URL, SURVEY_API } from "../services/api";
import { savePendingFields } from "../services/autosave";
import type { Question, Survey } from "../types/survey";
import styles from "./GoalSurveyComposer.module.css";

type ProposedQuestion = Pick<
  Question,
  | "question_text"
  | "question_type"
  | "is_required"
  | "options"
  | "validation_rules"
>;
type Proposal = {
  title: string;
  description: string;
  sections: { title: string; questions: ProposedQuestion[] }[];
};
type Props = {
  surveyId: number;
  language: string;
  disabled?: boolean;
  onApplied: (survey: Survey) => void;
};

export default function GoalSurveyComposer({
  surveyId,
  language,
  disabled = false,
  onApplied,
}: Props) {
  const { t } = useTranslation("generator");
  const { direction } = useLocale();
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [count, setCount] = useState(6);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<"generate" | "apply" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const active = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  useEffect(() => {
    requestId.current += 1;
    active.current?.abort();
    setProposal(null);
    setExcluded(new Set());
    setBusy(null);
    setError("");
    setSuccess(false);
    return () => {
      requestId.current += 1;
      active.current?.abort();
    };
  }, [surveyId, language]);
  async function post<T>(
    action: string,
    body: unknown,
    signal: AbortSignal,
  ): Promise<T> {
    const token = localStorage.getItem("token");
    const tenant = localStorage.getItem("tenant");
    const response = await fetch(
      `${API_BASE_URL}${SURVEY_API}/surveys/${surveyId}/${action}/`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
          ...(tenant ? { "X-Tenant-ID": tenant } : {}),
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      if (response.status === 503) throw new Error(t("unavailable"));
      if (response.status === 401 || response.status === 403)
        throw new Error(t("permission"));
      throw new Error(t("failed"));
    }
    return response.json();
  }
  async function generate() {
    if (disabled || busy || !goal.trim()) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const id = ++requestId.current;
    setBusy("generate");
    setError("");
    setSuccess(false);
    setProposal(null);
    try {
      const result = await post<Proposal | { proposal: Proposal }>(
        "generate",
        { goal: goal.trim(), audience: audience.trim(), language, count },
        controller.signal,
      );
      if (id !== requestId.current) return;
      const next = "proposal" in result ? result.proposal : result;
      if (
        !Array.isArray(next.sections) ||
        !next.sections.some((section) => section.questions?.length)
      )
        throw new Error(t("failed"));
      setProposal(next);
      setExcluded(new Set());
    } catch (reason) {
      if (!controller.signal.aborted && id === requestId.current)
        setError(reason instanceof Error ? reason.message : t("failed"));
    } finally {
      if (id === requestId.current) setBusy(null);
    }
  }
  const included =
    proposal?.sections.reduce(
      (total, section, si) =>
        total +
        section.questions.filter((_, qi) => !excluded.has(`${si}:${qi}`))
          .length,
      0,
    ) ?? 0;
  async function apply() {
    if (!proposal || !included || disabled || busy) return;
    const controller = new AbortController();
    active.current = controller;
    const id = ++requestId.current;
    setBusy("apply");
    setError("");
    const selected: Proposal = {
      ...proposal,
      sections: proposal.sections
        .map((section, si) => ({
          ...section,
          questions: section.questions.filter(
            (_, qi) => !excluded.has(`${si}:${qi}`),
          ),
        }))
        .filter((section) => section.questions.length),
    };
    try {
      await savePendingFields();
      if (controller.signal.aborted || id !== requestId.current) return;
      const result = await post<Survey | { survey: Survey }>(
        "apply-generated",
        { proposal: selected },
        controller.signal,
      );
      if (id !== requestId.current) return;
      onApplied("survey" in result ? result.survey : result);
      setProposal(null);
      setSuccess(true);
    } catch (reason) {
      if (!controller.signal.aborted && id === requestId.current)
        setError(reason instanceof Error ? reason.message : t("failed"));
    } finally {
      if (id === requestId.current) setBusy(null);
    }
  }
  return (
    <details className={styles.composer} dir={direction}>
      <summary className={styles.heading}>
        <span>
          <strong>{t("title")}</strong>
          <span className={styles.intro}>{t("intro")}</span>
        </span>
      </summary>
      <div className={styles.body}>
        <label className={styles.field}>
          {t("goal")}
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder={t("placeholder")}
            maxLength={4000}
            rows={3}
            disabled={disabled || !!busy}
          />
        </label>
        <div className={styles.fields}>
          <label className={styles.field}>
            {t("audience")}
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder={t("audiencePlaceholder")}
              maxLength={1000}
              disabled={disabled || !!busy}
            />
          </label>
          <label className={styles.field}>
            {t("count")}
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              disabled={disabled || !!busy}
            >
              {Array.from({ length: 15 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            disabled={disabled || !!busy || !goal.trim()}
            onClick={generate}
          >
            {busy === "generate" ? t("generating") : t("generate")}
          </button>
          <span>{t("manual")}</span>
        </div>
        {busy === "generate" && (
          <p className={styles.notice} role="status">
            {t("waiting")}
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className={styles.notice} role="status">
            {t("success")}
          </p>
        )}
        {proposal && (
          <div className={styles.review}>
            <div className={styles.reviewHeading}>
              <h3>{t("review")}</h3>
              <span>{t("selected", { count: included })}</span>
            </div>
            <p className={styles.notice}>{t("unsaved")}</p>
            <h4>{proposal.title}</h4>
            <p>{proposal.description}</p>
            {proposal.sections.map((section, si) => (
              <div key={si} className={styles.section}>
                <h4>{section.title}</h4>
                {section.questions.map((question, qi) => {
                  const key = `${si}:${qi}`;
                  return (
                    <details
                      key={key}
                      className={styles.question}
                      open={undefined}
                    >
                      <summary>
                        <span>{question.question_text}</span>
                        <small>
                          {t(`types.${question.question_type}`, {
                            defaultValue: question.question_type,
                          })}
                        </small>
                      </summary>
                      <div className={styles.questionBody}>
                        <label className={styles.include}>
                          <input
                            type="checkbox"
                            checked={!excluded.has(key)}
                            disabled={!!busy || disabled}
                            onChange={(event) =>
                              setExcluded((previous) => {
                                const next = new Set(previous);
                                if (event.target.checked) next.delete(key);
                                else next.add(key);
                                return next;
                              })
                            }
                          />
                          {t("include")}
                        </label>
                        <label className={styles.field}>
                          {t("questionText")}
                          <textarea
                            value={question.question_text}
                            disabled={!!busy || disabled}
                            maxLength={2000}
                            rows={2}
                            onChange={(event) =>
                              setProposal(
                                (previous) =>
                                  previous && {
                                    ...previous,
                                    sections: previous.sections.map(
                                      (item, index) =>
                                        index === si
                                          ? {
                                              ...item,
                                              questions: item.questions.map(
                                                (entry, index) =>
                                                  index === qi
                                                    ? {
                                                        ...entry,
                                                        question_text:
                                                          event.target.value,
                                                      }
                                                    : entry,
                                              ),
                                            }
                                          : item,
                                    ),
                                  },
                              )
                            }
                          />
                        </label>
                        {question.options?.length > 0 && (
                          <ul className={styles.options}>
                            {question.options.map((option, index) => (
                              <li key={index}>{option}</li>
                            ))}
                          </ul>
                        )}
                        <small>
                          {question.is_required ? t("required") : t("optional")}
                        </small>
                      </div>
                    </details>
                  );
                })}
              </div>
            ))}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                disabled={
                  disabled ||
                  !!busy ||
                  !included ||
                  proposal.sections.some((section, si) =>
                    section.questions.some(
                      (question, qi) =>
                        !excluded.has(`${si}:${qi}`) &&
                        !question.question_text.trim(),
                    ),
                  )
                }
                onClick={apply}
              >
                {busy === "apply"
                  ? t("applying")
                  : t("apply", { count: included })}
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={!!busy}
                onClick={() => setProposal(null)}
              >
                {t("discard")}
              </button>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
