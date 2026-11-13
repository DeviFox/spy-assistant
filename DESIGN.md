---
name: MUSYA.exe
description: Classified field console that accompanies a physical escape room; every locked thing is redacted.
colors:
  graphite-ground: "#101310"
  field-plate: "#171d18"
  raised-plate: "#1d251f"
  top-plate: "#232d26"
  dossier-text: "#dce5dc"
  muted-sage: "#859187"
  faint-sage: "#808c82"
  phosphor: "#9fe3b2"
  phosphor-hover: "#b6ecc5"
  phosphor-ink: "#0f1a12"
  phosphor-wash: "rgb(159 227 178 / 0.09)"
  phosphor-line: "rgb(159 227 178 / 0.35)"
  brass-amber: "#d6b46a"
  brass-wash: "rgb(214 180 106 / 0.1)"
  signal-red: "#d77d75"
  signal-red-wash: "rgb(215 125 117 / 0.1)"
  static-grey: "#a3b0a6"
  plate-rule: "#303a32"
  strong-rule: "#415044"
  hatch-edge: "#56665a"
  document-paper: "#d6dbd0"
  document-paper-2: "#c8cec1"
  document-ink: "#1a211c"
  document-ink-2: "#4d574f"
typography:
  display:
    fontFamily: "'Golos Text', system-ui, sans-serif"
    fontSize: "clamp(26px, 2.4vw, 34px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Golos Text', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Golos Text', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Golos Text', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  nav:
    fontFamily: "'Golos Text', system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    letterSpacing: "0.06em"
  terminal:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  sm: "2px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "20px"
  s-6: "24px"
  s-8: "32px"
  s-10: "40px"
components:
  button-primary:
    backgroundColor: "{colors.phosphor}"
    textColor: "{colors.phosphor-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.phosphor-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.raised-plate}"
    textColor: "{colors.faint-sage}"
  code-input:
    backgroundColor: "{colors.graphite-ground}"
    textColor: "{colors.dossier-text}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "48px"
  badge-active:
    backgroundColor: "{colors.phosphor-wash}"
    textColor: "{colors.phosphor}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "22px"
  badge-pending:
    backgroundColor: "{colors.brass-wash}"
    textColor: "{colors.brass-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "22px"
  badge-error:
    backgroundColor: "{colors.signal-red-wash}"
    textColor: "{colors.signal-red}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "22px"
  panel:
    backgroundColor: "{colors.field-plate}"
    textColor: "{colors.dossier-text}"
    rounded: "{rounded.sm}"
    padding: "16px"
  nav-item:
    textColor: "{colors.muted-sage}"
    typography: "{typography.nav}"
    padding: "0 20px"
    height: "42px"
  nav-item-active:
    backgroundColor: "{colors.raised-plate}"
    textColor: "{colors.dossier-text}"
  terminal:
    backgroundColor: "{colors.graphite-ground}"
    textColor: "{colors.dossier-text}"
    typography: "{typography.terminal}"
    rounded: "{rounded.sm}"
    padding: "16px"
  document-sheet:
    backgroundColor: "{colors.document-paper}"
    textColor: "{colors.document-ink}"
    rounded: "1px"
    padding: "32px"
---

# Design System: MUSYA.exe

## Overview

**Creative North Star: "The Redacted Dossier"**

The console is a working instrument issued to one operative, not a game screen. Graphite plates sit edge to edge, divided by single hairline rules; nothing floats, nothing glows. The terminal is the spine of the main view and the tallest object on it. Everything else (task, equipment, files, stages) is filed around it like sheets in a folder.

Locking has one visual voice: the redaction bar. A locked title, item, filename or stage is replaced by a diagonal hatch of the same width as the hidden text. Unlocking wipes the bar off left to right and the revealed text twitches once with a signal slip. A rejected code gets the same slip in red. That single vocabulary carries the whole progression story; there is no second lock metaphor.

Phosphor green is rationed to the things that are live: the caret, the active stage, focus, success, the primary action. Density is that of a real tool: small mono captions, tabular numerals, 1px rules, tight 2px corners. Narrative text is Russian; system labels and statuses are English uppercase mono.

**Key Characteristics:**
- Flat graphite plates, depth by tone and 1px rules only
- Phosphor accent only on live state
- Redaction hatch as the single lock vocabulary, with an unredact wipe on unlock
- Golos Text for interface, JetBrains Mono for system voice
- Event-tied motion only, fully disableable

## Colors

A near-monochrome green-graphite palette pinned by the brief, with one phosphor accent and two status hues.

### Primary
- **Phosphor** (`phosphor`): live state only. Caret, active stage bar and code, focus outline (1px), success messages, the primary action fill, the live dot in the top bar, the active nav tick. Its wash (`phosphor-wash`) fills the active stage cell and active badge; its line (`phosphor-line`) borders success states and hovered files.
- **Phosphor Hover** (`phosphor-hover`): hover fill for phosphor-filled buttons only.
- **Phosphor Ink** (`phosphor-ink`): text on phosphor fills and selection.

