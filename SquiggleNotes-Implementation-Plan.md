# SquiggleNotes – Implementation Plan
**Stack:** Next.js (App Router) · Tailwind CSS · Framer Motion  
**Target:** Agentic AI coding reference  
**Version:** 1.0

---

## 1. Project Scaffold

```
squigglenotes/
├── app/
│   ├── layout.tsx                  # Root layout, font, global providers
│   ├── page.tsx                    # Landing / redirect to /notes
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── notes/
│   │   ├── layout.tsx              # Sidebar + main panel shell
│   │   ├── page.tsx                # Note list / home
│   │   └── [noteId]/
│   │       └── page.tsx            # Single note canvas
│   ├── revision/
│   │   ├── page.tsx                # Daily revision feed
│   │   └── session/[sessionId]/page.tsx
│   └── api/
│       ├── notes/route.ts
│       ├── folders/route.ts
│       ├── audio/route.ts
│       ├── generate/route.ts       # AI content generation
│       └── revision/
│           ├── schedule/route.ts
│           └── session/route.ts
├── components/
│   ├── canvas/
│   │   ├── NoteCanvas.tsx          # Main canvas controller
│   │   ├── DrawingLayer.tsx        # Pen/stylus input (SVG/Canvas)
│   │   ├── TypingLayer.tsx         # Keyboard text blocks
│   │   ├── Toolbar.tsx             # Pen, eraser, text, color picker
│   │   └── TimestampMarker.tsx     # Audio-linked markers
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── FolderTree.tsx
│   │   └── NoteListItem.tsx
│   ├── audio/
│   │   ├── AudioRecorder.tsx
│   │   ├── AudioPlayback.tsx
│   │   └── WaveformVisualizer.tsx
│   ├── revision/
│   │   ├── RevisionFeed.tsx
│   │   ├── FlashCard.tsx
│   │   ├── QuizCard.tsx
│   │   └── FillInBlank.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Drizzle or Prisma schema
│   │   └── client.ts
│   ├── audio/
│   │   └── recorder.ts             # MediaRecorder wrapper
│   ├── spaced-repetition/
│   │   └── scheduler.ts            # SM-2 or custom algorithm
│   └── ai/
│       └── generator.ts            # Content generation logic
├── hooks/
│   ├── useCanvas.ts
│   ├── useAudioRecorder.ts
│   ├── useRevisionSchedule.ts
│   └── useAutoSave.ts
├── store/
│   └── noteStore.ts                # Zustand global state
└── public/
    └── icons/
```

---

## 2. Database Schema

```ts
// lib/db/schema.ts

// Folders
Folder {
  id: uuid
  name: string
  parentId: uuid | null       // nested folders
  createdAt: timestamp
  updatedAt: timestamp
}

// Notes
Note {
  id: uuid
  folderId: uuid
  title: string
  canvasData: json            // serialized strokes + text blocks
  audioFileUrl: string | null
  audioDurationSeconds: number | null
  createdAt: timestamp
  updatedAt: timestamp
  lastStudiedAt: timestamp | null
}

// Timestamp Links
TimestampLink {
  id: uuid
  noteId: uuid
  canvasElementId: string     // references element inside canvasData
  audioOffsetSeconds: number
  createdAt: timestamp
}

// Generated Content
GeneratedContent {
  id: uuid
  noteId: uuid
  type: enum('flashcard', 'quiz', 'fill_in_blank')
  payload: json               // question, answer, options, etc.
  createdAt: timestamp
}

// Revision Sessions
RevisionSession {
  id: uuid
  noteId: uuid
  scheduledAt: timestamp
  completedAt: timestamp | null
  intervalDays: number        // 1, 2, 4, 7, ...
  nextDue: timestamp
  repetitionCount: number
  easeFactor: float           // SM-2 ease factor
}

// Revision Responses
RevisionResponse {
  id: uuid
  sessionId: uuid
  contentId: uuid
  rating: enum('again', 'hard', 'good', 'easy')   // SM-2 ratings
  respondedAt: timestamp
}
```

---

## 3. Module-by-Module Implementation

### 3.1 Note-Taking Canvas

**Goal:** GoodNotes-style canvas supporting both pen drawing and typed text.

**Key decisions:**
- Use `<canvas>` element for freehand drawing (Pointer Events API)
- Use absolutely-positioned `<textarea>` blocks for typed text
- Serialize both into a unified `canvasData` JSON structure

