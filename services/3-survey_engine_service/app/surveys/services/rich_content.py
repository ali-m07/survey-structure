"""Server-side allowlist for authored question content.

Plain question_text remains the accessible label and export source. Images,
embedded documents, scripts and event handlers are deliberately unsupported.
"""
import bleach
from bleach.css_sanitizer import CSSSanitizer
from rest_framework.exceptions import ValidationError

TAGS = {"p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "span", "div", "blockquote", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td", "hr", "code", "pre", "sub", "sup"}
CSS_PROPERTIES = {"color", "background-color", "font-size", "font-weight", "font-style", "text-align", "text-decoration", "line-height", "border-color", "border-width", "border-style", "padding", "margin"}

def sanitize_question_html(value):
    if not isinstance(value, str):
        raise ValidationError({"question_html": "HTML content must be text."})
    if len(value) > 50000:
        raise ValidationError({"question_html": "HTML content must not exceed 50,000 characters."})
    return bleach.clean(value, tags=TAGS, attributes={"*": ["style", "dir"], "a": ["href", "title"], "td": ["colspan", "rowspan"], "th": ["colspan", "rowspan", "scope"]}, protocols={"http", "https"}, css_sanitizer=CSSSanitizer(allowed_css_properties=CSS_PROPERTIES), strip=True, strip_comments=True)


def remap_question_piping(value, identifiers):
    import re
    return re.sub(r"\{\{(\d+)\}\}", lambda match: "{{" + str(identifiers.get(int(match.group(1)), int(match.group(1)))) + "}}", value)
