---
name: Porsnama
description: Multilingual survey tools presented as a dimensional research desk
colors:
  plum: "#663877"
  ink: "#322138"
  muted: "#6e5a70"
  paper: "#faf7f2"
  lavender-stage: "#e9deef"
  lavender-sheet: "#bc9dcc"
  action: "#43264f"
  action-hover: "#684079"
  heading-accent: "#825299"
  divider: "#ded3df"
  white: "#ffffff"
  field: "#fffdfa"
  focus: "#9159aa"
  workspace-paper: "#faf7f1"
  workspace-ink: "#432839"
  workspace-muted: "#756570"
  workspace-divider: "#ded3d7"
  workspace-border: "#e2d8db"
  builder-paper: "#f5f1eb"
  builder-muted: "#766477"
  builder-border: "#d9cbdc"
  builder-action: "#70417e"
  builder-selection: "#eee2f0"
typography:
  display:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "clamp(2.75rem, 5.1vw, 5.2rem)"
    fontWeight: 700
    lineHeight: 1.42
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "clamp(2rem, 3.1vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  display-ltr:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "clamp(2.7rem, 4.2vw, 4.7rem)"
    fontWeight: 700
    lineHeight: 1.17
    letterSpacing: "-0.025em"
  headline-ltr:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "clamp(1.85rem, 2.8vw, 3.1rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.85
rounded:
  field: "8px"
  action: "10px"
  sheet: "14px"
  container: "16px"
  workspace-card: "24px"
spacing:
  compact: "12px"
  control: "16px"
  gutter: "24px"
  sheet: "25px"
  tablet: "30px"
  desktop: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: "15px 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-small:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: "10px 19px"
  builder-type:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.field}"
    padding: "10px 8px"
    height: "48px"
  builder-question:
    backgroundColor: "{colors.white}"
    rounded: "12px"
    padding: "24px"
  field:
    backgroundColor: "{colors.field}"
    rounded: "{rounded.field}"
    padding: "13px 15px"
  workspace-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.workspace-ink}"
    rounded: "{rounded.workspace-card}"
    padding: "28px"
---

# Design System: Porsnama

## Overview

**Creative North Star: "The Dimensional Research Desk"**

Cream paper, plum typography and layered lavender questionnaire sheets give survey work a tangible desk-like presence. The public surfaces combine generous editorial headings with working survey previews. Depth belongs to product geometry; copy, navigation and forms stay readable and direct.

The authenticated workspace inherits warm paper and Vazirmatn but uses a slightly warmer plum palette, white outlined cards and flatter operational density. This is an observed variation, not a second invented identity. Evidence: `frontend/src/styles/globals.css`, `components/PublicSite.tsx`, `components/SurveyScene.tsx` and `pages/workspace.tsx`; direction context: `.impeccable/direction.md`. This record covers localized public pages, login, workspace, and the shared operational treatment of survey/report lists. The survey builder applies this identity in Operate mode: a persistent type toolbox and outline support one focused question editor. Evidence also includes `frontend/src/pages/surveys/[id]/edit.tsx`, `frontend/src/styles/Builder.module.css`, `frontend/src/components/GoalSurveyComposer.tsx` and its module stylesheet; surface scope is `.impeccable/surfaces/survey-builder.md`. The shared respondent controls, rich question renderer and bulk importer are also recorded from `frontend/src/components/SurveyRunner.tsx`, `QuestionAnswerPreview.tsx`, `QuestionContent.tsx`, `QuestionContent.module.css`, `BulkQuestionImporter.tsx` and its module stylesheet. Other legacy tools retain local component variations.

**Key Characteristics:**

- Persian RTL and English/French LTR with localized interface copy.
- Cream and plum with lavender product depth.
- Spacious paired sections and mobile stacking.
- Continuously animated, interactive and explicitly labeled demonstration sheets.
- Flat operational cards with visible keyboard focus.
- A visible SVG type toolbox, selected outline and focused question editor.

## Colors

The palette uses one plum family against warm paper; lavender establishes depth and emphasis without requiring a separate competing accent.

### Primary

- **Plum:** brand symbol, text links and selected sample answers.
- **Deep Action Plum / Hover Plum:** filled calls to action and their hover response.
- **Heading Plum:** selected words in large headings and active navigation.
- **Focus Plum:** public surface keyboard outlines.

### Neutral