**canvasData JSON shape:**
```json
{
  "strokes": [
    {
      "id": "stroke_1",
      "points": [[x, y, pressure], ...],
      "color": "#1a1a1a",
      "width": 2,
      "tool": "pen" | "highlighter" | "eraser"
    }
  ],
  "textBlocks": [
    {
      "id": "text_1",
      "x": 120,
      "y": 340,
      "content": "mitochondria is...",
      "fontSize": 16,
      "color": "#1a1a1a"
    }
  ]
}
```

**Files to build:**
1. `DrawingLayer.tsx` — canvas element, pointer event handlers, stroke rendering
2. `TypingLayer.tsx` — floating textarea management, drag-to-reposition
3. `Toolbar.tsx` — pen/highlighter/eraser/text toggle, color picker, stroke width
4. `NoteCanvas.tsx` — orchestrates both layers, handles mode switching
5. `useCanvas.ts` — stroke state, undo/redo stack, serialization helpers
6. `useAutoSave.ts` — debounced save to `/api/notes/[id]` every 2 seconds

**Framer Motion usage:**
- Toolbar buttons: scale + opacity on hover/tap
- Tool switching: layout animation for active indicator
- New text block: fade+scale in on creation

---

### 3.2 Folder & Note Organization

**Goal:** Sidebar with nested folders and note list.

**Files to build:**
1. `FolderTree.tsx` — recursive folder rendering, expand/collapse
2. `NoteListItem.tsx` — note preview (title + last edited), swipe-to-delete on mobile
3. `Sidebar.tsx` — folder tree + search bar + "New Note" button

**API routes:**
- `GET /api/folders` — list all folders (tree structure)
- `POST /api/folders` — create folder
- `PATCH /api/folders/[id]` — rename
- `DELETE /api/folders/[id]` — delete (cascade notes)
- `GET /api/notes?folderId=` — list notes in folder
- `POST /api/notes` — create note
- `GET /api/notes/[id]` — fetch note with canvasData
- `PATCH /api/notes/[id]` — save canvasData (autosave endpoint)
- `DELETE /api/notes/[id]`

**Framer Motion usage:**
- Folder expand/collapse: `AnimatePresence` + height animation
- Note list: `staggerChildren` on mount

---

### 3.3 Audio Capture & Timestamp Linking

**Goal:** Record lecture audio while taking notes; link individual strokes/text to audio timestamps.

**Flow:**
1. User taps "Record" → `MediaRecorder` starts, elapsed time tracked
2. While recording, each new stroke/text block automatically gets `audioOffset = currentElapsed`
3. User can also manually tap a canvas element → link to current audio offset
4. Audio blob uploaded to storage on stop → `Note.audioFileUrl` updated

**Files to build:**
1. `AudioRecorder.tsx` — record button, elapsed timer, waveform visualizer
2. `WaveformVisualizer.tsx` — live amplitude bars using `AnalyserNode`
3. `AudioPlayback.tsx` — playback controls for reviewing linked audio
4. `useAudioRecorder.ts` — MediaRecorder wrapper, returns `{ isRecording, elapsed, start, stop, blob }`
5. `recorder.ts` (lib) — handles blob → FormData → upload to `/api/audio`

**API routes:**
- `POST /api/audio` — receive audio blob, store, return URL
- `GET /api/audio/[noteId]` — return audio URL + timestamp links

**TimestampMarker UI:**
- Small colored dot on canvas at position of linked element
- Tap dot → jump audio playback to that offset

**Framer Motion usage:**
- Recording button: pulsing ring animation while recording
- Waveform bars: spring animation on amplitude change

---

### 3.4 Context Retrieval

**Goal:** Tap any note element → see/hear the original lecture explanation.

**Flow:**
1. User switches to "Review mode" (toggle in toolbar)
2. Tapping a stroke/text block checks for `TimestampLink`
3. If found → auto-seek audio to `audioOffsetSeconds` and play
4. If AI insights available → show contextual panel with AI-generated explanation

**Files to build:**
1. `TimestampMarker.tsx` — clickable overlay dots on canvas
2. Context panel slide-in (in `NoteCanvas.tsx`) — shows audio player + AI insight

**Framer Motion usage:**
- Context panel: slide up from bottom with spring easing
- Timestamp dot: scale bounce on tap

---

### 3.5 AI Content Generation

