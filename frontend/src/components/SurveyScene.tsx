import { useTranslation } from "react-i18next";
import { CSSProperties, useEffect, useState } from "react";
export default function SurveyScene({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { t } = useTranslation("scene");
  const choices = t("scene.choices", { returnObjects: true }) as string[];
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div
      className={`pn-scene ${compact ? "pn-scene-compact" : ""} ${paused ? "is-paused" : "is-playing"}`}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className="pn-scene-stage"
        style={
          {
            "--tilt-x": `${tilt.x * 9}deg`,
            "--tilt-y": `${-tilt.y * 7}deg`,
          } as CSSProperties
        }
      >
        <div className="pn-sheet pn-sheet-back" aria-hidden="true">
          <span>{t("scene.insights")}</span>
          <div className="pn-demo-bars">
            {[35, 65, 48, 86, 72].map((height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="pn-sheet pn-sheet-middle" aria-hidden="true">
          <span>{t("scene.path")}</span>
          <div className="pn-branch">
            <i />
            <i />
            <i />
          </div>
        </div>
        <section
          className="pn-sheet pn-sheet-front"
          aria-label={t("scene.aria")}
        >
          <div className="pn-demo-top">
            <span>{t("scene.preview")}</span>
            <span>{t("scene.step")}</span>
          </div>
          <div className="pn-demo-progress">
            <i />
          </div>
          <h3>
            {t("scene.title")}
            <br />
            {t("scene.titleAccent")}
          </h3>
          <p>{t("scene.question")}</p>
          <div className="pn-demo-choices">
            {choices.map((label, i) => (
              <button
                key={label}
                onClick={() => setAnswer(i)}
                aria-pressed={answer === i}
                className={answer === i ? "is-selected" : ""}
              >
                <span className="pn-choice-circle" />
                {label}
              </button>
            ))}
          </div>
          <div className="pn-demo-bottom">
            <span aria-live="polite">
              {answer === null
                ? t("scene.try")
                : t("scene.selected", { answer: choices[answer] })}
            </span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M18 12H6m6-6-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </section>
        <div className="pn-orbit" aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
      </div>
      <div className="pn-scene-controls">
        <p className="pn-scene-caption">{t("scene.caption")}</p>
        <button
          type="button"
          className="pn-motion-toggle"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? t("scene.play") : t("scene.pause")}
        </button>
      </div>
    </div>
  );
}
