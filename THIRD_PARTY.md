# Open-source references and dependencies

## Survey authoring patterns

The NPS scale and explicit source/operator/value condition controls were informed by the [SurveyJS Form Library NPS example](https://surveyjs.io/form-library/examples/nps-question/documentation) and its [conditional logic documentation](https://github.com/surveyjs/survey-library/blob/master/docs/design-survey-conditional-logic.md). The existing React renderer and Django survey schema remain the application's implementation. SurveyJS Form Library is MIT licensed; its separate products have their own terms.

## Authored HTML

[DOMPurify](https://github.com/cure53/DOMPurify) is included as a frontend dependency to sanitize question HTML before preview and respondent rendering. Its license is Apache-2.0 or MPL-2.0. [Bleach](https://github.com/mozilla/bleach), with its CSS sanitizer, cleans HTML before database persistence. Its package license is Apache-2.0. Package distributions retain their bundled license notices.

The application permits formatting tags, lists, tables, links and limited inline styles. Browser rendering bounds presentation values and disallows executable content, event handlers and embedded resources. Plain question wording is retained for accessible fallback and exports. Response piping inserts answer values as text nodes.

## Bulk authoring

A numbered plain-text list becomes one text question per nonempty line. Typed JSON can specify the application's twelve question types, options, validation rules and optional question HTML. Authors review the parsed list before applying it. The Django endpoint appends between one and one hundred questions in a single transaction, validates the complete draft and retains existing questions.