**Goal:** Generate flashcards, quizzes, and fill-in-the-blank from note content.

**Trigger:** User taps "Generate" button on a note → server extracts canvas text → sends to AI API.

**MVP approach (rule-based for MVP, AI for V2):**
- MVP: extract all text blocks from `canvasData`, split into sentences, generate simple Q&A pairs by pattern matching
- V2: send to LLM with a structured prompt, return typed JSON

**Prompt contract (V2):**
```
Given these student notes:
<notes>{{extractedText}}</notes>

Generate 5 items as JSON array. Each item:
{
  "type": "flashcard" | "quiz" | "fill_in_blank",
  "question": string,
  "answer": string,
  "options": string[] | null,   // quiz only
  "blankedSentence": string | null  // fill_in_blank only
}
Return only JSON, no markdown.
```

**API route:**
- `POST /api/generate` — body: `{ noteId }` → returns `GeneratedContent[]`

**Files to build:**
1. `generator.ts` — text extraction + API call + parsing
2. Generation modal in note view — shows progress spinner → content preview → "Save" button

---

### 3.6 Spaced Repetition Scheduler

**Goal:** Trigger revision at optimal intervals using SM-2 algorithm.

**Algorithm (SM-2):**
```ts
// lib/spaced-repetition/scheduler.ts

function getNextInterval(repetition: number, easeFactor: number, rating: 0|1|2|3): {
  nextIntervalDays: number;
  newEaseFactor: number;
  newRepetition: number;
}

// Rating map:
// 0 = again (complete blackout)
// 1 = hard
// 2 = good
// 3 = easy

// Intervals: 1 → 2 → 4 → 7 → ... (multiplied by easeFactor)
// EF starts at 2.5, min 1.3
// EF adjustment: EF' = EF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
```

**Scheduling flow:**
1. Note created → schedule first revision for `now + 24h`
2. User completes revision → rate each card → compute next interval
3. `RevisionSession.nextDue` updated accordingly
4. Background job (or on-demand check) surfaces due sessions

**API routes:**
- `GET /api/revision/schedule` — returns all due sessions for today
- `POST /api/revision/session` — create new session for a note
- `PATCH /api/revision/session/[id]` — submit ratings, compute next interval

---

### 3.7 Revision Feed

**Goal:** Daily mixed-content revision interface.

**Layout:**
- Card-by-card feed (full-screen per card on mobile, centered panel on desktop)
- Bottom progress bar
- Rating buttons: Again / Hard / Good / Easy

**Card types:**

```tsx
// FlashCard.tsx
// Front: question, tap to flip → answer revealed
// Uses Framer Motion rotateY for 3D flip

// QuizCard.tsx
// Question + 4 options, tap to select, reveal correct

// FillInBlank.tsx
// Sentence with ___ gap, text input, submit to reveal
```

**Revision feed flow:**
1. Load all due `RevisionSession` records + their `GeneratedContent`
2. Shuffle and display one at a time
3. On each card completion → call rating API → update schedule
4. Show completion summary with streak, cards reviewed count

**Files to build:**
1. `RevisionFeed.tsx` — session management, card queue, progress
2. `FlashCard.tsx` — flip animation
3. `QuizCard.tsx` — option selection + reveal
4. `FillInBlank.tsx` — input + check
5. `useRevisionSchedule.ts` — fetch due sessions, submit ratings

**Framer Motion usage:**
- Card entrance: slide in from right
- Card exit after rating: swipe left/right based on rating
- Flip: `rotateY` with `backfaceVisibility: hidden`
- Progress bar: animated width

---

## 4. State Management

Use **Zustand** for global state:

```ts
// store/noteStore.ts
{
  // Active note
  activeNoteId: string | null
  canvasData: CanvasData | null
  isDirty: boolean              // unsaved changes flag

  // Audio
  isRecording: boolean
  recordingElapsed: number
  audioUrl: string | null

  // Canvas mode
  activeTool: 'pen' | 'highlighter' | 'eraser' | 'text' | 'review'
  activeColor: string
  strokeWidth: number

  // Actions
  setActiveTool, setActiveColor, setStrokeWidth
  updateCanvasData, markDirty, markClean
  setRecording, setAudioUrl
}
```

---

## 5. Routing & Navigation

```
/                        → redirect to /notes
/notes                   → sidebar + empty state
/notes/[noteId]          → sidebar + canvas
/revision                → daily revision feed (due cards)
/revision/session/[id]   → active revision session
```

