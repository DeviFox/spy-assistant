# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, plain CSS Modules with shared tokens. Zustand only for operation state. No backend. Runs locally in a desktop browser (`npm run dev`). Fonts self-hosted via `@fontsource` so the app works offline at the event.

## What it is

MUSYA.exe is the digital companion to a physical, personal birthday escape room. The laptop acts as a secret operative's workstation: it issues tasks and hints, accepts codes found in the real world, and unlocks the next stages of the operation. It never replaces the physical quest: objects, locks, keys and paper documents are the core; the console only accompanies them.

## Users

- **Player (primary):** Musya, the birthday person, alone at the laptop, close up (50–70 cm). She reads instructions, types codes, opens documents, uses the terminal.
- **Organizer (secondary):** the person running the quest. Edits scenario content in config files, tests progression through a hidden DEV panel (`?dev` URL param or an undocumented terminal command). The DEV panel must never appear in the player's normal navigation.

## Core workflow

Receive task → act in the physical room → enter the result (code, choice) → system confirms, grants equipment / documents, advances the stage. Five stages: INITIALIZATION, EQUIPMENT, INVESTIGATION, ACCESS, EXTRACTION.

## Constraints

- Content (tasks, documents, equipment, commands, messages, events) lives in config files separate from UI; the scenario will change often.
- At this stage: neutral placeholder content only. No memes, jokes, characters, dialogues or invented plot details until separately approved.
- localStorage is UI state only, never a protection mechanism for the real gift.
- No real system commands, no fake security, no Linux emulation; the terminal has its own closed command set.
- Every animation can be disabled and respects `prefers-reduced-motion`. No constant flicker, mandatory long intros, or sounds on every action. Glitch effects are allowed when they are on-theme and tied to an event (unlock, access change, wrong code), short and disableable (organizer update, 2026-11-12).

## Language

System labels, navigation and statuses in English (OVERVIEW, CASE FILES, LOCKED, ACTIVE). Narrative text, terminal messages and descriptions in Russian.

## Brand commitments (pinned by the brief)

- Name: MUSYA.exe. Logo placeholder; later a silhouette of a kitten with a sword.
- Restrained hacker terminal / classified intelligence system / retro computer, explicitly not acid cyberpunk.
- Palette pinned: ground #101310, surface #171D18, surface-2 #1D251F, text #DCE5DC, text-2 #859187, accent #9FE3B2, warning #D6B46A, error #D77D75, border #303A32.
- Monospace for system messages, neutral grotesque for interface headings. Thin rules, small technical captions, minimal pictograms.
- No bright acid greens, large gradients, glass, constant flicker, decorative animation, excess glow or shadow.
- Should feel like a real specialised tool, not a game site from a template.
