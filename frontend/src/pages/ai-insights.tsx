import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/LocaleProvider";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function AIInsights() {
  const { t } = useTranslation("app");
  const { locale, direction } = useLocale();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const response = await fetch(
        `http://localhost:8004/api/v1/models/chat?prompt=${encodeURIComponent(prompt)}&model=gemma3`,
      );

      if (response.ok) {
        const data = await response.json();
        setResponse(data.response || data.message || t("ai.noResponse"));
      } else {
        setResponse(t("ai.unavailable"));
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse(t("ai.unavailable"));
    } finally {
      setLoading(false);
    }
  };

  const handleSentimentAnalysis = async () => {
    setLoading(true);
    setResponse("");

    const sampleText = prompt || t("ai.sample");

    try {
      const response = await fetch(
        "http://localhost:8004/api/v1/sentiment/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: sampleText,
            language: locale,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setResponse(
          t("ai.result", {
            sentiment: data.sentiment,
            score: data.score,
            emotions: JSON.stringify(data.emotions, null, 2),
          }),
        );
      } else {
        setResponse(t("ai.unavailable"));
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse(t("ai.unavailable"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={direction}
      lang={locale}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <Head>
        <title>{t("ai.title")}</title>
        <meta name="description" content={t("ai.description")} />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              {t("brand")}
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                {t("nav.home")}
              </Link>
              <Link
                href="/surveys"
                className="text-gray-700 hover:text-blue-600"
              >
                {t("nav.surveys")}
              </Link>
              <Link
                href="/analytics"
                className="text-gray-700 hover:text-blue-600"
              >
                {t("nav.analytics")}
              </Link>
              <Link href="/ai-insights" className="text-blue-600 font-semibold">
                {t("ai.title")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("ai.title")}
          </h1>
          <p className="text-gray-600">{t("ai.description")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("ai.chatTitle")}
            </h2>
            <form onSubmit={handleChat} className="mb-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("ai.prompt")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                rows={4}
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? t("ai.processing") : t("ai.send")}
                </button>
                <button
                  type="button"
                  onClick={handleSentimentAnalysis}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {t("ai.analyze")}
                </button>
              </div>
            </form>
          </div>

          {/* Response Area */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("ai.response")}
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : response ? (
                <pre className="whitespace-pre-wrap text-gray-800">
                  {response}
                </pre>
              ) : (
                <p className="text-gray-500">{t("ai.empty")}</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {t("ai.features")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("ai.chat")}
              </h3>
              <p className="text-gray-600">{t("ai.chatDetail")}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("ai.sentiment")}
              </h3>
              <p className="text-gray-600">{t("ai.sentimentDetail")}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("ai.predictive")}
              </h3>
              <p className="text-gray-600">{t("ai.predictiveDetail")}</p>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{t("ai.note")}</p>
        </div>
      </main>
    </div>
  );
}