Next.js App Router: use route groups `(auth)` and `(app)` for layout separation.

---

## 6. Notifications & Revision Triggers

**MVP approach:** Check for due revisions on app open (no background push).

**V2 approach:** 
- Use `next-cron` or Vercel Cron Jobs to run daily at 8AM local time
- Send Web Push Notification via `web-push` npm package
- User must grant notification permission on first open

---

## 7. UI Design Tokens (Tailwind config)

```js
// tailwind.config.js
extend: {
  colors: {
    canvas: '#FAFAF7',           // warm off-white paper feel
    ink: '#1C1C1E',              // near-black for strokes
    accent: '#4F6EF7',           // revision blue
    highlight: '#FFD60A',        // highlighter yellow
    success: '#30D158',          // correct answer green
    danger: '#FF453A',           // wrong / again red
  },
  fontFamily: {
    sans: ['DM Sans', 'sans-serif'],
    handwriting: ['Caveat', 'cursive'],  // for handwriting-style UI elements
  }
}
```

---

## 8. Build Phases (MVP → V1 → V2)

### Phase 1 — MVP (Weeks 1–3)
- [ ] Project scaffold + routing
- [ ] Folder + note CRUD
- [ ] Basic canvas: pen drawing + text blocks
- [ ] Autosave
- [ ] Basic audio recording (no timestamp linking yet)
- [ ] Rule-based content generation (extract sentences → basic Q&A)
- [ ] Flashcard revision feed (no scheduling yet, manual trigger)

### Phase 2 — V1 (Weeks 4–6)
- [ ] Timestamp linking (strokes ↔ audio offset)
- [ ] Audio playback from canvas tap
- [ ] SM-2 spaced repetition scheduler
- [ ] Automatic 24h revision trigger
- [ ] Quiz + fill-in-blank card types
- [ ] Revision session ratings + next interval computation
- [ ] Polish animations (Framer Motion throughout)

### Phase 3 — V2 (Weeks 7+)
- [ ] LLM-powered content generation
- [ ] Push notifications
- [ ] Adaptive scheduling based on user performance
- [ ] Concept graph visualization
- [ ] Collaborative features

---

## 9. Key Libraries

| Purpose | Library |
|---|---|
| Framework | `next` (App Router) |
| Styling | `tailwindcss` |
| Animation | `framer-motion` |
| State | `zustand` |
| DB ORM | `drizzle-orm` + `postgres` |
| Audio | Web APIs: `MediaRecorder`, `AnalyserNode` |
| Canvas | Native `<canvas>` + Pointer Events |
| Spaced rep | Custom SM-2 implementation |
| File storage | Vercel Blob / S3-compatible |
| Auth | `next-auth` |

---

## 10. Coding Conventions for AI Agent

- All components are **named exports** in PascalCase files
- All API routes return `{ data, error }` shape
- `canvasData` is always serialized to JSON string before DB write, parsed on read
- Framer Motion variants defined at top of component file as `const variants = {}`
- Tailwind: use `cn()` utility (clsx + tailwind-merge) for conditional classes
- All async server actions use `try/catch` and return typed errors
- Audio blobs stored as `.webm`, converted if needed server-side

---

---

## 11. Landing Page

### 11.1 Purpose & Positioning

The landing page is the first touchpoint for exam aspirants (UPSC, NEET, CAT) and university students. It must:
- Communicate the core cognitive science insight in one sentence
- Show, not just tell — the product must feel alive on the page
- Convert visitors directly to signup/login with zero friction

**Hero tagline:** *"Notes that remember. So you don't have to."*  
**Sub-tagline:** *SquiggleNotes applies cognitive science principles to help students retain and recall what they learn.*

---

### 11.2 Aesthetic Direction

**Theme:** Dark, editorial, precision-science. Think a premium research journal crossed with a focused study environment.

- **Background:** Deep ink `#0E0E0F` — evokes a chalkboard, late-night study, focused darkness
- **Accent:** Electric amber `#F5A623` — warm, energetic, like a highlighter on dark paper
- **Secondary accent:** Cool blue `#4F6EF7` — cognitive/scientific associations
- **Text:** Near-white `#F0EDE6` with warm tint — feels like paper
- **Font pairing:**
  - Display: `Instrument Serif` (italic cuts) — distinguished, academic, unexpected
  - Body: `DM Sans` — clean, modern contrast to the serif display
  - Handwriting accent: `Caveat` — used only for the "squiggle" motifs, hand-drawn labels