### Secondary
- **Brass Amber** (`brass-amber`): pending, restricted, hints, warning terminal lines. Never decorative.

### Tertiary
- **Signal Red** (`signal-red`): errors, ACCESS DENIED, the CLASSIFIED tag, the red half of a wrong-code slip.

### Neutral
- **Graphite Ground** (`graphite-ground`): page ground, top bar, terminal screen, code input well.
- **Field Plate** (`field-plate`): panels, sidebar, cards, stage strip.
- **Raised Plate** (`raised-plate`): hover and selected rows, active nav, toasts, media placeholders.
- **Top Plate** (`top-plate`): reserved third tier; rarely used.
- **Dossier Text** (`dossier-text`): primary text.
- **Muted Sage** (`muted-sage`): secondary text, captions, panel labels, inactive nav.
- **Faint Sage** (`faint-sage`): timestamps, terminal marks, locked stage codes, placeholders. Passes 4.5:1 on ground and field plate only.
- **Static Grey** (`static-grey`): UNKNOWN terminal events and toasts, told apart by their `?` mark rather than by hue.
- **Plate Rule / Strong Rule** (`plate-rule`, `strong-rule`): all dividers and plate borders; strong rule for input wells, toasts, icon frames and scrollbars.
- **Hatch Edge** (`hatch-edge`): the 1px border around a resting redaction bar.
- **Document Paper / Ink** (`document-paper`, `document-paper-2`, `document-ink`, `document-ink-2`): the paper sheet inside the document viewer only. Paper is the one light surface in the world.

### Named Rules
**The Pinned Palette Rule.** The palette is fixed by the brief. Every hue on screen comes from the tokens above or an alpha of them; no off-palette hues, no new accents, no gradients beyond the hatch.

**The Live Phosphor Rule.** Phosphor marks what is live or actionable now. If an element is not current, focused, successful or the primary action, it is not green.

**The Faint Plate Rule.** Faint sage stays off raised-plate surfaces (4.48:1 there). On raised plates, use muted sage or dossier text.

## Typography

**Display Font:** Golos Text (with system-ui)
**Body Font:** Golos Text (with system-ui)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SF Mono, Menlo)

**Character:** A neutral grotesque carries headings and interface; the monospace is the system speaking (terminal, IDs, codes, timestamps, metadata). Both self-hosted at weights 400/500/600 (Golos) and 400/500 (Mono). Numerals are tabular everywhere.

### Hierarchy
- **Display** (600, clamp 26–34px, 1.1): the single greeting heading on Overview.
- **Headline** (600, 22px): page titles, task detail titles, the paper sheet title.
- **Title** (600, 18px): task titles in cards, archive entries.
- **Body** (400, 14px, 1.5): descriptions and narrative; paper text caps at 68ch.
- **Nav** (500, 12.5px, 0.06em, uppercase labels): sidebar items and stage names.
- **Terminal** (400, 14px, 1.65): terminal lines, prompt, paper body copy; timestamps drop to 12.5px.
- **Label** (400–500, 11px, 0.08em, uppercase): panel headers, metadata keys, badges, status words, back links, toast levels.

### Named Rules
**The Two Voices Rule.** Golos speaks to the operative; JetBrains Mono is the machine. Codes, IDs, filenames, timestamps and statuses are always mono.

**The Caption Is Metadata Rule.** The 11px uppercase mono caption labels data (a field key, a panel name, a status). It never sits above a heading as an eyebrow.

## Layout

An application shell: a sticky 48px top bar across the full width, a 232px sticky left rail, and a main column padded 24/32/40px with a 1320px cap. The Overview composes a full-width greeting band (heading left, dossier fields right, separated by vertical rules), a five-cell stage strip, then the terminal (flexible, roughly two thirds, height clamp 420–640px) beside a 300–360px side column of current task and equipment.

Spacing runs on a 4px base (4, 8, 12, 16, 20, 24, 32, 40). Panel bodies use 16px, grid gaps 20px, page headers 20px below with a rule and 24px margin.

Responsive: at 1100px the Overview stacks (side column above terminal, side column becomes two up) and page padding tightens to 20px. At 860px the rail becomes a drop-down sheet under the top bar opened by a 40px menu button, nav items grow to 48px, the stage strip becomes a vertical list with a 1px side tick, and terminal timestamps hide. At 560px and 480px document rows and top-bar metadata collapse further.

## Elevation & Depth

Flat. There are no drop shadows anywhere. Depth comes from three tonal plates (ground, field plate, raised plate) and 1px rules. The only overlay dim is the access-level banner scrim (ground at 72%). The single `box-shadow` in the build is an inset 1px phosphor edge on a selected list row, which is a rule, not elevation.

### Named Rules
**The Hairline Rule.** Separation is a 1px rule or a tone step, never a shadow or glow. If something needs to stand out, give it a 1px edge or a plate tone.

## Shapes

