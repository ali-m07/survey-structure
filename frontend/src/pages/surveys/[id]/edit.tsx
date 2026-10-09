import BulkQuestionImporter from "../../../components/BulkQuestionImporter";
import QuestionAnswerPreview from "../../../components/QuestionAnswerPreview";
import GoalSurveyComposer from "../../../components/GoalSurveyComposer";
import Head from "next/head";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import styles from "../../../styles/Builder.module.css";
import { useLocale } from "../../../i18n/LocaleProvider";
import { useTranslation } from "react-i18next";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { apiClient, SURVEY_API } from "../../../services/api";
import { Survey, Question, QUESTION_TYPES } from "../../../types/survey";
import { AutoField } from "../../../components/AutoField";
import { SurveyRunner } from "../../../components/SurveyRunner";
import { registerSave, savePendingFields } from "../../../services/autosave";
export default function Builder() {
  const { t } = useTranslation("survey");
  const { t: extra } = useTranslation("builderExtras");
  const { direction, locale } = useLocale();
  const router = useRouter();
  const { query } = router;
  const id = query.id;
  const [survey, setSurvey] = useState<Survey>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number>();
  const [selectedQuestion, setSelectedQuestion] = useState<number>();
  const lastScrolledQuestion = useRef<number>();
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
  useEffect(() => {
    if (
      !selectedQuestion ||
      selectedQuestion === lastScrolledQuestion.current ||
      !survey?.sections.some((section) =>
        section.questions.some((question) => question.id === selectedQuestion),
      ) ||
      !window.matchMedia("(max-width: 650px)").matches
    )
      return;
    const frame = requestAnimationFrame(() => {
      const editor = document.getElementById(`question-${selectedQuestion}`);
      if (!editor) return;
      lastScrolledQuestion.current = selectedQuestion;
      editor.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedQuestion, survey]);
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
      question_html: q.question_html || "",
      question_type: q.question_type,
      is_required: q.is_required,
      options: q.options,
      validation_rules: q.validation_rules,
      order,
    });
  const activeSection =
    survey.sections.find((s) => s.id === selectedSection) || survey.sections[0];
  const activeQuestion =
    activeSection?.questions.find((q) => q.id === selectedQuestion) ||
    activeSection?.questions[0];
  const createQuestion = (type: string) =>
    action(async () => {
      let section = activeSection;
      if (!section) {
        section = await apiClient.post(`${SURVEY_API}/sections/`, {
          survey: survey.id,
          title: t("newSection"),
          description: "",
          order: 0,
        });
      }
      const defaults = questionDefaults(type, t);
      const question = await apiClient.post<Question>(
        `${SURVEY_API}/questions/`,
        {
          section: section!.id,
          question_text: t("newQuestion"),
          question_type: type,
          is_required: false,
          order: section!.questions?.length || 0,
          ...defaults,
        },
      );
      setSelectedSection(section!.id);
      setSelectedQuestion(question.id);
    });
  return (
    <main dir={direction} className={styles.builder}>
      <Head>
        <title>
          {t("builder")} | {survey.title}
        </title>
      </Head>
      <div className={styles.container}>
        <nav className="flex gap-4">
          <LanguageSwitcher />
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
        <header className={styles.heading}>
          <div>
            <h1>{survey.title || t("builder")}</h1>
            <p>{t("studio.intro")}</p>
          </div>
          <span>
            {t("studio.questionCount", {
              count: survey.sections.flatMap((s) => s.questions).length,
            })}
          </span>
        </header>
        {error && (
          <p role="alert" className="bg-red-50 text-red-800 p-4">
            {error}
          </p>
        )}
        {locked && (
          <div className={styles.locked}>
            <p>{t("locked")}</p>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  const draft = await apiClient.post<Survey>(
                    `${SURVEY_API}/surveys/${survey.id}/duplicate/`,
                    {},
                  );
                  await router.push(`/surveys/${draft.id}/edit`);
                })
              }
            >
              {t("studio.duplicateDraft")}
            </button>
          </div>
        )}
        {preview ? (
          <SurveyRunner survey={survey} preview />
        ) : (
          <fieldset disabled={busy || locked} className={styles.layout}>
            <div className={styles.composer}>
              <GoalSurveyComposer
                surveyId={survey.id}
                language={survey.settings?.language || locale}
                disabled={busy || locked}
                onApplied={(next) => {
                  setSurvey(next);
                  const section = next.sections[next.sections.length - 1];
                  setSelectedSection(section?.id);
                  setSelectedQuestion(section?.questions[0]?.id);
                }}
              />
              <BulkQuestionImporter
                surveyId={survey.id}
                sectionId={activeSection?.id}
                disabled={busy || locked}
                onApplied={(next) => {
                  const previousIds = new Set(
                    survey.sections.flatMap((s) =>
                      s.questions.map((q) => q.id),
                    ),
                  );
                  setSurvey(next);
                  const imported = next.sections
                    .flatMap((s) => s.questions)
                    .find((q) => !previousIds.has(q.id));
                  if (imported) {
                    setSelectedSection(imported.section);
                    setSelectedQuestion(imported.id);
                  }
                }}
              />
            </div>
            <aside className={styles.toolbox}>
              <h2>{t("studio.addType")}</h2>
              <p>{t("studio.typeHint")}</p>
              <div className={styles.types}>
                {QUESTION_TYPES.map(([type]) => (
                  <button key={type} onClick={() => createQuestion(type)}>
                    <TypeIcon type={type} />
                    <span>{t(`type_${type}`)}</span>
                  </button>
                ))}
              </div>
              <OutlineDisclosure
                activeId={activeQuestion?.id}
                label={activeQuestion?.question_text || t("studio.outline")}
                count={survey.sections.flatMap((s) => s.questions).length}
              >
                <h2>{t("studio.outline")}</h2>
                {!survey.sections.length && <p>{t("studio.outlineEmpty")}</p>}
                {survey.sections.map((section, index) => (
                  <div key={section.id} className={styles.outline}>
                    <button
                      className={
                        activeSection?.id === section.id ? styles.active : ""
                      }
                      onClick={() =>
                        action(async () => {
                          setSelectedSection(section.id);
                          setSelectedQuestion(section.questions[0]?.id);
                        })
                      }
                    >
                      {index + 1}. {section.title || t("newSection")}
                    </button>
                    {section.questions.map((q, index) => (
                      <button
                        key={q.id}
                        className={
                          activeQuestion?.id === q.id ? styles.active : ""
                        }
                        onClick={() =>
                          action(async () => {
                            setSelectedSection(section.id);
                            setSelectedQuestion(q.id);
                          })
                        }
                      >
                        <span>{index + 1}</span>
                        {q.question_text || t("studio.untitledQuestion")}
                        <small>{t(`type_${q.question_type}`)}</small>
                      </button>
                    ))}
                  </div>
                ))}
              </OutlineDisclosure>
            </aside>
            <div className={styles.canvas}>
              <details className={styles.settings}>
                <summary>{t("studio.surveySettings")}</summary>
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
                      onChange={(e) => {
                        const value = e.target.value;
                        action(() =>
                          patch("surveys", survey.id, {
                            settings: {
                              ...survey.settings,
                              language: value,
                            },
                          }),
                        );
                      }}
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
                      onChange={(e) => {
                        const checked = e.target.checked;
                        action(() =>
                          patch("surveys", survey.id, {
                            settings: {
                              ...survey.settings,
                              allow_multiple: checked,
                            },
                          }),
                        );
                      }}
                    />{" "}
                    {t("multiple")}
                  </label>
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={!!survey.settings?.invitation_only}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        action(() =>
                          patch("surveys", survey.id, {
                            settings: {
                              ...survey.settings,
                              invitation_only: checked,
                            },
                          }),
                        );
                      }}
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
                        onChange={(e) => {
                          const value = e.target.value;
                          action(() =>
                            patch("surveys", survey.id, {
                              [key]: value
                                ? new Date(value).toISOString()
                                : null,
                            }),
                          );
                        }}
                      />
                    </label>
                  ))}
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={!!survey.settings?.randomize_options}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        action(() =>
                          patch("surveys", survey.id, {
                            settings: {
                              ...survey.settings,
                              randomize_options: checked,
                            },
                          }),
                        );
                      }}
                    />{" "}
                    {t("randomize")}
                  </label>{" "}
                </section>
              </details>
              {!survey.sections.length && (
                <div className={styles.empty}>
                  <h2>{t("studio.startTitle")}</h2>
                  <p>{t("studio.startHint")}</p>
                  <button onClick={() => createQuestion("single_choice")}>
                    {t("studio.startChoice")}
                  </button>
                </div>
              )}
              {survey.sections.map(
                (section, si) =>
                  activeSection?.id === section.id && (
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
                            action(() =>
                              reorder("sections", survey.sections, si, -1),
                            )
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            aria-hidden="true"
                          >
                            <path d="M12 20V4M5 11l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          aria-label={t("moveDown")}
                          disabled={si === survey.sections.length - 1}
                          onClick={() =>
                            action(() =>
                              reorder("sections", survey.sections, si, 1),
                            )
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            aria-hidden="true"
                          >
                            <path d="M12 4v16M5 13l7 7 7-7" />
                          </svg>
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
                        onSave={async (title) => {
                          await patch("sections", section.id, { title });
                          setSurvey((current) =>
                            current
                              ? {
                                  ...current,
                                  sections: current.sections.map((item) =>
                                    item.id === section.id
                                      ? { ...item, title }
                                      : item,
                                  ),
                                }
                              : current,
                          );
                        }}
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
                      {section.questions.map(
                        (q, qi) =>
                          activeQuestion?.id === q.id && (
                            <article
                              key={q.id}
                              id={`question-${q.id}`}
                              className={`${styles.question} ${activeQuestion?.id === q.id ? styles.selected : ""}`}
                              onFocus={() => setSelectedQuestion(q.id)}
                            >
                              <div className="flex flex-wrap gap-3">
                                <span>
                                  {t("studio.questionNumber", {
                                    number: qi + 1,
                                    id: q.id,
                                  })}
                                </span>
                                <button
                                  aria-label={t("moveUp")}
                                  disabled={qi === 0}
                                  onClick={() =>
                                    action(() =>
                                      reorder(
                                        "questions",
                                        section.questions,
                                        qi,
                                        -1,
                                      ),
                                    )
                                  }
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    aria-hidden="true"
                                  >
                                    <path d="M12 20V4M5 11l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  aria-label={t("moveDown")}
                                  disabled={qi === section.questions.length - 1}
                                  onClick={() =>
                                    action(() =>
                                      reorder(
                                        "questions",
                                        section.questions,
                                        qi,
                                        1,
                                      ),
                                    )
                                  }
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    aria-hidden="true"
                                  >
                                    <path d="M12 4v16M5 13l7 7 7-7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    action(() =>
                                      copy(
                                        q,
                                        section.id,
                                        section.questions.length,
                                      ),
                                    )
                                  }
                                >
                                  {t("copy")}
                                </button>
                                <button
                                  className="text-red-700"
                                  onClick={() => {
                                    if (confirm(t("confirmQuestion")))
                                      action(async () => {
                                        await apiClient.delete(
                                          `${SURVEY_API}/questions/${q.id}/`,
                                        );
                                        setSelectedQuestion(undefined);
                                      });
                                  }}
                                >
                                  {t("delete")}
                                </button>
                                <label>
                                  {t("moveTo")}{" "}
                                  <select
                                    value={section.id}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      action(() =>
                                        patch("questions", q.id, {
                                          section: Number(value),
                                          order:
                                            survey.sections.find(
                                              (s) => s.id === Number(value),
                                            )?.questions.length || 0,
                                        }),
                                      );
                                    }}
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
                                label={t("studio.questionWording")}
                                value={q.question_text}
                                multiline
                                onSave={(question_text) =>
                                  questionUpdate(q, { question_text })
                                }
                              />
                              <details className={styles.richEditor}>
                                <summary>{extra("htmlTitle")}</summary>
                                <p>{extra("htmlHint")}</p>
                                <HtmlQuestionEditor
                                  question={q}
                                  save={(question_html) =>
                                    questionUpdate(q, { question_html })
                                  }
                                />
                              </details>
                              <label>
                                {t("type")}{" "}
                                <select
                                  value={q.question_type}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    action(() =>
                                      questionUpdate(q, {
                                        question_type: value,
                                        ...questionDefaults(value, t),
                                      }),
                                    );
                                  }}
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
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    action(() =>
                                      questionUpdate(q, {
                                        is_required: checked,
                                      }),
                                    );
                                  }}
                                />{" "}
                                {t("required")}
                              </label>
                              {[
                                "single_choice",
                                "multiple_choice",
                                "ranking",
                                "scale",
                              ].includes(q.question_type) && (
                                <OptionsEditor
                                  key={`${q.id}-${q.question_type}`}
                                  value={q.options || []}
                                  save={(options) =>
                                    questionUpdate(q, { options })
                                  }
                                />
                              )}
                              <section className={styles.answerPreview}>
                                <h3>{extra("answerPreview")}</h3>
                                <QuestionAnswerPreview
                                  key={`${q.id}-${q.question_type}`}
                                  question={q}
                                />
                              </section>
                              <details open className={styles.logicEditor}>
                                <summary>
                                  {q.question_type === "matrix"
                                    ? t("studio.matrixSettings")
                                    : t("logic")}
                                </summary>
                                <RuleEditor
                                  key={`${q.id}-${q.question_type}`}
                                  question={q}
                                  questions={survey.sections.flatMap(
                                    (s) => s.questions,
                                  )}
                                  save={(rules) =>
                                    questionUpdate(q, {
                                      validation_rules: rules,
                                    })
                                  }
                                />
                              </details>
                            </article>
                          ),
                      )}
                      <button
                        className="border border-dashed p-3 w-full"
                        onClick={() => createQuestion("text")}
                      >
                        {t("addQuestion")}
                      </button>
                    </section>
                  ),
              )}
              <button
                className={styles.addSection}
                onClick={() =>
                  action(async () => {
                    const section = await apiClient.post<{ id: number }>(
                      `${SURVEY_API}/sections/`,
                      {
                        survey: survey.id,
                        title: t("newSection"),
                        description: "",
                        order: survey.sections.length,
                      },
                    );
                    setSelectedSection(section.id);
                    setSelectedQuestion(undefined);
                  })
                }
              >
                {t("addSection")}
              </button>
            </div>
          </fieldset>
        )}
      </div>
    </main>
  );
}
function OptionsEditor({
  value,
  save,
}: {
  value: string[];
  save: (options: string[]) => Promise<void>;
}) {
  const { t } = useTranslation("survey");
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const draftRef = useRef(value);
  const dirty = useRef(false);
  const revision = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const saver = useRef(save);
  const sequence = useRef(Promise.resolve());
  saver.current = save;
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    sequence.current = sequence.current
      .catch(() => {})
      .then(async () => {
        if (!dirty.current) return;
        const snapshot = [...draftRef.current];
        const savingRevision = revision.current;
        setStatus("saving");
        setFailed(false);
        try {
          await saver.current(snapshot);
          if (savingRevision === revision.current) dirty.current = false;
          setStatus(dirty.current ? "unsaved" : "saved");
        } catch (error) {
          dirty.current = true;
          setFailed(true);
          setStatus(String(error));
          throw error;
        }
      });
    sequence.current.catch(() => {});
    return sequence.current;
  };
  useEffect(() => {
    if (!dirty.current) {
      draftRef.current = value;
      setDraft(value);
    }
  }, [value]);
  useEffect(() => {
    const unregister = registerSave(flush);
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      unregister();
      window.removeEventListener("beforeunload", warn);
      flush().catch(() => {});
    };
  }, []);
  const change = (next: string[], immediately = false) => {
    draftRef.current = next;
    setDraft(next);
    revision.current++;
    dirty.current = true;
    setFailed(false);
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    if (immediately) flush().catch(() => {});
    else
      timer.current = setTimeout(() => {
        flush().catch(() => {});
      }, 900);
  };
  return (
    <div className={styles.options}>
      <h3>{t("options")}</h3>
      {draft.map((option, index) => (
        <div className={styles.optionRow} key={index}>
          <label>
            {t("studio.optionNumber", { number: index + 1 })}
            <input
              value={option}
              onChange={(event) => {
                const next = [...draftRef.current];
                next[index] = event.target.value;
                change(next);
              }}
              onBlur={() => {
                flush().catch(() => {});
              }}
            />
          </label>
          <button
            disabled={draft.length <= 2}
            aria-label={t("studio.removeOption", { number: index + 1 })}
            onClick={() =>
              change(
                draftRef.current.filter((_, i) => i !== index),
                true,
              )
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          change(
            [
              ...draftRef.current,
              t("studio.optionNumber", { number: draftRef.current.length + 1 }),
            ],
            true,
          )
        }
      >
        {t("studio.addOption")}
      </button>
      <p role="status">
        {failed ? t("error", { message: status }) : status ? t(status) : ""}
      </p>
      {failed && (
        <button
          onClick={() => {
            flush().catch(() => {});
          }}
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
function TypeIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    text: "M5 6h14M5 12h14M5 18h9",
    email: "M4 6h16v12H4zM4 6l8 6 8-6",
    number: "M9 3L7 21M17 3l-2 18M4 9h17M3 15h17",
    single_choice: "M5 7h1M10 7h10M5 12h1M10 12h10M5 17h1M10 17h10",
    multiple_choice: "M3 5h5v5H3zM11 7h10M3 14h5v5H3zM11 16h10",
    boolean: "M3 12l5 5L20 5",
    rating: "M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
    scale: "M4 12h16M4 8v8M10 8v8M16 8v8M20 8v8",
    nps: "M4 17l5-5 4 3 7-10M15 5h5v5",
    matrix: "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18",
    ranking: "M4 5h2M10 5h10M4 12h2M10 12h7M4 19h2M10 19h4",
    date: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[type]} />
    </svg>
  );
}
function questionDefaults(
  type: string,
  t: (key: string, options?: any) => string,
) {
  const options = ["single_choice", "multiple_choice", "ranking"].includes(type)
    ? [1, 2, 3].map((number) => t("studio.optionNumber", { number }))
    : type === "scale"
      ? ["studio.disagree", "studio.neutral", "studio.agree"].map((key) =>
          t(key),
        )
      : [];
  const validation_rules =
    type === "rating"
      ? { min: 1, max: 5 }
      : type === "nps"
        ? { min: 0, max: 10 }
        : type === "matrix"
          ? {
              rows: [
                t("studio.rowNumber", { number: 1 }),
                t("studio.rowNumber", { number: 2 }),
              ],
              columns: [t("studio.disagree"), t("studio.agree")],
            }
          : {};
  return { options, validation_rules };
}
function conditionDefault(question?: Question) {
  return question?.question_type === "boolean"
    ? true
    : question && ["number", "rating", "nps"].includes(question.question_type)
      ? question.question_type === "rating"
        ? (question.validation_rules?.min ?? 1)
        : 0
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
  const { t: extra } = useTranslation("builderExtras");
  const [rules, setRules] = useState(question.validation_rules || {});
  const [matrixRows, setMatrixRows] = useState(
    (question.validation_rules?.rows || []).join("\n"),
  );
  const [matrixColumns, setMatrixColumns] = useState(
    (question.validation_rules?.columns || []).join("\n"),
  );
  const [status, setStatus] = useState("");
  const rulesRef = useRef(rules);
  const rulesDirty = useRef(false);
  const saveRef = useRef(save);
  saveRef.current = save;
  const sequence = useRef(Promise.resolve());
  const flush = () => {
    const snapshot = structuredClone(rulesRef.current);
    sequence.current = sequence.current
      .catch(() => {})
      .then(async () => {
        if (!rulesDirty.current) return;
        await saveRef.current(snapshot);
        if (JSON.stringify(snapshot) === JSON.stringify(rulesRef.current))
          rulesDirty.current = false;
        setStatus(t("saved"));
      });
    return sequence.current;
  };
  useEffect(() => registerSave(flush), []);
  const index = questions.findIndex((q) => q.id === question.id);
  const earlier = questions.slice(0, index);
  const later = questions.slice(index + 1);
  const bounds = ["number", "rating"].includes(question.question_type)
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
  const update = (key: string, value: any) => {
    const next = { ...rulesRef.current, [key]: value };
    rulesRef.current = next;
    rulesDirty.current = true;
    setRules(next);
    setStatus(t("unsaved"));
  };
  const eligible = earlier.filter(
    (q) => !["matrix", "ranking"].includes(q.question_type),
  );
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
      {question.question_type === "nps" && <p>{extra("npsFixed")}</p>}
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
        <h3>{extra("conditionTitle")}</h3>
        <p>
          {eligible.length ? extra("conditionHint") : extra("firstQuestion")}
        </p>
        <label className="block">
          {t("conditional")}
          <select
            className="border p-2 block w-full"
            disabled={!eligible.length}
            value={rules.display_if?.question || ""}
            onChange={(e) =>
              update(
                "display_if",
                e.target.value
                  ? {
                      question: Number(e.target.value),
                      operator:
                        earlier.find((q) => q.id === Number(e.target.value))
                          ?.question_type === "multiple_choice"
                          ? "contains"
                          : "equals",
                      value: conditionDefault(
                        earlier.find((q) => q.id === Number(e.target.value)),
                      ),
                    }
                  : undefined,
              )
            }
          >
            <option value="">{t("always")}</option>
            {eligible.map((q) => (
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
                  ...(source?.question_type === "multiple_choice"
                    ? [["contains", t("contains")]]
                    : [
                        ["equals", t("equals")],
                        ["not_equals", t("notEquals")],
                      ]),
                  ...(["text", "email"].includes(source?.question_type || "")
                    ? [["contains", t("contains")]]
                    : []),
                  ...(numeric
                    ? [
                        ["greater_than", t("greater")],
                        ["less_than", t("less")],
                      ]
                    : []),
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
              ) : source &&
                (source.options?.length ||
                  ["nps", "rating"].includes(source.question_type)) ? (
                <label className="block">
                  {t("value")}
                  <select
                    value={String(rules.display_if.value ?? "")}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      update("display_if", {
                        ...rules.display_if,
                        value: numeric ? Number(value) : value,
                      });
                    }}
                  >
                    {(source.question_type === "nps"
                      ? Array.from({ length: 11 }, (_, i) => i)
                      : source.question_type === "rating"
                        ? Array.from(
                            {
                              length: Math.min(
                                101,
                                Math.max(
                                  1,
                                  (source.validation_rules?.max ?? 5) -
                                    (source.validation_rules?.min ?? 1) +
                                    1,
                                ),
                              ),
                            },
                            (_, i) => i + (source.validation_rules?.min ?? 1),
                          )
                        : source.options
                    ).map((v) => (
                      <option key={String(v)} value={String(v)}>
                        {String(v)}
                      </option>
                    ))}
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
      ) &&
        (later.length ? (
          <details className="border p-3 rounded space-y-2">
            <summary className="font-semibold">{t("branch")}</summary>
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
          </details>
        ) : (
          <p className={styles.branchHint}>{extra("laterQuestionNeeded")}</p>
        ))}
      <button
        className="border p-2 rounded"
        onClick={async () => {
          try {
            await flush();
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

function HtmlQuestionEditor({
  question,
  save,
}: {
  question: Question;
  save: (html: string) => Promise<void>;
}) {
  const { t } = useTranslation("builderExtras");
  const [version, setVersion] = useState(0);
  const [preset, setPreset] = useState<string>();
  const [error, setError] = useState("");
  const current = useRef(question);
  current.current = question;
  const apply = async (tag: string) => {
    await savePendingFields();
    const savedQuestion = await apiClient.get<Question>(
      `${SURVEY_API}/questions/${question.id}/`,
    );
    const escaped = savedQuestion.question_text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const html = `<${tag}>${savedQuestion.question_html || escaped}</${tag}>`;
    await save(html);
    setPreset(html);
    setVersion((v) => v + 1);
  };
  return (
    <div>
      <div className={styles.formatButtons}>
        {["strong", "em", "h3", "p"].map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => {
              setError("");
              apply(tag).catch((e) => setError(String(e)));
            }}
          >
            {t(`format_${tag}`)}
          </button>
        ))}
      </div>
      <AutoField
        key={`${question.id}-${version}`}
        label={t("htmlSource")}
        multiline
        value={question.question_html ?? preset ?? ""}
        onSave={save}
      />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

function OutlineDisclosure({
  activeId,
  label,
  count,
  children,
}: {
  activeId?: number;
  label: string;
  count: number;
  children: ReactNode;
}) {
  const { t } = useTranslation("builderExtras");
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 650px)");
    const apply = () => setOpen(!media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  useEffect(() => {
    if (window.matchMedia("(max-width: 650px)").matches) setOpen(false);
  }, [activeId]);
  return (
    <details
      className={styles.outlineDisclosure}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <span>{label}</span>
        <small>{t("outlineCount", { count })}</small>
      </summary>
      {children}
    </details>
  );
}
