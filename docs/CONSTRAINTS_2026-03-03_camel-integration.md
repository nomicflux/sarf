# Session Constraints: CAMeL Tools Integration (2026-03-03)

## Plan Reference
- Plan file: docs/current-plans/CAMEL_INTEGRATION_IMPLEMENTATION_STATUS.md
- 3 phases: Backend → Client → Wiring

## Constraints
- AlKhalil becomes fallback, not removed
- Levantine maps to MSA (no CAMeL Levantine DB)
- Backend runs on localhost:8000
- Phase completion gate is mandatory (tests, lint, commit, stop)
- Subagent specification is binding

## User Corrections (2026-03-03)

### BANNED: Ad-hoc script execution
- User's exact words: "I WANT YOU TO _NEVER FUCKING EVERY_ RUN RANDOM PYTHON SCRIPTS _TO CHECK *ANYTHING*_. YOU ARE NOW DISALLOWED FROM SCRIPTING OUT SOLUTIONS TO FILE / LIBRARY CHECKS AND UPDATES. NO PYTHON, RUBY, BASH, JAVASCRIPT, ETC. YOU FUCKING USE STANDARDIZED CLAUDE CODE TOOLS FOR STANDARDIZED PROCESSES. REASONING: RUNNING A PYTHON SCRIPT BREAKS ALL GUARDRAILS. I CANNOT EASILY SEE WHAT YOU ARE RUNNING OR WHY."
- User correction on fallback: "NO, _YOU_ DO THE GOD DAMN WORK. IT DOES _NOT_ REQUIRE A PYTHON SCRIPT." — meaning: use `pip list`, `pip show`, `which`, Read, Glob, Grep, etc. Not scripts.
- Category: REJECTED APPROACH — never use `python -c`, `node -e`, or similar
- Added to CLAUDE.md as permanent rule