Square. Every plate, badge, button, input and toast uses a 2px corner; the paper sheet uses 1px. Status dots and the live dot are square pixels, not circles. Empty states use a 1px dashed rule; media placeholders use a dashed strong rule. Active stage and access banner carry a 2px phosphor bar along their top edge.

### Named Rules
**The Hatch Rule.** The redaction hatch (a -45deg repeating stripe, 3px light / 4px dark) is the only lock texture. Locked titles, items, filenames, stages and locked empty states all use it, sized to the text they hide, and it must read at ≥2:1 against the plate it sits on.

## Components

### Buttons
- **Shape:** squared (2px).
- **Primary:** phosphor fill, phosphor ink, uppercase mono label (12.5px, 500, 0.08em), 38px tall, 16px sides, usually with a trailing arrow.
- **Hover / Focus:** fill lightens to phosphor hover over 140ms; the arrow gap widens 8px to 12px. Focus is the global 1px phosphor outline at 2px offset.
- **Disabled:** raised plate fill, faint sage text.

### Chips (status badges)
- **Style:** 22px tall, 1px border in the tone's colour, 11px uppercase mono, a 5px square dot.
- **State:** active (phosphor on wash), done (muted sage, phosphor dot, strong rule), muted (hollow dot), pending (amber on wash), error (red on wash), unknown (static grey).

### Cards / Containers
- **Corner Style:** 2px.
- **Background:** field plate; header strip 36px tall with a mono label left and an aside right, divided by a plate rule.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px plate rule.
- **Internal Padding:** 16px.

### Inputs / Fields
- **Style:** code entry is a 48px ground well with a strong-rule border; the value is 18px uppercase with 0.14em tracking; the submit is a joined phosphor segment on the right.
- **Focus:** border turns phosphor.
- **Error / Disabled:** border turns red, the row shakes once, the message slips in red; success sets a phosphor-line border.

### Navigation
- **Style:** left rail on field plate; 42px items with an 18px pictogram, uppercase Golos label and a mono count on the right (count turns phosphor when there is something new).
- **Hover / Active:** raised plate background; active adds a 1px phosphor tick on the left edge and a phosphor icon.
- **Mobile:** the rail drops down under the top bar as a full-width sheet with 48px items.

### Terminal (signature)
Ground screen inside a plate frame with a 36px header (session title, ONLINE state in phosphor). Lines are a three-column grid: faint timestamp, a single-character mark, message. Message tone follows type (system muted, info text, success phosphor, warning amber, error red, unknown grey). Each new line slides in 4px; the block caret blinks at 1.06s in steps. The prompt sits at the foot behind a rule, phosphor PS1, and the caret only blinks while focused.

### Redaction (signature)
Inline hatch bar sized in characters to the hidden text, with a hatch-edge border. On unlock the bar gets a phosphor-line border and wipes off left to right (620ms, 120ms delay) while the revealed text plays one signal slip. Under motion off the text simply appears.

### Stage Strip
Five equal cells in one bordered strip: large mono stage number, uppercase name, mono status. Active cell is phosphor-washed with a 2px phosphor top bar; completed cells get a strong-rule bar and muted text; locked cells redact their names.

### Document Sheet
Paper sheet (document paper, document ink) with mono header and footer strips divided by ink at 18%, a headline title, mono body at 1.75 line height, and dashed key/value rows. Beside it, a field-plate metadata panel.

## Do's and Don'ts

### Do:
- **Do** separate every surface with a 1px plate rule or a tone step (ground, field plate, raised plate).
- **Do** use the redaction hatch for every locked thing, sized to the text it hides, at ≥2:1 against its plate.
- **Do** reserve phosphor for caret, active stage, focus, success and the primary action.
- **Do** tie motion to events: line-in on new terminal lines, the caret, the unredact wipe, and the signal slip on unlock, access change or wrong code.
- **Do** disable all animation and transition under `[data-motion='off']` (set from the user setting or `prefers-reduced-motion`), leaving the caret visible and static.
- **Do** reference shared keyframes from CSS Modules through the `--a-*` custom properties (`--a-unredact`, `--a-line-in`, `--a-caret-blink`, `--a-page-in`, `--a-toast-in`, `--a-scan`, `--a-shake`), because CSS Modules localize keyframe names; use the global `.slip` class for the signal slip.
- **Do** set codes, IDs, filenames, timestamps and statuses in JetBrains Mono.
- **Do** draw pictograms as inline SVG on a 24px grid with a 1.5 stroke and square caps.

### Don't:
- **Don't** use drop shadows or glows; use a 1px edge.
- **Don't** introduce hues outside the pinned palette, or gradients other than the hatch.
- **Don't** set faint sage text on raised-plate surfaces.
- **Don't** hide locked content with blur, opacity fades or overlays; the hatch is the lock (a lock pictogram may label a locked empty state, always with the hatch).
- **Don't** run ambient or looping motion beyond the focused caret; no constant flicker.
- **Don't** put an uppercase mono caption above a heading as an eyebrow.
- **Don't** round corners beyond 2px or use circular dots.
