import { CSSProperties, useState } from "react";
export default function SurveyScene({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [answer, setAnswer] = useState<number | null>(null);
  return (
    <div
      className={`pn-scene ${compact ? "pn-scene-compact" : ""}`}
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
          <span>از پاسخ به بینش</span>
          <div className="pn-demo-bars">
            {[35, 65, 48, 86, 72].map((height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="pn-sheet pn-sheet-middle" aria-hidden="true">
          <span>یک مسیر، چند انتخاب</span>
          <div className="pn-branch">
            <i />
            <i />
            <i />
          </div>
        </div>
        <section
          className="pn-sheet pn-sheet-front"
          aria-label="پیش‌نمایش تعاملی پرسشنامه"
        >
          <div className="pn-demo-top">
            <span>پیش‌نمایش تعاملی</span>
            <span>۱ / ۳</span>
          </div>
          <div className="pn-demo-progress">
            <i />
          </div>
          <h3>
            صدای شما،
            <br />
            شروع یک تغییر.
          </h3>
          <p>تجربهٔ امروزتان چطور بود؟</p>
          <div className="pn-demo-choices">
            {["معمولی", "خوب", "عالی"].map((label, i) => (
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
                ? "یک گزینه را امتحان کنید"
                : `انتخاب شما: ${["معمولی", "خوب", "عالی"][answer]}`}
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
      <p className="pn-scene-caption">نمونهٔ نمایشی · پاسخ شما ذخیره نمی‌شود</p>
    </div>
  );
}
