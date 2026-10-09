import { useLocale } from "../../i18n/LocaleProvider";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient, SURVEY_API } from "../../services/api";
import { Survey } from "../../types/survey";
import { SurveyRunner } from "../../components/SurveyRunner";
export default function PublicSurvey() {
  const { t } = useTranslation("survey");
  const { direction } = useLocale();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey>();
  const [error, setError] = useState("");
  const token =
    typeof router.query.token === "string" ? router.query.token : undefined;
  useEffect(() => {
    if (!router.isReady) return;
    let live = true;
    apiClient
      .request<Survey>(
        `${SURVEY_API}/public/surveys/${router.query.id}/${token ? `?token=${encodeURIComponent(token)}` : ""}`,
        "GET",
        undefined,
        true,
      )
      .then((data) => {
        if (live) setSurvey(data);
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [router.isReady, router.query.id, token]);
  return (
    <main dir={direction} className="min-h-screen bg-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        {survey ? (
          <SurveyRunner
            key={`${survey.id}:${token || ""}`}
            survey={survey}
            token={token}
          />
        ) : (
          <p dir={direction} role="status" className="bg-white p-6 rounded">
            {error || t("loadingSurvey")}
          </p>
        )}
      </div>
    </main>
  );
}
