import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Survey, Question } from "../types/survey";
import { apiClient, SURVEY_API } from "../services/api";
type Answers = Record<string, any>;
function present(v: any) {
  return (
    v !== undefined &&
    v !== null &&
    v !== "" &&
    (!Array.isArray(v) || v.length > 0) &&
    (typeof v !== "object" || Array.isArray(v) || Object.keys(v).length > 0)
  );
}
export function isVisible(q: Question, answers: Answers) {
  const rule = q.validation_rules?.display_if;
  if (!rule) return true;
  const value = answers[rule.question];
  switch (rule.operator) {
    case "answered":
      return present(value);
    case "equals":
      return value === rule.value;
    case "not_equals":
      return value !== rule.value;
    case "contains":
      return Array.isArray(value)
        ? value.includes(rule.value)
        : typeof value === "string" &&
            typeof rule.value === "string" &&
            value.includes(rule.value);
    case "greater_than":
      return present(value) && Number(value) > Number(rule.value);
    case "less_than":
      return present(value) && Number(value) < Number(rule.value);
    default:
      return false;
  }
}
export function activeQuestions(survey: Survey, answers: Answers) {
  const all = survey.sections.flatMap((s) => s.questions);
  const result: Question[] = [];
  const reachableAnswers: Answers = {};
  for (let i = 0; i < all.length; i++) {
    const q = all[i];
    if (!isVisible(q, reachableAnswers)) continue;
    result.push(q);
    const answer = answers[q.id];
    reachableAnswers[q.id] = answer;
    const destination =
      typeof answer === "object"
        ? undefined
        : q.validation_rules?.jump_to?.[
            typeof answer === "boolean"
              ? answer
                ? "true"
                : "false"
              : String(answer)
          ];
    if (destination) {
      const next = all.findIndex((item) => item.id === destination);
      if (next > i) i = next - 1;
    }
  }
  return result;
}
function validate(
  q: Question,
  value: any,
  t: (key: string, options?: any) => string,
) {
  const r = q.validation_rules || {};
  if (!present(value)) return q.is_required ? t("requiredAnswer") : "";
  if (["number", "rating", "nps"].includes(q.question_type)) {
    if (!Number.isFinite(Number(value))) return t("validNumber");
    const min = q.question_type === "nps" ? 0 : r.min;
    const max = q.question_type === "nps" ? 10 : r.max;
    if (min !== undefined && Number(value) < min)
      return t("minimum", { value: min });
    if (max !== undefined && Number(value) > max)
      return t("maximum", { value: max });
  }
  if (q.question_type === "text" || q.question_type === "email") {
    if (r.min_length && String(value).length < r.min_length)
      return t("minimumLength", { value: r.min_length });
    if (r.max_length && String(value).length > r.max_length)
      return t("maximumLength", { value: r.max_length });
    if (
      q.question_type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      return t("validEmail");
  }
  if (q.question_type === "multiple_choice") {
    if (r.min_choices && value.length < r.min_choices)
      return t("minimumSelections", { value: r.min_choices });
    if (r.max_choices && value.length > r.max_choices)
      return t("maximumSelections", { value: r.max_choices });
  }
  if (
    q.question_type === "ranking" &&
    (!Array.isArray(value) ||
      value.length !== q.options.length ||
      new Set(value).size !== value.length ||
      value.some((item) => !q.options.includes(item)))
  )
    return t("rankAll");
  if (
    q.question_type === "matrix" &&
    (r.rows || []).some((row) => !value?.[row])
  )
    return t("matrixAll");
  return "";
}
export function SurveyRunner({
  survey,
  preview = false,
  token,
}: {
  survey: Survey;
  preview?: boolean;
  token?: string;
}) {
  const { t } = useTranslation("survey");
  const [answers, setAnswers] = useState<Answers>({});
  const [page, setPage] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [responseId, setResponseId] = useState("");
  const key = `survey-draft:${survey.id}:${survey.published_version || 0}:${token || "public"}`;
  useEffect(() => {
    if (preview) {
      setReady(true);
      return;
    }
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const draft = JSON.parse(saved);
        setAnswers(draft.answers || {});
        setPage(draft.page || 0);
        setResponseId(draft.responseId || crypto.randomUUID());
        setDone(!!draft.completed);
      } else setResponseId(crypto.randomUUID());
    } catch {
      setResponseId(crypto.randomUUID());
    }
    setReady(true);
  }, [key, preview]);
  useEffect(() => {
    if (ready && !preview) {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            answers: done ? {} : answers,
            page,
            responseId,
            completed: done,
          }),
        );
      } catch {
        setError(t("storage"));
      }
    }
  }, [answers, page, ready, done, responseId, key, preview]);
  const visible = useMemo(
    () => activeQuestions(survey, answers),
    [survey, answers],
  );
  const visibleAnswers: Answers = Object.fromEntries(
    visible.map((q) => [q.id, answers[q.id]]),
  );
  const sections = survey.sections
    .map((s) => ({
      ...s,
      questions: s.questions.filter((q) => visible.some((v) => v.id === q.id)),
    }))
    .filter((s) => s.questions.length);
  const currentPage = Math.min(page, Math.max(0, sections.length - 1));
  const current = sections[currentPage];
  const contentLanguage = survey.settings?.language || "fa";
  const rtl = contentLanguage === "fa";
  const check = (questions: Question[]) => {
    const found: Record<string, string> = {};
    questions.forEach((q) => {
      const message = validate(q, answers[q.id], t);
      if (message) found[q.id] = message;
    });
    setErrors(found);
    return !Object.keys(found).length;
  };
  const submit = async () => {
    if (!check(visible)) {
      setError(t("checkAnswers"));
      const invalid = sections.findIndex((s) =>
        s.questions.some((q) => validate(q, answers[q.id], t)),
      );
      if (invalid >= 0) setPage(invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (!preview)
        await apiClient.request(
          `${SURVEY_API}/public/surveys/${survey.id}/submit/`,
          "POST",
          {
            token,
            response_id: responseId,
            answers: visible
              .filter((q) => present(answers[q.id]))
              .map((q) => ({ question: q.id, answer_value: answers[q.id] })),
          },
          true,
        );
      setDone(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  if (done)
    return (
      <section
        dir={rtl ? "rtl" : "ltr"}
        className="bg-white p-8 rounded shadow text-center space-y-4"
      >
        <h1 className="text-2xl font-bold">
          {preview ? t("previewDone") : t("submitted")}
        </h1>
        <p>{t("thanks")}</p>
        {(preview || survey.settings?.allow_multiple) && (
          <button
            className="border p-3 rounded"
            onClick={() => {
              setDone(false);
              setAnswers({});
              setPage(0);
              setResponseId(crypto.randomUUID());
            }}
          >
            {t("restart")}
          </button>
        )}
      </section>
    );
  return (
    <section
      dir={rtl ? "rtl" : "ltr"}
      lang={contentLanguage}
      className="bg-white p-4 md:p-8 rounded shadow space-y-6"
    >
      <h1 className="text-2xl font-bold">{survey.title}</h1>
      <p className="whitespace-pre-wrap">{survey.description}</p>
      {preview ? (
        <p className="bg-yellow-50 p-3">{t("previewNotice")}</p>
      ) : (
        <p className="text-sm text-gray-600">{t("draftNotice")}</p>
      )}
      <div>
        <progress
          className="w-full"
          max={Math.max(1, sections.length)}
          value={currentPage + 1}
        />
        <p>
          {t("progress", {
            current: Math.min(currentPage + 1, sections.length),
            total: sections.length,
          })}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentPage < sections.length - 1) {
            if (current && check(current.questions)) setPage(currentPage + 1);
          } else submit();
        }}
      >
        <fieldset disabled={busy} className="space-y-6">
          {!current && <p role="status">{t("noVisibleQuestions")}</p>}
          {current && (
            <>
              <h2 className="text-xl font-bold">{current.title}</h2>
              <p>{current.description}</p>
              {current.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="font-semibold block" id={`label-${q.id}`}>
                    {q.question_text.replace(/\{\{(\d+)\}\}/g, (_, id) =>
                      Array.isArray(visibleAnswers[id])
                        ? visibleAnswers[id].join("، ")
                        : typeof visibleAnswers[id] === "object"
                          ? ""
                          : String(visibleAnswers[id] ?? ""),
                    )}
                    {q.is_required && <span className="text-red-700"> *</span>}
                  </label>
                  <AnswerInput
                    q={q}
                    shuffleSeed={
                      survey.settings?.randomize_options
                        ? preview
                          ? "preview"
                          : responseId
                        : undefined
                    }
                    value={answers[q.id]}
                    onChange={(value) =>
                      setAnswers({ ...answers, [q.id]: value })
                    }
                  />
                  {errors[q.id] && (
                    <p role="alert" className="text-red-700">
                      {errors[q.id]}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={currentPage === 0}
              className="border p-3 rounded"
              onClick={() => setPage(Math.max(0, currentPage - 1))}
            >
              {t("previous")}
            </button>
            <button
              type="submit"
              disabled={!visible.length}
              className="bg-blue-600 text-white p-3 rounded"
            >
              {busy
                ? t("submitting")
                : currentPage < sections.length - 1
                  ? t("next")
                  : t("submit")}
            </button>
            {!preview && (
              <button
                type="button"
                className="border p-3 rounded"
                onClick={() => {
                  if (confirm(t("clearConfirm"))) {
                    setAnswers({});
                    setPage(0);
                    setResponseId(crypto.randomUUID());
                    localStorage.removeItem(key);
                  }
                }}
              >
                {t("clearDraft")}
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
function AnswerInput({
  q,
  value,
  onChange,
  shuffleSeed,
}: {
  q: Question;
  shuffleSeed?: string;
  value: any;
  onChange: (v: any) => void;
}) {
  const { t } = useTranslation("survey");
  const r = q.validation_rules || {};
  const common = {
    "aria-labelledby": `label-${q.id}`,
    className: "border p-3 rounded w-full",
  };
  if (q.question_type === "text")
    return (
      <textarea
        {...common}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        maxLength={r.max_length}
        rows={3}
      />
    );
  if (["date", "email", "number"].includes(q.question_type))
    return (
      <input
        {...common}
        type={q.question_type}
        value={value ?? ""}
        min={r.min}
        max={r.max}
        onChange={(e) =>
          onChange(
            q.question_type === "number" && e.target.value !== ""
              ? Number(e.target.value)
              : e.target.value,
          )
        }
      />
    );
  if (q.question_type === "boolean")
    return (
      <div
        role="group"
        aria-labelledby={`label-${q.id}`}
        className="flex gap-4"
      >
        {[
          [true, t("yes")],
          [false, t("no")],
        ].map(([v, label]) => (
          <label key={String(v)}>
            <input
              type="radio"
              name={`q-${q.id}`}
              checked={value === v}
              onChange={() => onChange(v)}
            />{" "}
            {label}
          </label>
        ))}
      </div>
    );
  if (
    ["single_choice", "multiple_choice", "scale", "rating", "nps"].includes(
      q.question_type,
    )
  ) {
    const numeric = q.question_type === "rating" || q.question_type === "nps";
    const options = numeric
      ? Array.from(
          {
            length: Math.max(
              0,
              Math.min(
                101,
                (q.question_type === "nps" ? 10 : (r.max ?? 5)) -
                  (q.question_type === "nps" ? 0 : (r.min ?? 1)) +
                  1,
              ),
            ),
          },
          (_, i) => String(i + (q.question_type === "nps" ? 0 : (r.min ?? 1))),
        )
      : shuffleSeed &&
          ["single_choice", "multiple_choice"].includes(q.question_type)
        ? shuffleOptions(q.options, `${shuffleSeed}:${q.id}`)
        : q.options;
    return (
      <div
        role="group"
        aria-labelledby={`label-${q.id}`}
        className="flex flex-wrap gap-3"
      >
        {options.map((option) => (
          <label key={option} className="border rounded p-3">
            <input
              type={
                q.question_type === "multiple_choice" ? "checkbox" : "radio"
              }
              name={`q-${q.id}`}
              checked={
                q.question_type === "multiple_choice"
                  ? (value || []).includes(option)
                  : value === (numeric ? Number(option) : option)
              }
              onChange={(e) =>
                onChange(
                  q.question_type === "multiple_choice"
                    ? e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter((x: string) => x !== option)
                    : numeric
                      ? Number(option)
                      : option,
                )
              }
            />{" "}
            {option}
          </label>
        ))}
      </div>
    );
  }
  if (q.question_type === "matrix")
    return (
      <div className="space-y-3">
        {(r.rows || []).map((row) => (
          <label key={row} className="block">
            {row}
            <select
              {...common}
              value={value?.[row] || ""}
              onChange={(e) => onChange({ ...value, [row]: e.target.value })}
            >
              <option value="">{t("select")}</option>
              {(r.columns || q.options).map((column) => (
                <option key={column}>{column}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    );
  if (q.question_type === "ranking") {
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        {q.options.map((_, i) => (
          <label key={i} className="block">
            {t("rank", { number: i + 1 })}
            <select
              {...common}
              value={selected[i] || ""}
              onChange={(e) => {
                const next = [...selected];
                next[i] = e.target.value;
                onChange(next);
              }}
            >
              <option value="">{t("select")}</option>
              {q.options
                .filter(
                  (option) =>
                    !selected.includes(option) || selected[i] === option,
                )
                .map((option) => (
                  <option key={option}>{option}</option>
                ))}
            </select>
          </label>
        ))}
      </div>
    );
  }
  return (
    <p role="alert" className="text-red-700">
      {t("unsupported")}
    </p>
  );
}
function shuffleOptions(options: string[], seed: string) {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++)
    state = Math.imul(state ^ seed.charCodeAt(i), 16777619) >>> 0;
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
