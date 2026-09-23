# NameGenius (NameBubble Workspace)

**NameGenius** is an AI-powered and algorithmic business-name generator tailored for solo founders. This repository serves as a live Product Anatomy lab housing multiple prototype implementations—ranging from a lightweight Vanilla JS app to full-featured React 19 & Vite web applications.

---

## 🚀 Quick Start

This repository contains standalone prototypes. Each React app manages its own dependencies and dev server.

### 1. Vanilla JS Prototype (Lightweight)
Features offline algorithm, optional Groq LLM integration, and real-time Verisign RDAP `.com` domain checks.
```bash
# Serve static root directory using Python
python3 -m http.server 8080

# Open in browser: http://localhost:8080
```

### 2. NameGenius Main React App
Full interactive app built with React 19, Vite, and Tailwind CSS v3.
```bash
cd namegenius
npm install
npm run dev
# Dev server runs on http://localhost:5180 (or assigned Vite port)
```

### 3. Result Card UI Flow App
UI iteration showcasing the complete user flow with mock name batches.
```bash
cd result-card-app
npm install
npm run dev
# Dev server runs on http://localhost:5178
```

### 4. Result Card Gallery
Isolated component gallery demonstrating domain availability states (`available`, `taken`, `checking`).
```bash
cd s3-card-app
npm install
npm run dev
# Dev server runs on http://localhost:5190
```

---

## 📁 Repository Layout

| Directory / File | Description | Tech Stack / Tooling |
| :--- | :--- | :--- |
| [`index.html`](file:///Users/kumarisardarani/Downloads/NameBubble/index.html), [`app.js`](file:///Users/kumarisardarani/Downloads/NameBubble/app.js), [`style.css`](file:///Users/kumarisardarani/Downloads/NameBubble/style.css) | Standalone Vanilla JS prototype. Keyword generator + Groq LLM integration + live RDAP domain checks. | HTML5, Vanilla JS, CSS3 |
| [`namegenius/`](file:///Users/kumarisardarani/Downloads/NameBubble/namegenius) | Primary React application featuring full onboarding brief, result feed, shortlist management, brand comparison, and inline discovery questions. | React 19, Vite, Tailwind CSS v3, PostCSS |
| [`result-card-app/`](file:///Users/kumarisardarani/Downloads/NameBubble/result-card-app) | UI flow prototype focusing on stream generation, result cards, and interactive name refinement. | React 19, Vite, Tailwind CSS v4 |
| [`s3-card-app/`](file:///Users/kumarisardarani/Downloads/NameBubble/s3-card-app) | Component playground & design verification gallery for name result cards. | React 19, Vite, Tailwind CSS v4 |
| [`design/`](file:///Users/kumarisardarani/Downloads/NameBubble/design), [`wireframe/`](file:///Users/kumarisardarani/Downloads/NameBubble/wireframe), [`s3-card/`](file:///Users/kumarisardarani/Downloads/NameBubble/s3-card) | HTML / Canvas comps and wireframe design assets. | Static HTML / Design References |

---

## ✨ Key Features & Product Behavior

- **Multi-Step Onboarding Brief:** Collects business core concept, industry description, competitors, and target TLD preferences (`.com`, `.io`, `.co`, `.ai`).
- **Smart Name Generation:**
  - **Deterministic Generator:** Instant offline name generation using thematic suffixing, compound blending, and phonetic variations (`src/generator.js`).
  - **AI Integration (Vanilla App):** Optional Groq API key support (`llama-3.1-8b-instant`) stored securely in `localStorage` (`namegenius_groq_api_key`).
- **Interactive Refinement Loop:** After 3 consecutive name regenerations without shortlisting or comparing, inline brand discovery questions automatically trigger to refine subsequent outputs.
- **Shortlist & Comparison:** Allows saving top picks and side-by-side comparison of up to 2 domain names.
- **Domain Availability Checks:**
  - Real-time Verisign RDAP checks in the Vanilla JS prototype.
  - Interactive status badges (`available`, `taken`, `loading`) in the React prototypes.

---

## 🛠️ Development Guidelines

- **No Root Build System:** There is no root-level `package.json`. Navigate into individual sub-app directories (`namegenius`, `result-card-app`, `s3-card-app`) to run commands or install packages.
- **State Management & Components:** Functional React components with local state (`App.jsx`).
- **Environment & Keys:** Do not commit `.env` files or API keys. API keys should remain strictly in client local storage during development.

---

## 📄 Documentation & References

- [`CLAUDE.md`](file:///Users/kumarisardarani/Downloads/NameBubble/CLAUDE.md) - Detailed guide on layout, command references, and product conventions.
- [`AGENTS.md`](file:///Users/kumarisardarani/Downloads/NameBubble/AGENTS.md) - Agent guidelines and development constraints.