- **Texture:** Subtle paper grain overlay on hero, geometric dot-grid on feature cards
- **Motion:** Slow, confident — no bouncy animations. Scroll-triggered reveals, ink-draw SVG animations, smooth parallax

---

### 11.3 Page Sections

#### Section 1: Navbar
```
[SquiggleNotes logo]                    [Login]  [Get Started →]
```
- Logo: wordmark with a hand-drawn squiggle underline (SVG, Caveat font)
- Sticky on scroll with backdrop blur
- On scroll > 80px: subtle border-bottom appears with Framer Motion

#### Section 2: Hero
```
[Large headline — Instrument Serif italic]
Notes that remember.
So you don't have to.

[Sub-headline — DM Sans]
SquiggleNotes applies cognitive science to transform your
lecture notes into a revision system that actually works.

[CTA buttons]
  [Get Started Free]   [See How It Works ↓]

[Hero visual]
Animated mockup: a note canvas with a stroke being drawn,
a timestamp marker pulsing, then a flashcard flipping up from
the bottom of the screen
```
- Hero visual: CSS/Framer Motion animation — not a screenshot, a live illustration of the product loop
- Subtle dot-grid background with slow-drift parallax
- Ambient amber glow behind the mockup

#### Section 3: The Problem (Cognitive Hook)
**Headline:** *"You took notes. But do you remember what they meant?"*

Three horizontally-laid pain cards:
```
[ Context fades ]        [ Revision is manual ]     [ You forget anyway ]
You wrote it, but        Highlighting and rereading  Without timed recall,
weeks later the          don't build memory.         even good notes decay.
explanation is gone.
```
- Cards: dark bordered, grain-textured, minimal
- Scroll-triggered stagger entry with Framer Motion `viewport` prop

#### Section 4: How It Works (Product Loop)
**Headline:** *"Capture. Understand. Recall."*

Three-step horizontal flow with animated connector lines:

```
  [1. Capture]              [2. Understand]           [3. Recall]
  Write notes +             SquiggleNotes links        Revision is triggered
  record your lecture.      your notes to the          at the exact right
  Every word linked         moment you heard it.       time — 24h, then 2,
  to its explanation.                                  4, 7 days.
```
- Each step: large number (Instrument Serif), icon, short copy
- Animated SVG path draws between steps on scroll
- Framer Motion `whileInView` for each step card

#### Section 5: Feature Highlights
**Headline:** *"Built on how memory actually works."*

Alternating left-right layout (bento-style on mobile):

```
Feature 1: Context Capture
[Animated canvas mockup — pen drawing + audio waveform pulse]
Headline: "Hear what you meant, not just what you wrote."
Copy: Record your lecture alongside your notes. Tap any note
      element to replay the exact explanation you heard.

Feature 2: Neuro-Timed Revision
[Animated spaced repetition timeline visual]
Headline: "Forget forgetting."
Copy: Based on the Ebbinghaus forgetting curve, SquiggleNotes
      triggers revision at Day 1, Day 2, Day 4, and Day 7 —
      exactly when memory starts to fade.

Feature 3: Active Recall Engine
[Flashcard flip animation, quiz card reveal]
Headline: "Reading notes is passive. This isn't."
Copy: Automatically generated flashcards, quizzes, and
      fill-in-the-blank exercises from your own notes.
```

- Framer Motion `whileInView` + `x` directional slide per alternating item
- Feature visuals: inline Framer Motion animations, not static images

#### Section 6: Differentiation / Science Callout
**Headline:** *"Not another notes app."*

Single-column, full-width, centered — editorial pull-quote style:

```
"Most apps store notes.
 SquiggleNotes builds memory."

Three science pills:
[ Spaced Repetition ]  [ Active Recall ]  [ Context Preservation ]
     Ebbinghaus             Roediger &              Encoding
   Forgetting Curve         Karpicke               Specificity
```
- Pills: amber-bordered, dark fill, Caveat font labels
- Background: slightly lighter dark panel to break the page rhythm

#### Section 7: Who It's For
**Headline:** *"For students who can't afford to forget."*