- **Cream Paper:** continuous public canvas.
- **Plum Ink / Muted Plum:** heading and paragraph hierarchy.
- **Lavender Stage / Lavender Sheet:** repeated preview backdrop and middle sheet.
- **Divider:** quiet section and list boundaries.
- **White / Field Cream:** reversed text, operational cards and login fields.
- **Workspace Paper, Ink, Muted, Divider and Border:** the shipped workspace's warmer operational variation.
- **Builder Paper, Muted, Border, Action and Selection:** cream canvas, readable supporting text, thin field boundaries, plum creation actions and lavender outline selection. The composer retains a local cream/plum variation.

### Named Rules

**The Plum Hierarchy Rule.** Use dark plum for text and actions, medium plum for emphasis, and pale lavender for supporting surfaces.

## Typography

**Display Font:** self-hosted Vazirmatn, with Tahoma and sans-serif fallbacks.
**Body Font:** the same family; regular and bold WOFF2 files are supplied locally.

**Character:** a single self-hosted family across three locales supports both editorial persuasion and operational controls. Balanced bold headings gain scale and tighter spacing while body copy retains generous leading.

### Hierarchy

- **Display:** the fluid RTL and LTR frontmatter roles drive public hero headings; mobile public headings become (43px) in Persian and (37px) in English/French, with LTR leading (1.2). About uses its own fluid headline. Login uses (36px), reducing to (32px).
- **Headline:** the fluid RTL and LTR section-heading roles reduce to (29px) and (28px) respectively on mobile. Contextual FAQ and closing-section overrides exist.
- **Title:** repeated content headings use (20–24px), bold with the shared heading leading; sample-sheet title uses (26px).
- **Body:** public text commonly uses (14–17px); long introduction paragraphs use leading (2–2.2). FAQ and about text limit length to (65ch).
- **Label:** navigation uses (14px); form labels use (13px); supporting notes use (11–12px). Smaller sheet metadata is local preview detail, not a global text minimum.

Builder headings use (28px), reducing to (23px) on mobile; toolbox headings use (17px), helper and editor metadata (13px), and type labels (12px), reducing to (11px) on mobile. These compact labels accompany distinct SVG icons; they are operational roles rather than display typography.

### Named Rules

**The Shared Voice Rule.** Keep Vazirmatn throughout public, login and workspace surfaces; adapt heading size and leading to the locale while expressing hierarchy with scale and weight.

## Layout

Public header and hero use a centered maximum width (1340px) with desktop side padding (48px). Most body sections use a centered content width (1244px), paired columns, gaps (80–100px) and vertical intervals (90–110px). Divided lists and open editorial columns provide structure without wrapping every paragraph in a card.

At (1100px), side gutters reduce to (30px), paired-section gaps contract and the preview scales down. At (760px), sections stack with side gutters (24px), section margins (65px), and typically (30px) between their contents; navigation expands into a full-width single-column list via the menu control; the language selector stays visible. The hero remains copy followed by a compact preview. The login split becomes one column. At (1500px), the hero and preview gain room.

At (761–1180px), public header spacing contracts for translated strings, with French navigation using a tighter gap. Logical margins position the account action and language selector in either direction. Login remains split above mobile and stacks below it; its mobile visual section reserves (700px) for the scene and readable controls.

Workspace uses a maximum width (1152px), mobile horizontal padding (20px), desktop padding (48px), and a two-column destination grid at Tailwind's `md` breakpoint (768px). Destination padding grows from (28px) to (36px). The shared operational layer uses warm paper, a container cap (1244px), wrapping navigation, minimum field height (44px) and mobile inline padding (20px). Survey/report cards use a two-column grid at (768px), a (12px) radius and (24px) padding.

Builder uses a centered cap (1440px), outer padding and column gap (24px), a sticky (280px) toolbox and a flexible editor. The twelve type buttons form two columns, while the outline uses wrapping text and logical indentation. At (900px), the toolbox narrows to (220px) and types use one column. At (650px), outer and editor padding become (16px), the layout stacks, the toolbox becomes static and types form three columns with centered icon-above-label content. At mobile widths, the question outline is a native disclosure, initially closed after viewport detection. Its summary shows the active question text and total question count; opening it reveals a scrollable outline capped at (400px). Selecting a question closes the outline and scrolls the focused editor into view, respecting reduced motion. Above the mobile breakpoint the outline is open and its summary is hidden. The goal composer spans both columns; at (600px), its padding contracts and the primary action fills the available width. The same structure follows locale RTL/LTR.

## Elevation & Depth

Depth combines actual CSS perspective, rotated layers and soft cast shadows in the questionnaire scene. Repeated sheet shadow: `16px 24px 40px -18px #54365d66`. Scene perspective is (1300px); the about mark uses (900px). The about mark keeps a soft cast text shadow (`12px 19px 20px #66387733`) with its layered letter geometry. Workspace destination cards and form fields stay flat with borders or tonal separation; survey/report cards use a low ambient operational shadow.

