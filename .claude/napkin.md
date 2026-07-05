# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-06-22] Dev server at http://localhost:5173 (Vite)**
   Do instead: always use port 5173 for local dev and Playwright baseURL.

2. **[2026-06-22] Package manager is npm (not yarn/pnpm)**
   Do instead: use `npm ci` in CI, `npm install` locally.

## Shell & Command Reliability
1. **[2026-06-22] Working directory has spaces — quote paths in PowerShell/Bash**
   Do instead: always wrap path in double quotes: `"C:\Users\PC\Desktop\Proyecto Capstone\Proyecto_CorpoDG_Frontend"`.

## Domain Behavior Guardrails
1. **[2026-06-22] Chatbot API mock in Playwright uses `page.route('**/api/chatbot/')`**
   Do instead: intercept with that pattern; no real backend needed for E2E tests.

2. **[2026-06-22] ChatBot.vue CSS classes for selectors**
   Do instead: `.chatbot-burbuja` (button), `.chatbot-ventana` (window), `.chatbot-input`, `.chatbot-btn-enviar`, `.chatbot-btn-accion`, `.mensaje-asistente`, `.mensaje-usuario`.
