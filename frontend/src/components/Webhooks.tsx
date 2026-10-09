import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { apiClient, SURVEY_API } from "../services/api";
export function Webhooks({ surveyId }: { surveyId: number }) {
  const { t } = useTranslation("survey");
  const [hooks, setHooks] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setHooks(
        await apiClient.get(`${SURVEY_API}/surveys/${surveyId}/webhooks/`),
      );
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    load();
  }, [surveyId]);
  return (
    <section className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">{t("hookTitle")}</h2>
      <p>{t("hookIntro")}</p>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {secret && (
        <p className="bg-yellow-50 p-3 break-all">
          {t("hookSecret")} <bdi>{secret}</bdi>
        </p>
      )}
      <form
        className="flex flex-wrap gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          try {
            const hook = await apiClient.post<any>(
              `${SURVEY_API}/surveys/${surveyId}/webhooks/`,
              { url: form.get("url") },
            );
            setSecret(hook.secret);
            load();
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        <label className="grow">
          {t("hookUrl")}
          <input
            name="url"
            type="url"
            required
            placeholder="https://"
            className="border p-2 block w-full"
          />
        </label>
        <button className="border p-2">{t("hookCreate")}</button>
      </form>
      {!hooks.length && <p className="text-gray-600">{t("noHooks")}</p>}
      {hooks.map((hook) => (
        <article key={hook.id} className="border p-3 rounded space-y-2">
          <p className="break-all">{hook.url}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                try {
                  setDeliveries(
                    await apiClient.get(`${SURVEY_API}/webhooks/${hook.id}/`),
                  );
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              {t("hookDelivery")}
            </button>
            <button
              onClick={async () => {
                try {
                  await apiClient.post(
                    `${SURVEY_API}/webhooks/${hook.id}/`,
                    {},
                  );
                  setDeliveries(
                    await apiClient.get(`${SURVEY_API}/webhooks/${hook.id}/`),
                  );
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              {t("hookRetry")}
            </button>
            <button
              className="text-red-700"
              onClick={async () => {
                if (!confirm(t("hookDelete"))) return;
                try {
                  await apiClient.delete(`${SURVEY_API}/webhooks/${hook.id}/`);
                  load();
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              {t("delete")}
            </button>
          </div>
        </article>
      ))}
      {deliveries.map((d) => (
        <p key={d.id}>
          {t("hookEvent", {
            id: d.id,
            status: t(`delivery_${d.status}`, { defaultValue: d.status }),
            attempts: d.attempts,
          })}{" "}
          {d.error || ""}
        </p>
      ))}
    </section>
  );
}