**The Product Depth Rule.** Apply dimensional layering to survey and brand demonstrations; keep operational text and controls on legible planes.

The scene runs a seamless (7s) depth loop with `cubic-bezier(0.45, 0, 0.25, 1)`: the front questionnaire advances from its (40px) resting depth to (115px), rises and settles while the logic and report sheets separate and return. The orbit turns over (14s) with linear easing. Bounded mouse tilt composes on the parent stage with a (0.4s) response and resets on exit; the sequence also plays without pointer input. The about mark floats over (8s) with ease-in-out.

A visible localized pause/play control pauses sheet and orbit animations. System reduced motion initially pauses the demonstration, removes parent tilt and disables the about loop, button lift and transitions. Explicit play can opt the scene back into motion. Answer selection changes fill, text and pressed shadow over (150ms) while keyboard focus stays in place. The old arrival animation remains in source but is superseded by the continuous loop and is not a reusable motion token.

## Shapes

Controls and chips use gently rounded corners; the frontmatter records the recurring field, action, sheet and container radii. Workspace cards are more rounded. Thin separators organize text. Circular choice indicators and the dimensional orbit are native preview geometry, not a prohibition on circles. The conversation-shaped SVG brand mark is a fixed identity component.

## Components

### Buttons

Filled plum actions are compact, direct and accompanied by a directional inline SVG where shown; public action arrows mirror in LTR. Main actions have a minimum height (52px); small header actions use (44px). Hover lightens plum and lifts the button (2px) over (0.2s). Public keyboard focus uses a (3px) outline with offset (5px). The closing dark section reverses its action to pale lavender. Text links retain a (44px) minimum height and underline on hover.

### Chips

Question-type tags use pale lavender, field corners, (9px 18px) padding and (13px) text. They are descriptive tags, not selectable filters. Mobile padding reduces to (7px 12px).

### Cards / Containers

Preview sheets use sheet corners and (25px) padding with dimensional shadow. Branching diagrams use a lavender container with light nested answer boxes. Workspace destination cards use white, a thin warm border and the workspace-card radius; hover changes the fill to a pale rose tint. They use SVG arrows rather than numbered decoration.

### Inputs / Fields

Login fields use a cream fill, thin lavender border, field corners, a minimum height (52px) and (15px) type. Password visibility is a text control inside the field area. Placeholder color is locally strengthened for contrast; it is an input detail rather than a new palette family. Keyboard focus follows the public outline. Error messages use a compact rose-tinted block. Disabled buttons inherit reduced opacity and a not-allowed cursor.

### Navigation

Brand sits beside a centered horizontal navigation group and a filled account action. Hover and current-page states use heading plum. Mobile reveals a text menu control with `aria-expanded` and an expandable single-column navigation list. A globe SVG and native language select expose فارسی, English and Français in the public, login and workspace headers. Selecting a locale preserves the current pathname/query and scroll position through Next.js locale routing, and persists NEXT_LOCALE. i18next supplies public, app, survey and scene resources; document and surface lang/dir reflect fa RTL or en/fr LTR. Fixed interface copy is translated; authored survey content remains unchanged. Footer navigation is smaller and wraps. Workspace uses a simpler divided header and footer.

### FAQ

Native details/summary rows use an authored inline SVG cross that rotates (45deg) when open; its (180ms) transition is removed for reduced motion.

### Survey and Report Pagination

Listings display eight items per page, with localized previous/next controls, a polite live page count and disabled boundary controls. Survey filtering resets pagination and uses locale-aware case matching. Pagination navigation wraps at narrow widths.

### Survey Builder

Twelve labeled question-type buttons use authored inline SVG icons, field corners, thin borders and a minimum height (48px). Hover changes the lavender fill and border over (150ms); active press strengthens the fill. Outline selection uses lavender and plum, while the focused editor uses a stronger border and near-white fill without shadow. Keyboard focus uses a (3px) outline with (3px) offset. Question fields keep field corners and thin borders; secondary actions have a quiet lavender fill. Disabled actions reduce opacity.

Survey settings use native details/summary, initially closed. Only the active question is rendered for editing; its page remains selected in the outline. Validation and logic settings use an initially open tonal details container, keeping the main condition controls visible; matrix configuration shares that open container. This focused composition is specific to the builder, not a required layout for every operational surface.

