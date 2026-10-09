import { useEffect, useRef, useState } from "react";
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
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const sequence = useRef(Promise.resolve());
  const pending = useRef<string | null>(null);
  const saver = useRef(onSave);
  saver.current = onSave;
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    const next = pending.current;
    if (next === null) return;
    pending.current = null;
    setStatus("در حال ذخیره…");
    sequence.current = sequence.current
      .catch(() => {})
      .then(() => saver.current(next))
      .then(() =>
        setStatus(pending.current === null ? "ذخیره شد" : "ذخیره نشده"),
      )
      .catch((e) => {
        pending.current = next;
        setStatus(`خطا: ${String(e)}`);
      });
  };
  useEffect(() => {
    if (pending.current === null) setDraft(value);
  }, [value]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pending.current !== null) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      flush();
    };
  }, []);
  const change = (v: string) => {
    setDraft(v);
    pending.current = v;
    setStatus("ذخیره نشده");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 900);
  };
  const props = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      change(e.target.value),
    onBlur: flush,
    disabled,
    className: "block border p-2 rounded w-full",
  };
  return (
    <label className="block">
      {label}
      {multiline ? <textarea {...props} /> : <input {...props} />}
      <span role="status" className="text-xs text-gray-600">
        {status}
      </span>
      {status.startsWith("خطا:") && (
        <button type="button" className="border p-1" onClick={flush}>
          تلاش مجدد
        </button>
      )}
    </label>
  );
}
