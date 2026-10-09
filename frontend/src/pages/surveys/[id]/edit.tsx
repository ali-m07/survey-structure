import { useLocale } from "../../../i18n/LocaleProvider";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiClient, SURVEY_API } from "../../../services/api";
import { Survey, Question, QUESTION_TYPES } from "../../../types/survey";
import { AutoField } from "../../../components/AutoField";
import { SurveyRunner } from "../../../components/SurveyRunner";
import { savePendingFields } from "../../../services/autosave";
export default function Builder() {
  const { t } = useTranslation("survey");
  const { direction } = useLocale();
  const router = useRouter();
  const { query } = router;
  const id = query.id;
  const [survey, setSurvey] = useState<Survey>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const load = async () => {
    if (!id) return;
    try {
      setSurvey(await apiClient.get(`${SURVEY_API}/surveys/${id}/`));
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const action = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await savePendingFields();
      await fn();
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  const patch = async (kind: string, key: number, data: unknown) => {
    await apiClient.patch(`${SURVEY_API}/${kind}/${key}/`, data);
  };
  if (!survey)
    return (
      <main className="p-8" dir={direction}>
        {error || t("loading")} <Link href="/surveys">{t("back")}</Link>
      </main>
    );
  const locked = survey.status !== "draft";
  const questionUpdate = async (q: Question, data: Partial<Question>) => {
    await patch("questions", q.id, data);
    setSurvey((current) =>
      current
        ? {
            ...current,
            sections: current.sections.map((s) => ({
              ...s,
              questions: s.questions.map((item) =>
                item.id === q.id ? { ...item, ...data } : item,
              ),
            })),
          }
        : current,
    );
  };
  const reorder = async (
    kind: string,
    items: { id: number; order: number }[],
    index: number,
    delta: number,
  ) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    for (let i = 0; i < next.length; i++)
      await patch(kind, next[i].id, { order: i });
  };
  const copy = async (q: Question, section: number, order: number) =>
    apiClient.post(`${SURVEY_API}/questions/`, {
      section,
      question_text: q.question_text,
      question_type: q.question_type,
      is_required: q.is_required,
      options: q.options,
      validation_rules: q.validation_rules,
      order,
    });
  return (
    <main dir={direction} className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <nav className="flex gap-4">
          <Link
            href="/surveys"
            onClick={(e) => {
              e.preventDefault();
              action(() => router.push("/surveys"));
            }}
          >
            {t("surveys")}
          </Link>
          <Link
            href={`/surveys/${id}`}
            onClick={(e) => {
              e.preventDefault();
              action(() => router.push(`/surveys/${id}`));
            }}
          >
            {t("publishReport")}
          </Link>
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await load();
                setPreview(!preview);
              })
            }
          >
            {preview ? t("edit") : t("preview")}
          </button>
          <button disabled={busy} onClick={() => action(async () => {})}>
            {t("saveAll")}
          </button>
        </nav>
        <h1 className="text-3xl font-bold">{t("builder")}</h1>
        {error && (
          <p role="alert" className="bg-red-50 text-red-800 p-4">
            {error}
          </p>
        )}
        {locked && <p className="bg-yellow-50 p-4">{t("locked")}</p>}
        {preview ? (
          <SurveyRunner survey={survey} preview />
        ) : (
          <fieldset disabled={busy || locked} className="space-y-4">
            <section className="bg-white p-6 rounded shadow space-y-3">
              <AutoField
                label={t("title")}
                value={survey.title}
                onSave={async (title) => {
                  await patch("surveys", survey.id, { title });
                  setSurvey((current) =>
                    current ? { ...current, title } : current,
                  );
                }}
              />
              <AutoField
                label={t("description")}
                value={survey.description}
                multiline
                onSave={async (description) => {
                  await patch("surveys", survey.id, { description });
                  setSurvey((current) =>
                    current ? { ...current, description } : current,
                  );
                }}
              />
              <label>
                {t("language")}{" "}
                <select
                  value={survey.settings?.language || "fa"}
                  onChange={(e) =>
                    action(() =>
                      patch("surveys", survey.id, {
                        settings: {
                          ...survey.settings,
                          language: e.target.value,
                        },
                      }),
                    )
                  }
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  checked={!!survey.settings?.allow_multiple}
                  onChange={(e) =>
                    action(() =>
                      patch("surveys", survey.id, {
                        settings: {
                          ...survey.settings,
                          allow_multiple: e.target.checked,
                        },
                      }),
                    )
                  }
                />{" "}
                {t("multiple")}
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  checked={!!survey.settings?.invitation_only}
                  onChange={(e) =>
                    action(() =>
                      patch("surveys", survey.id, {
                        settings: {
                          ...survey.settings,
                          invitation_only: e.target.checked,
                        },
                      }),
                    )
                  }
                />{" "}
                {t("invitationOnly")}
              </label>
              {(["starts_at", "ends_at"] as const).map((key) => (
                <label key={key} className="block">
                  {key === "starts_at" ? t("starts") : t("ends")}
                  <input
                    type="datetime-local"
                    className="border p-2 block"
                    value={survey[key] ? localDateTime(survey[key]!) : ""}
                    onChange={(e) =>
                      action(() =>
                        patch("surveys", survey.id, {
                          [key]: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        }),
                      )
                    }
                  />
                </label>
              ))}
              <label className="block">
                <input
                  type="checkbox"
                  checked={!!survey.settings?.randomize_options}
                  onChange={(e) =>
                    action(() =>
                      patch("surveys", survey.id, {
                        settings: {
                          ...survey.settings,
                          randomize_options: e.target.checked,
                        },
                      }),
                    )
                  }
                />{" "}
                {t("randomize")}
              </label>{" "}
            </section>
            {!survey.sections.length && (
              <p className="bg-white p-6 rounded">{t("noSections")}</p>
            )}
            {survey.sections.map((section, si) => (
              <section
                key={section.id}
                className="bg-white p-5 rounded shadow space-y-4"
              >
                <div className="flex flex-wrap gap-3">
                  <h2 className="font-bold">
                    {t("sectionNumber", { number: si + 1 })}
                  </h2>
                  <button
                    aria-label={t("moveUp")}
                    disabled={si === 0}
                    onClick={() =>
                      action(() => reorder("sections", survey.sections, si, -1))
                    }
                  >
                    ↑
                  </button>
                  <button
                    aria-label={t("moveDown")}
                    disabled={si === survey.sections.length - 1}
                    onClick={() =>
                      action(() => reorder("sections", survey.sections, si, 1))
                    }
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      action(() =>
                        apiClient.post(
                          `${SURVEY_API}/sections/${section.id}/duplicate/`,
                          {},
                        ),
                      )
                    }
                  >
                    {t("copySection")}
                  </button>
                  <button
                    className="text-red-700"
                    onClick={() => {
                      if (confirm(t("confirmSection")))
                        action(() =>
                          apiClient.delete(
                            `${SURVEY_API}/sections/${section.id}/`,
                          ),
                        );
                    }}
                  >
                    {t("deleteSection")}
                  </button>
                </div>
                <AutoField
                  label={t("sectionTitle")}
                  value={section.title}
                  onSave={(title) => patch("sections", section.id, { title })}
                />
                <AutoField
                  label={t("sectionDescription")}
                  value={section.description}
                  onSave={(description) =>
                    patch("sections", section.id, { description })
                  }
                />
                {!section.questions.length && (
                  <p className="text-gray-600">{t("noQuestions")}</p>
                )}
                {section.questions.map((q, qi) => (
                  <article key={q.id} className="border rounded p-4 space-y-3">
                    <div className="flex flex-wrap gap-3">
                      <span>
                        {t("questionNumber", { number: qi + 1, id: q.id })}
                      </span>
                      <button
                        aria-label={t("moveUp")}
                        disabled={qi === 0}
                        onClick={() =>
                          action(() =>
                            reorder("questions", section.questions, qi, -1),
                          )
                        }
                      >
                        ↑
                      </button>
                      <button
                        aria-label={t("moveDown")}
                        disabled={qi === section.questions.length - 1}
                        onClick={() =>
                          action(() =>
                            reorder("questions", section.questions, qi, 1),
                          )
                        }
                      >
                        ↓
                      </button>
                      <button
                        onClick={() =>
                          action(() =>
                            copy(q, section.id, section.questions.length),
                          )
                        }
                      >
                        {t("copy")}
                      </button>
                      <button
                        className="text-red-700"
                        onClick={() => {
                          if (confirm(t("confirmQuestion")))
                            action(() =>
                              apiClient.delete(
                                `${SURVEY_API}/questions/${q.id}/`,
                              ),
                            );
                        }}
                      >
                        {t("delete")}
                      </button>
                      <label>
                        {t("moveTo")}{" "}
                        <select
                          value={section.id}
                          onChange={(e) =>
                            action(() =>
                              patch("questions", q.id, {
                                section: Number(e.target.value),
                                order:
                                  survey.sections.find(
                                    (s) => s.id === Number(e.target.value),
                                  )?.questions.length || 0,
                              }),
                            )
                          }
                        >
                          {survey.sections.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <AutoField
                      label={t("questionText")}
                      value={q.question_text}
                      multiline
                      onSave={(question_text) =>
                        questionUpdate(q, { question_text })
                      }
                    />
                    <label>
                      {t("type")}{" "}
                      <select
                        value={q.question_type}
                        onChange={(e) =>
                          action(() =>
                            questionUpdate(q, {
                              question_type: e.target.value,
                            }),
                          )
                        }
                      >
                        {QUESTION_TYPES.map(([value]) => (
                          <option key={value} value={value}>
                            {t(`type_${value}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <input
                        type="checkbox"
                        checked={q.is_required}
                        onChange={(e) =>
                          action(() =>
                            questionUpdate(q, {
                              is_required: e.target.checked,
                            }),
                          )
                        }
                      />{" "}
                      {t("required")}
                    </label>
                    {[
                      "single_choice",
                      "multiple_choice",
                      "ranking",
                      "scale",
                    ].includes(q.question_type) && (
                      <AutoField
                        label={t("options")}
                        value={(q.options || []).join("\n")}
                        multiline
                        onSave={(value) =>
                          questionUpdate(q, {
                            options: value
                              .split("\n")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    )}
                    <details>
                      <summary>{t("logic")}</summary>
                      <RuleEditor
                        question={q}
                        questions={survey.sections.flatMap((s) => s.questions)}
                        save={(rules) =>
                          questionUpdate(q, { validation_rules: rules })
                        }
                      />
                    </details>
                  </article>
                ))}
                <button
                  className="border border-dashed p-3 w-full"
                  onClick={() =>
                    action(() =>
                      apiClient.post(`${SURVEY_API}/questions/`, {
                        section: section.id,
                        question_text: t("newQuestion"),
                        question_type: "text",
                        is_required: false,
                        order: section.questions.length,
                        options: [],
                        validation_rules: {},
                      }),
                    )
                  }
                >
                  {t("addQuestion")}
                </button>
              </section>
            ))}
            <button
              className="bg-blue-600 text-white p-3 rounded"
              onClick={() =>
                action(() =>
                  apiClient.post(`${SURVEY_API}/sections/`, {
                    survey: survey.id,
                    title: t("newSection"),
                    description: "",
                    order: survey.sections.length,
                  }),
                )
              }
            >
              {t("addSection")}
            </button>
          </fieldset>
        )}
      </div>
    </main>
  );
}
function conditionDefault(question?: Question) {
  return question?.question_type === "boolean"
    ? true
    : question && ["number", "rating", "nps"].includes(question.question_type)
      ? 0
      : question?.options?.[0] || "";
}
function localDateTime(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function RuleEditor({
  question,
  questions,
  save,
}: {
  question: Question;
  questions: Question[];
  save: (rules: any) => Promise<void>;
}) {
  const { t } = useTranslation("survey");
  const [rules, setRules] = useState(question.validation_rules || {});
  const [matrixRows, setMatrixRows] = useState(
    (question.validation_rules?.rows || []).join("\n"),
  );
  const [matrixColumns, setMatrixColumns] = useState(
    (question.validation_rules?.columns || []).join("\n"),
  );
  const [status, setStatus] = useState("");
  const index = questions.findIndex((q) => q.id === question.id);
  const earlier = questions.slice(0, index);
  const later = questions.slice(index + 1);
  const bounds = ["number", "rating", "nps"].includes(question.question_type)
    ? [
        ["min", t("min")],
        ["max", t("max")],
      ]
    : ["text", "email"].includes(question.question_type)
      ? [
          ["min_length", t("minLength")],
          ["max_length", t("maxLength")],
        ]
      : question.question_type === "multiple_choice"
        ? [
            ["min_choices", t("minChoices")],
            ["max_choices", t("maxChoices")],
          ]
        : [];
  const update = (key: string, value: any) =>
    setRules((current) => ({ ...current, [key]: value }));
  const source = earlier.find((q) => q.id === rules.display_if?.question);
  const numeric =
    source && ["number", "rating", "nps"].includes(source.question_type);
  const triggerOptions =
    question.question_type === "boolean"
      ? ["true", "false"]
      : question.question_type === "nps"
        ? Array.from({ length: 11 }, (_, i) => String(i))
        : question.question_type === "rating"
          ? Array.from(
              {
                length: Math.min(
                  101,
                  Math.max(0, (rules.max ?? 5) - (rules.min ?? 1) + 1),
                ),
              },
              (_, i) => String(i + (rules.min ?? 1)),
            )
          : question.options || [];
  return (
    <div className="space-y-4 pt-3">
      {bounds.map(([key, label]) => (
        <label key={key} className="block">
          {label}
          <input
            className="border p-2 block"
            type="number"
            value={(rules as any)[key] ?? ""}
            onChange={(e) =>
              update(
                key,
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </label>
      ))}
      {question.question_type === "matrix" &&
        ["rows", "columns"].map((key) => (
          <label key={key} className="block">
            {t(key === "rows" ? "matrixRows" : "matrixColumns")}
            <textarea
              className="border p-2 w-full"
              value={key === "rows" ? matrixRows : matrixColumns}
              onChange={(e) => {
                if (key === "rows") setMatrixRows(e.target.value);
                else setMatrixColumns(e.target.value);
                update(
                  key,
                  e.target.value
                    .split("\n")
                    .map((v) => v.trim())
                    .filter(Boolean),
                );
              }}
            />
          </label>
        ))}
      <div className="border p-3 rounded space-y-2">
        <label className="block">
          {t("conditional")}
          <select
            className="border p-2 block w-full"
            value={rules.display_if?.question || ""}
            onChange={(e) =>
              update(
                "display_if",
                e.target.value
                  ? {
                      question: Number(e.target.value),
                      operator: "equals",
                      value: conditionDefault(
                        earlier.find((q) => q.id === Number(e.target.value)),
                      ),
                    }
                  : undefined,
              )
            }
          >
            <option value="">{t("always")}</option>
            {earlier.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question_text}
              </option>
            ))}
          </select>
        </label>
        {rules.display_if && (
          <>
            <label className="block">
              {t("condition")}
              <select
                className="border p-2 block"
                value={rules.display_if.operator}
                onChange={(e) =>
                  update("display_if", {
                    ...rules.display_if,
                    operator: e.target.value,
                  })
                }
              >
                {[
                  ["equals", t("equals")],
                  ["not_equals", t("notEquals")],
                  ["contains", t("contains")],
                  ["greater_than", t("greater")],
                  ["less_than", t("less")],
                  ["answered", t("answered")],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {rules.display_if.operator !== "answered" &&
              (source?.question_type === "boolean" ? (
                <label>
                  {t("answer")}
                  <select
                    className="border p-2"
                    value={String(rules.display_if.value)}
                    onChange={(e) =>
                      update("display_if", {
                        ...rules.display_if,
                        value: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">{t("yes")}</option>
                    <option value="false">{t("no")}</option>
                  </select>
                </label>
              ) : (
                <label className="block">
                  {t("value")}
                  <input
                    className="border p-2 block"
                    type={numeric ? "number" : "text"}
                    list={`choices-${question.id}`}
                    value={String(rules.display_if.value ?? "")}
                    onChange={(e) =>
                      update("display_if", {
                        ...rules.display_if,
                        value: numeric
                          ? Number(e.target.value)
                          : e.target.value,
                      })
                    }
                  />
                  <datalist id={`choices-${question.id}`}>
                    {(source?.options || []).map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </label>
              ))}
          </>
        )}
      </div>
      {["single_choice", "scale", "rating", "nps", "boolean"].includes(
        question.question_type,
      ) && (
        <div className="border p-3 rounded space-y-2">
          <h3 className="font-semibold">{t("branch")}</h3>
          {triggerOptions.map((trigger) => (
            <label key={trigger} className="block">
              {t("answerTrigger", {
                answer:
                  trigger === "true"
                    ? t("yes")
                    : trigger === "false"
                      ? t("no")
                      : trigger,
              })}
              <select
                className="border p-2 block w-full"
                value={rules.jump_to?.[trigger] || ""}
                onChange={(e) => {
                  const branches = { ...rules.jump_to };
                  if (e.target.value)
                    branches[trigger] = Number(e.target.value);
                  else delete branches[trigger];
                  update("jump_to", branches);
                }}
              >
                <option value="">{t("normal")}</option>
                {later.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.question_text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <button
        className="border p-2 rounded"
        onClick={async () => {
          try {
            await save(rules);
            setStatus(t("saved"));
          } catch (e) {
            setStatus(String(e));
          }
        }}
      >
        {t("saveLogic")}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