The goal composer is a separate native disclosure, initially closed. Its cream container has a thin warm border and softly rounded corners; fields and proposal rows share (12px) corners. Generation reveals an unsaved review with expandable question rows, inclusion controls and a selected count. Explicit apply commits the selected proposal; existing questions remain intact. Manual types stay available when AI generation fails. Button focus uses a plum outline; field focus shifts the border and adds a soft ring. The source contains unused eyebrow and decorative mark styles; they are not a reusable pattern.

### Respondent Preview and Logic

The focused editor includes a warm cream answer-preview container with a thin lavender border, (12px) corners and (20px) padding. Its (14px) heading introduces real respondent controls rather than a static illustration. `QuestionAnswerPreview` uses the exported `QuestionAnswerInput` from `SurveyRunner`, so the twelve supported question types share their answer controls with the runner. Choice groups wrap with gaps; numeric rating and NPS labels use centered targets with a minimum width (44px). Selected single answers use pale purple fill and a stronger border, with a focus-within ring. NPS always offers (0–10), followed by localized endpoint captions. Matrix rows and ranking positions use labeled native selects. Preview answers are local state and reset when the question identity or type changes.

Validation and conditional logic are exposed in the question editor's disclosure. Conditions use an earlier eligible question, a type-appropriate operator and a typed value control: boolean and available options use selects, numeric answers retain numeric values, and text answers use text fields. The first question shows helper copy and disables the unavailable source selector. Matrix and ranking questions are excluded as condition sources. The answered operator omits the value field. When later questions exist, answer-trigger branch destinations sit in a separate native disclosure that starts closed. When no later destination exists, a warm tonal helper explains that a later question is needed instead of showing destination rows. Branch targets select later questions. The main condition controls remain visible, with a status line for saving; the disclosure styling follows the flat border-and-tonal-fill treatment already used for question configuration.

### Rich Question Content

Rich editing uses labeled bold, italic, heading and paragraph buttons in a wrapping toolbar with field corners and a minimum height (40px), plus a multiline HTML source field. The renderer applies DOMPurify and a restricted formatting style allowlist. It supports headings, emphasis, lists, quotations, links, tables and code while interpolating respondent answers only into text nodes. Author formatting is survey content, not a new brand palette or type ramp.

Rendered content uses leading (1.65), paragraph spacing (0.65em), relative heading sizes (1.45em, 1.25em, 1.1em), and logical list indentation (1.5em). Tables collapse borders, fill their container and pad cells (0.5em); the wrapper permits horizontal overflow. Long text and preformatted content wrap. Links are underlined in plum, and quotations use a thin plum rule with logical indentation. These values describe the renderer and must not replace the interface's shared typography.

### Bulk Question Import

The importer is a native disclosure with warm near-white fill, a thin border, sheet corners and (20px) padding. A full-width, vertically resizable textarea accepts a pasted list or JSON array containing (1–100) questions. JSON help is a nested disclosure with a wrapped LTR code example. Before apply, a numbered review shows question text and localized type labels in a scrollable list capped at (320px); rows use thin dividers. The filled plum apply action has a minimum height (44px), disabled opacity (0.45), and a (2px) keyboard outline with (3px) offset. Parsing and apply errors are announced as alerts. This review-before-apply behavior is shared with the goal composer's explicit commit step; typing source text does not itself add questions.
### Interactive Questionnaire Sheets

The scene repeats across home, product and login. Decorative back layers are hidden from assistive technology; the front sheet remains real HTML with keyboard-operable answer buttons, `aria-pressed` selection and a polite live response. Selected choices reverse to plum and white. The visible caption identifies the scene as a demonstration whose answers are not saved.

## Do's and Don'ts

### Do:

- **Do** apply the active locale reading direction and the Shared Voice Rule.
- **Do** preserve the Plum Hierarchy Rule across editorial and operational surfaces.
- **Do** keep localized demonstration controls usable with keyboard, pause/play and reduced motion.
- **Do** use borders and tonal fills to organize flat workspace controls.

### Don't:

- **Don't** scale the dimensional preview so that questions or controls become unreadable.
- **Don't** substitute generic elevated cards for every open editorial section.
- **Don't** remove the visible demonstration label when reusing the sample scene.

Not canonized: unused composer eyebrow/mark styles are not a shipped pattern; the eyebrow device must not become a house style. Local composer tint and focus variations remain component details rather than a competing palette. Author-supplied rich-content colors and sizes, local importer/preview tints and focus values remain renderer or component details rather than global tokens. One-off preview colors, tiny decorative metadata, superseded arrival motion and local placeholder corrections are not durable system tokens. The removed hard offset about shadow and replaced FAQ glyph are not inherited rules; the shipped soft cast shadow and authored SVG belong to their respective components.