Two large cards side by side:
```
[ Competitive Exam Students ]        [ University Students ]
UPSC · SSC · CAT · NEET             Engineering · Medicine
                                     Law · Sciences
"Months of content. One             "Finally understand
 brain. Zero margin for error."      why you wrote what
                                     you wrote."
```
- Cards: full-bleed dark with amber accent border on hover (Framer Motion)

#### Section 8: CTA / Sign Up
**Headline:** *"Your notes are waiting to be remembered."*

```
[Email input field]           [Start for Free →]

No credit card. Works on web and tablet.
```
- Email input: dark fill, amber border on focus (Framer Motion `animate`)
- On submit → redirect to `/signup?email=...` (pre-fill signup form)
- Background: faint Instrument Serif italic watermark text behind CTA

#### Section 9: Footer
```
[Logo]                    [Product]   [Company]    [Legal]
                           Notes       About        Privacy
                           Revision    Blog         Terms
                           Pricing

© 2025 SquiggleNotes        [Twitter]  [LinkedIn]
```

---

### 11.4 File Structure (Landing Page additions)

```
app/
├── page.tsx                          # Landing page (replaces redirect)
├── (auth)/
│   ├── login/page.tsx                # Login page
│   └── signup/page.tsx              # Signup page (email pre-fill support)

components/
└── landing/
    ├── Navbar.tsx
    ├── Hero.tsx
    ├── ProblemSection.tsx
    ├── HowItWorks.tsx
    ├── FeatureHighlight.tsx          # Reusable alternating feature row
    ├── ScienceCallout.tsx
    ├── WhoItsFor.tsx
    ├── CTASection.tsx
    ├── Footer.tsx
    └── animations/
        ├── CanvasMockup.tsx          # Animated note canvas illustration
        ├── SpacedRepTimeline.tsx     # Animated forgetting curve visual
        ├── FlashCardDemo.tsx         # Animated flip card
        └── ConnectorPath.tsx         # SVG path draw animation between steps
```

---

### 11.5 Auth Flow (Login / Signup)

**Login page (`/login`):**
- Minimal centered card on dark background
- Email + password fields
- "Continue with Google" option
- Link to `/signup`
- On success → redirect to `/notes`

**Signup page (`/signup`):**
- Same minimal card
- Pre-fills email if `?email=` query param present (from landing CTA)
- Name + Email + Password
- On success → redirect to `/notes` with welcome state

**Auth provider:** `next-auth` with:
- `CredentialsProvider` (email/password)
- `GoogleProvider` (OAuth)

**Middleware (`middleware.ts`):**
```ts
// Protect all /notes/* and /revision/* routes
// Redirect unauthenticated users to /login
// Redirect authenticated users away from /login and /signup to /notes
```

---

### 11.6 Framer Motion Animation Specs

| Element | Animation | Config |
|---|---|---|
| Navbar on scroll | `borderBottom` opacity 0→1 | `useScroll` + `useTransform` |
| Hero headline | Words slide up, staggered | `variants` with `staggerChildren: 0.08` |
| Hero mockup | Fade in + float up | `initial: y:40, opacity:0` → `animate` |
| Problem cards | Stagger slide up on viewport | `whileInView`, `viewport: { once: true }` |
| How it works steps | Sequential `x` slide in | `staggerChildren: 0.2` |
| SVG connector path | `pathLength` 0→1 | `useInView` + `animate` |
| Feature rows | Alternating `x: ±60` slide | `whileInView` per row |
| Flashcard demo | `rotateY` flip on interval | `animate` with `repeat: Infinity` |
| CTA email input | `border-color` on focus | `whileFocus` |
| "Who it's for" cards | Scale 1→1.02 on hover | `whileHover` |

---

### 11.7 Performance Constraints

- Fonts loaded via `next/font` (no layout shift)
- All landing animations use `will-change: transform` sparingly
- `LazyMotion` with `domAnimation` feature bundle — reduces Framer Motion bundle size
- Hero visual is CSS/SVG — no image downloads
- `viewport: { once: true }` on all scroll animations — no re-trigger overhead
- Landing page components are in a separate layout from the app shell — no sidebar loaded

---

### 11.8 Routing Summary (Updated)

```
/                        → Landing page (public)
/login                   → Login (public, redirects if authed)
/signup                  → Signup (public, redirects if authed)
/notes                   → App home — PROTECTED
/notes/[noteId]          → Note canvas — PROTECTED
/revision                → Revision feed — PROTECTED
/revision/session/[id]   → Active session — PROTECTED
```

---

*End of Implementation Plan*
