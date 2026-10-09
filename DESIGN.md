---
name: Porsnama
description: Persian survey tools presented as a dimensional research desk
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

Cream paper, plum typography and layered lavender questionnaire sheets give Persian survey work a tangible desk-like presence. The public surfaces combine generous editorial headings with working survey previews. Depth belongs to product geometry; copy, navigation and forms stay readable and direct.

The authenticated workspace inherits warm paper and Vazirmatn but uses a slightly warmer plum palette, white outlined cards and flatter operational density. This is an observed variation, not a second invented identity. Evidence: `frontend/src/styles/globals.css`, `components/PublicSite.tsx`, `components/SurveyScene.tsx` and `pages/workspace.tsx`; direction context: `.impeccable/direction.md`. This record covers public pages, login and the workspace entry, not all legacy application screens.

**Key Characteristics:**

- Persian typography and right-to-left reading order.
- Cream and plum with lavender product depth.
- Spacious paired sections and mobile stacking.
- Interactive, explicitly labeled demonstration sheets.
- Flat operational cards with visible keyboard focus.

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

### Named Rules

**The Plum Hierarchy Rule.** Use dark plum for text and actions, medium plum for emphasis, and pale lavender for supporting surfaces.

## Typography

**Display Font:** self-hosted Vazirmatn, with Tahoma and sans-serif fallbacks.
**Body Font:** the same family; regular and bold WOFF2 files are supplied locally.

**Character:** a single Persian family supports both editorial persuasion and operational controls. Balanced bold headings gain scale and tighter spacing while body copy retains generous leading.

### Hierarchy

- **Display:** the fluid frontmatter role drives public hero headings; mobile public headings become (43px). About uses its own fluid headline. Login uses (36px), reducing to (32px).
- **Headline:** the fluid section-heading role reduces to (29px) on mobile. Contextual FAQ and closing-section overrides exist.
- **Title:** repeated content headings use (20–24px), bold with the shared heading leading; sample-sheet title uses (26px).
- **Body:** public text commonly uses (14–17px); long introduction paragraphs use leading (2–2.2). FAQ and about text limit length to (65ch).
- **Label:** navigation uses (14px); form labels use (13px); supporting notes use (11–12px). Smaller sheet metadata is local preview detail, not a global text minimum.

### Named Rules

**The Single Persian Voice Rule.** Keep Vazirmatn throughout public, login and workspace surfaces; express hierarchy with scale, weight and leading.

## Layout

Public header and hero use a centered maximum width (1340px) with desktop side padding (48px). Most body sections use a centered content width (1244px), paired columns, gaps (80–100px) and vertical intervals (90–110px). Divided lists and open editorial columns provide structure without wrapping every paragraph in a card.

At (1100px), side gutters reduce to (30px), paired-section gaps contract and the preview scales down. At (760px), sections stack with side gutters (24px), section margins (65px), and typically (30px) between their contents; navigation expands into a full-width row via the menu control. The hero remains copy followed by a compact preview. The login split becomes one column. At (1500px), the hero and preview gain room.

Workspace uses a maximum width (1152px), mobile horizontal padding (20px), desktop padding (48px), and a two-column destination grid at Tailwind's `md` breakpoint (768px). Destination padding grows from (28px) to (36px). These are operational dimensions, not replacements for the public editorial grid.

## Elevation & Depth

Depth combines actual CSS perspective, rotated layers and soft cast shadows in the questionnaire scene. Repeated sheet shadow: `16px 24px 40px -18px #54365d66`. Scene perspective is (1300px); the about mark uses (900px). Workspace cards, lists and form fields stay flat with borders or tonal separation.

**The Product Depth Rule.** Apply dimensional layering to survey and brand demonstrations; keep operational text and controls on legible planes.

The scene responds only to mouse movement, with bounded rotation and reset on exit. Stage motion uses (0.4s) with `cubic-bezier(0.16, 1, 0.3, 1)`; the front sheet arrives over (0.9s) with the same easing. Reduced motion disables the stage transform, arrival animation and button lift/transition. Preserve these accommodations when reusing the scene.

## Shapes

Controls and chips use gently rounded corners; the frontmatter records the recurring field, action, sheet and container radii. Workspace cards are more rounded. Thin separators organize text. Circular choice indicators and the dimensional orbit are native preview geometry, not a prohibition on circles. The conversation-shaped SVG brand mark is a fixed identity component.

## Components

### Buttons

Filled plum actions are compact, direct and accompanied by a left-pointing inline SVG where shown. Main actions have a minimum height (52px); small header actions use (44px). Hover lightens plum and lifts the button (2px) over (0.2s). Public keyboard focus uses a (3px) outline with offset (5px). The closing dark section reverses its action to pale lavender. Text links retain a (44px) minimum height and underline on hover.

### Chips

Question-type tags use pale lavender, field corners, (9px 18px) padding and (13px) text. They are descriptive tags, not selectable filters. Mobile padding reduces to (7px 12px).

### Cards / Containers

Preview sheets use sheet corners and (25px) padding with dimensional shadow. Branching diagrams use a lavender container with light nested answer boxes. Workspace destination cards use white, a thin warm border and the workspace-card radius; hover changes the fill to a pale rose tint. They use SVG arrows rather than numbered decoration.

### Inputs / Fields

Login fields use a cream fill, thin lavender border, field corners, a minimum height (52px) and (15px) type. Password visibility is a text control inside the field area. Placeholder color is locally strengthened for contrast; it is an input detail rather than a new palette family. Keyboard focus follows the public outline. Error messages use a compact rose-tinted block. Disabled buttons inherit reduced opacity and a not-allowed cursor.

### Navigation

Brand sits beside a centered horizontal navigation group and a filled account action. Hover and current-page states use heading plum. Mobile reveals a text menu control with `aria-expanded` and an expandable wrapping navigation row. Footer navigation is smaller and wraps. Workspace uses a simpler divided header and footer.

### Interactive Questionnaire Sheets

The scene repeats across home, product and login. Decorative back layers are hidden from assistive technology; the front sheet remains real HTML with keyboard-operable answer buttons, `aria-pressed` selection and a polite live response. Selected choices reverse to plum and white. The visible caption identifies the scene as a demonstration whose answers are not saved.

## Do's and Don'ts

### Do:

- **Do** maintain Persian reading order and the Single Persian Voice Rule.
- **Do** preserve the Plum Hierarchy Rule across editorial and operational surfaces.
- **Do** keep demonstration controls usable with keyboard and reduced motion.
- **Do** use borders and tonal fills to organize flat workspace controls.

### Don't:

- **Don't** scale the dimensional preview so that questions or controls become unreadable.
- **Don't** substitute generic elevated cards for every open editorial section.
- **Don't** remove the visible demonstration label when reusing the sample scene.

Not canonized: the about mark's hard offset text-shadow and the FAQ's literal plus glyph remain local craft defects; they are not reusable shadow or icon rules. One-off preview colors, tiny decorative metadata and the corrected input placeholder value are not promoted into global tokens.
