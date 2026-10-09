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
  for (let i = 0; i < all.length; i++) {
    const q = all[i];
    if (!isVisible(q, answers)) continue;
    result.push(q);
    const answer = answers[q.id];
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
function validate(q: Question, value: any) {
  const r = q.validation_rules || {};
  if (!present(value)) return q.is_required ? "پاسخ الزامی است" : "";
  if (["number", "rating", "nps"].includes(q.question_type)) {
    if (!Number.isFinite(Number(value))) return "عدد معتبر وارد کنید";
    const min = q.question_type === "nps" ? 0 : r.min;
    const max = q.question_type === "nps" ? 10 : r.max;
    if (min !== undefined && Number(value) < min) return `حداقل ${min}`;
    if (max !== undefined && Number(value) > max) return `حداکثر ${max}`;
  }
  if (q.question_type === "text" || q.question_type === "email") {
    if (r.min_length && String(value).length < r.min_length)
      return `حداقل ${r.min_length} حرف`;
    if (r.max_length && String(value).length > r.max_length)
      return `حداکثر ${r.max_length} حرف`;
    if (
      q.question_type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    )
      return "ایمیل معتبر وارد کنید";
  }
  if (q.question_type === "multiple_choice") {
    if (r.min_choices && value.length < r.min_choices)
      return `حداقل ${r.min_choices} انتخاب`;
    if (r.max_choices && value.length > r.max_choices)
      return `حداکثر ${r.max_choices} انتخاب`;
  }
  if (
    q.question_type === "ranking" &&
    (!Array.isArray(value) ||
      value.length !== q.options.length ||
      new Set(value).size !== value.length ||
      value.some((item) => !q.options.includes(item)))
  )
    return "تمام گزینه‌ها را رتبه بندی کنید";
  if (
    q.question_type === "matrix" &&
    (r.rows || []).some((row) => !value?.[row])
  )
    return "برای تمام ردیف‌ها پاسخ انتخاب کنید";
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
        setError("ذخیره موقت در این مرورگر در دسترس نیست.");
      }
    }
  }, [answers, page, ready, done, responseId, key, preview]);
  const visible = useMemo(
    () => activeQuestions(survey, answers),
    [survey, answers],
  );
  const sections = survey.sections
    .map((s) => ({
      ...s,
      questions: s.questions.filter((q) => visible.some((v) => v.id === q.id)),
    }))
    .filter((s) => s.questions.length);
  const current = sections[Math.min(page, Math.max(0, sections.length - 1))];
  const rtl = survey.settings?.language !== "en";
  const check = (questions: Question[]) => {
    const found: Record<string, string> = {};
    questions.forEach((q) => {
      const message = validate(q, answers[q.id]);
      if (message) found[q.id] = message;
    });
    setErrors(found);
    return !Object.keys(found).length;
  };
  const submit = async () => {
    if (!check(visible)) {
      setError("پاسخ‌های مشخص شده را بررسی کنید.");
      const invalid = sections.findIndex((s) =>
        s.questions.some((q) => validate(q, answers[q.id])),
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
          {preview ? "پیش‌نمایش کامل شد" : "پاسخ شما ثبت شد"}
        </h1>
        <p>از مشارکت شما سپاسگزاریم.</p>
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
            شروع دوباره
          </button>
        )}
      </section>
    );
  return (
    <section
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "fa" : "en"}
      className="bg-white p-4 md:p-8 rounded shadow space-y-6"
    >
      <h1 className="text-2xl font-bold">{survey.title}</h1>
      <p className="whitespace-pre-wrap">{survey.description}</p>
      {preview ? (
        <p className="bg-yellow-50 p-3">پیش‌نمایش؛ پاسخ ذخیره نمی‌شود.</p>
      ) : (
        <p className="text-sm text-gray-600">
          پاسخ موقت روی همین مرورگر ذخیره می‌شود؛ برای ادامه از همین لینک
          استفاده کنید. در دستگاه مشترک پس از پاسخ، داده موقت را پاک کنید.
        </p>
      )}
      <div>
        <progress
          className="w-full"
          max={Math.max(1, sections.length)}
          value={page + 1}
        />
        <p>
          بخش {Math.min(page + 1, sections.length)} از {sections.length}
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
          if (page < sections.length - 1) {
            if (current && check(current.questions)) setPage(page + 1);
          } else submit();
        }}
      >
        <fieldset disabled={busy} className="space-y-6">
          {current && (
            <>
              <h2 className="text-xl font-bold">{current.title}</h2>
              <p>{current.description}</p>
              {current.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="font-semibold block" id={`label-${q.id}`}>
                    {q.question_text.replace(/\{\{(\d+)\}\}/g, (_, id) =>
                      Array.isArray(answers[id])
                        ? answers[id].join("، ")
                        : typeof answers[id] === "object"
                          ? ""
                          : String(answers[id] ?? ""),
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
              disabled={page === 0}
              className="border p-3 rounded"
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              قبلی
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded"
            >
              {busy
                ? "در حال ارسال…"
                : page < sections.length - 1
                  ? "بعدی"
                  : "ثبت پاسخ"}
            </button>
            {!preview && (
              <button
                type="button"
                className="border p-3 rounded"
                onClick={() => {
                  if (confirm("پاسخ‌های موقت پاک شوند؟")) {
                    setAnswers({});
                    setPage(0);
                    setResponseId(crypto.randomUUID());
                    localStorage.removeItem(key);
                  }
                }}
              >
                پاک کردن پاسخ موقت
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
          [true, "بله"],
          [false, "خیر"],
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
              <option value="">انتخاب کنید</option>
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
            رتبه {i + 1}
            <select
              {...common}
              value={selected[i] || ""}
              onChange={(e) => {
                const next = [...selected];
                next[i] = e.target.value;
                onChange(next);
              }}
            >
              <option value="">انتخاب کنید</option>
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
      این نوع سؤال پشتیبانی نمی‌شود.
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
