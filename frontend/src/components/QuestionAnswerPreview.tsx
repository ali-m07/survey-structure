import { useEffect, useState } from "react";
import { Question } from "../types/survey";
import QuestionContent from "./QuestionContent";
import { QuestionAnswerInput } from "./SurveyRunner";

export default function QuestionAnswerPreview({
  question,
}: {
  question: Question;
}) {
  const [value, setValue] = useState<any>();
  useEffect(() => setValue(undefined), [question.id, question.question_type]);
  return (
    <div className="space-y-4" data-question-preview={question.question_type}>
      <div id={`label-preview-${question.id}`} className="font-semibold">
        <QuestionContent
          text={question.question_text}
          html={question.question_html}
        />
        {question.is_required && <span className="text-red-700"> *</span>}
      </div>
      <QuestionAnswerInput
        q={question}
        value={value}
        onChange={setValue}
        inputId={`preview-${question.id}`}
      />
    </div>
  );
}
