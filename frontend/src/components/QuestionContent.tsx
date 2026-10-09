import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import styles from "./QuestionContent.module.css";

/** Rich content is restricted to text formatting; respondent values remain text. */
export default function QuestionContent({
  text,
  html,
  answers = {},
}: {
  text: string;
  html?: string;
  answers?: Record<string, unknown>;
}) {
  const [safe, setSafe] = useState<{ source: string; html: string } | null>(
    null,
  );
  useEffect(() => {
    if (!html) {
      setSafe(null);
      return;
    }
    const cleaned = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "span",
        "h2",
        "h3",
        "h4",
        "ul",
        "ol",
        "li",
        "blockquote",
        "div",
        "sub",
        "sup",
        "a",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: [
        "style",
        "dir",
        "href",
        "title",
        "colspan",
        "rowspan",
        "scope",
      ],
      ALLOWED_URI_REGEXP: /^(?:https?:|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    });
    const wrapper = document.createElement("div");
    wrapper.innerHTML = cleaned;
    wrapper.querySelectorAll("[style]").forEach((element) => {
      const declaration = (element as HTMLElement).style;
      const accepted: string[] = [];
      for (const property of Array.from(declaration)) {
        const value = declaration.getPropertyValue(property).trim();
        if (
          (property === "color" || property === "background-color") &&
          /^(#[\da-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i.test(value)
        )
          accepted.push(`${property}:${value}`);
        if (
          property === "text-align" &&
          /^(start|end|left|right|center)$/.test(value)
        )
          accepted.push(`${property}:${value}`);
        if (property === "font-weight" && /^(normal|bold|[1-9]00)$/.test(value))
          accepted.push(`${property}:${value}`);
        if (property === "font-style" && /^(normal|italic)$/.test(value))
          accepted.push(`${property}:${value}`);
        if (
          property === "text-decoration" &&
          /^(none|underline|line-through)$/.test(value)
        )
          accepted.push(`${property}:${value}`);
      }
      const length = (item: string, maximum: number) => {
        const match = /^(\d+(?:\.\d+)?)(px|em|rem|%)$/.exec(item);
        if (!match) return false;
        const limit =
          match[2] === "%"
            ? maximum * 6.25
            : match[2] === "px"
              ? maximum
              : maximum / 16;
        return Number(match[1]) <= limit;
      };
      const size = declaration.getPropertyValue("font-size").trim();
      if (length(size, 64)) accepted.push(`font-size:${size}`);
      const leading = declaration.getPropertyValue("line-height").trim();
      if (
        (/^\d+(?:\.\d+)?$/.test(leading) &&
          Number(leading) >= 1 &&
          Number(leading) <= 3) ||
        length(leading, 96)
      )
        accepted.push(`line-height:${leading}`);
      for (const property of ["padding", "margin", "border-width"]) {
        const value = declaration.getPropertyValue(property).trim();
        const values = value.split(/\s+/);
        if (
          value &&
          values.length <= 4 &&
          values.every(
            (item) =>
              item === "0" ||
              length(item, property === "border-width" ? 4 : 32),
          )
        )
          accepted.push(`${property}:${value}`);
      }
      const borderColor = declaration.getPropertyValue("border-color").trim();
      if (/^(#[\da-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i.test(borderColor))
        accepted.push(`border-color:${borderColor}`);
      const borderStyle = declaration.getPropertyValue("border-style").trim();
      if (/^(none|solid|dashed|dotted|double)$/.test(borderStyle))
        accepted.push(`border-style:${borderStyle}`);
      element.removeAttribute("style");
      if (accepted.length) element.setAttribute("style", accepted.join(";"));
    });
    wrapper.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !/^(https?:\/\/|\/|#|\?|\.\.?\/)/i.test(href))
        link.removeAttribute("href");
      link.setAttribute("rel", "noopener noreferrer");
    });
    setSafe({ source: html, html: wrapper.innerHTML });
  }, [html]);
  const pipe = (source: string) =>
    source.replace(/\{\{(\d+)\}\}/g, (_, id) => {
      const value = answers[id];
      return Array.isArray(value)
        ? value.join(", ")
        : typeof value === "object"
          ? ""
          : String(value ?? "");
    });
  // Pipe into DOM text nodes, never interpolate answers as HTML.
  let rendered = safe && safe.source === html ? safe.html : null;
  if (rendered !== null && typeof document !== "undefined") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = rendered;
    const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_TEXT);
    while (walker.nextNode())
      walker.currentNode.textContent = pipe(
        walker.currentNode.textContent || "",
      );
    rendered = wrapper.innerHTML;
  }
  return rendered !== null ? (
    <div
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  ) : (
    <div className={styles.content}>{pipe(text)}</div>
  );
}
