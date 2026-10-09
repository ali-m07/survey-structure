import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient, SURVEY_API } from "../services/api";
import { savePendingFields } from "../services/autosave";
import { Survey, QUESTION_TYPES } from "../types/survey";
import styles from "./BulkQuestionImporter.module.css";
export default function BulkQuestionImporter({
  surveyId,
  sectionId,
  disabled,
  onApplied,
}: {
  surveyId: number;
  sectionId?: number;
  disabled?: boolean;
  onApplied: (survey: Survey) => void;
}) {
  const { t } = useTranslation("builderExtras");
  const { t: typeLabel } = useTranslation("survey");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const parsed = useMemo(() => {
    try {
      if (!input.trim()) return { questions: [], error: "" };
      let questions: any[];
      if (input.trim().startsWith("[")) {
        const value = JSON.parse(input);
        if (!Array.isArray(value)) throw Error(t("jsonArray"));
        questions = value;
      } else
        questions = input
          .split(/\r?\n/)
          .map((v) =>
            v.trim().replace(/^(?:[-*•]\s+|[0-9۰-۹٠-٩]+[.)،:]\s*)/, ""),
          )
          .filter(Boolean)
          .map((question_text) => ({
            question_text,
            question_type: "text",
            is_required: false,
            options: [],
            validation_rules: {},
          }));
      if (questions.length < 1 || questions.length > 100)
        throw Error(t("limit"));
      const types = new Set(QUESTION_TYPES.map(([type]) => type));
      questions = questions.map((q, index) => {
        if (
          !q ||
          typeof q !== "object" ||
          typeof q.question_text !== "string" ||
          !q.question_text.trim()
        )
          throw Error(t("invalidQuestion", { number: index + 1 }));
        const question_type = q.question_type || "text";
        if (!types.has(question_type))
          throw Error(t("invalidType", { number: index + 1 }));
        return { ...q, question_text: q.question_text.trim(), question_type };
      });
      return { questions, error: "" };
    } catch (e) {
      return {
        questions: [],
        error: String(e instanceof Error ? e.message : e),
      };
    }
  }, [input, t]);
  const apply = async () => {
    setBusy(true);
    setError("");
    try {
      await savePendingFields();
      const survey = await apiClient.post<Survey>(
        `${SURVEY_API}/surveys/${surveyId}/bulk-questions/`,
        {
          ...(sectionId ? { section: sectionId } : {}),
          questions: parsed.questions,
        },
      );
      onApplied(survey);
      setInput("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className={styles.importer}>
      <summary>{t("bulkTitle")}</summary>
      <p>{t("bulkHint")}</p>
      <label>
        {t("pasteLabel")}
        <textarea
          disabled={disabled || busy}
          rows={7}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("pasteExample")}
        />
      </label>
      <details>
        <summary>{t("jsonHelp")}</summary>
        <pre>
          {JSON.stringify(
            [
              {
                question_text: t("sampleNps"),
                question_type: "nps",
                is_required: true,
                validation_rules: { min: 0, max: 10 },
              },
              {
                question_text: t("sampleChoice"),
                question_type: "single_choice",
                options: [t("optionOne"), t("optionTwo")],
              },
            ],
            null,
            2,
          )}
        </pre>
      </details>
      {parsed.error && <p role="alert">{parsed.error}</p>}
      {error && <p role="alert">{error}</p>}
      {!!parsed.questions.length && (
        <div className={styles.review}>
          <h3>{t("reviewCount", { count: parsed.questions.length })}</h3>
          <ol>
            {parsed.questions.map((q, i) => (
              <li key={i}>
                <span>{q.question_text}</span>
                <small>{typeLabel(`type_${q.question_type}`)}</small>
              </li>
            ))}
          </ol>
        </div>
      )}
      <button
        type="button"
        disabled={
          disabled || busy || !parsed.questions.length || !!parsed.error
        }
        onClick={apply}
      >
        {busy
          ? t("importing")
          : t("applyCount", { count: parsed.questions.length })}
      </button>
    </details>
  );
}
