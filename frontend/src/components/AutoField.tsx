import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { registerSave } from "../services/autosave";
export function AutoField({
  value,
  onSave,
  label,
  multiline = false,
  disabled = false,
}: {
  value: string;
  onSave: (v: string) => Promise<void>;
  label: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation("survey");
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const sequence = useRef(Promise.resolve());
  const pending = useRef<string | null>(null);
  const inFlight = useRef(0);
  const saver = useRef(onSave);
  saver.current = onSave;
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    const next = pending.current;
    if (next === null) return sequence.current;
    pending.current = null;
    inFlight.current++;
    setFailed(false);
    setStatus("saving");
    sequence.current = sequence.current
      .catch(() => {})
      .then(() => saver.current(next))
      .then(() => setStatus(pending.current === null ? "saved" : "unsaved"))
      .catch((e) => {
        if (pending.current === null) pending.current = next;
        setFailed(true);
        setStatus(String(e));
        throw e;
      })
      .finally(() => {
        inFlight.current--;
      });
    sequence.current.catch(() => {});
    return sequence.current;
  };
  useEffect(() => {
    if (pending.current === null && !inFlight.current) setDraft(value);
  }, [value]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pending.current !== null || inFlight.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    const unregister = registerSave(flush);
    return () => {
      unregister();
      window.removeEventListener("beforeunload", warn);
      flush().catch(() => {});
    };
  }, []);
  const change = (v: string) => {
    setDraft(v);
    pending.current = v;
    setFailed(false);
    setStatus("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      flush().catch(() => {});
    }, 900);
  };
  const props = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      change(e.target.value),
    onBlur: () => {
      flush().catch(() => {});
    },
    disabled,
    className: "block border p-2 rounded w-full",
  };
  return (
    <label className="block">
      {label}
      {multiline ? <textarea {...props} /> : <input {...props} />}
      <span role="status" className="text-xs text-gray-600">
        {failed ? t("error", { message: status }) : status ? t(status) : ""}
      </span>
      {failed && (
        <button
          type="button"
          className="border p-1"
          onClick={() => {
            flush().catch(() => {});
          }}
        >
          {t("retry")}
        </button>
      )}
    </label>
  );
}
