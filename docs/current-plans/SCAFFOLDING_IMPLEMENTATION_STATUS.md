# Sarf — Project Scaffolding Plan

## Status

- **Phase 1**: COMPLETE (committed: `0a85a89`)
- **Phase 2**: COMPLETE
- **Phase 3**: COMPLETE

---

## PSP Rules

### Code Style Checklist (apply EVERY phase)
- [ ] Functions <20 lines, <10 if possible
- [ ] Pure functions, no defensive coding
- [ ] No dead code, no TODOs
- [ ] Tests for new functions

### Phase Completion Gate (apply EVERY phase)

1. Run full test/check suite for the phase
2. Run linter (clippy for Rust, typecheck for TS)
3. Update this status document
4. Commit the phase: `git add <specific files> && git commit -m "Phase N (topic) complete"`
5. **STOP and wait for user approval**

### Subagent Specification

When a phase specifies "**Subagent**: X", the orchestrator MUST:
1. Launch that subagent via Task tool
2. NOT use Edit/Write/NotebookEdit directly
3. Provide ALL context in the prompt (style rules, build commands, file paths, deliverables, constraints)
4. After subagent completes: run verification, update docs, commit

---

## Phase 1: Create Rust crate scaffolding — COMPLETE

**Subagent**: kiss-code-generator

### Deliverables (verified)
- `Cargo.toml`: `sarf-core`, edition 2021, cdylib+rlib, wasm-bindgen 0.2, release profile optimized
- `src/lib.rs`: `init()` with `#[wasm_bindgen(start)]`, `analyze_word()` stub, 1 passing test
- `.gitignore`: target/, pkg/, editor files
- `cargo check` — passed
- `cargo test` — 1/1 passed
- `cargo clippy` — 0 warnings

---

## Phase 2: Create WXT extension scaffolding — COMPLETE

**Subagent**: modular-builder

### Code Style Checklist
- [x] Functions <20 lines, <10 if possible
- [x] Pure functions, no defensive coding
- [x] No dead code, no TODOs
- [x] Tests for new functions (no new testable pure functions in this phase — all files are config/entrypoints)

### Steps

1. Create `extension/` directory and subdirectories
2. Create `extension/package.json`:
   - name: `sarf-extension`, type: `module`, private: true
   - Scripts:
     - `dev`: `wxt`
     - `dev:firefox`: `wxt -b firefox`
     - `build`: `wxt build`
     - `build:firefox`: `wxt build -b firefox`
     - `zip`: `wxt zip`
     - `zip:firefox`: `wxt zip -b firefox`
     - `postinstall`: `wxt prepare`
     - `build:wasm`: `cd .. && wasm-pack build --target bundler --out-dir pkg`
     - `typecheck`: `tsc --noEmit`
   - devDependencies: `wxt`, `typescript`, `vite-plugin-wasm`, `vite-plugin-top-level-await`

3. Create `extension/tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "types": ["wxt/client-types"]
     },
     "include": ["entrypoints/**/*.ts", "wxt.config.ts"]
   }
   ```

4. Create `extension/wxt.config.ts`:
   ```ts
   import { defineConfig } from "wxt";
   import wasm from "vite-plugin-wasm";
   import topLevelAwait from "vite-plugin-top-level-await";

   export default defineConfig({
     manifest: {
       name: "Sarf — Arabic Morphology",
       permissions: ["activeTab"],
       content_security_policy: {
         extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
       },
       web_accessible_resources: [
         {
           resources: ["*.wasm"],
           matches: ["<all_urls>"],
         },
       ],
     },
     vite: () => ({
       plugins: [wasm(), topLevelAwait()],
     }),
   });
   ```

5. Create `extension/entrypoints/background.ts`:
   ```ts
   export default defineBackground(() => {
     console.log("Sarf background service worker started");
   });
   ```

6. Create `extension/entrypoints/content.ts`:
   ```ts
   import init from "../../pkg/sarf_core";

   export default defineContentScript({
     matches: ["<all_urls>"],
     async main() {
       await init();
       console.log("Sarf WASM initialized");
     },
   });
   ```

7. Create `extension/entrypoints/popup/index.html`:
   ```html
   <!doctype html>
   <html lang="ar" dir="rtl">
     <head>
       <meta charset="UTF-8" />
       <title>Sarf</title>
       <style>
         body { font-family: system-ui; width: 320px; padding: 16px; }
         input { direction: rtl; width: 100%; font-size: 16px; padding: 8px; margin-bottom: 8px; }
         button { width: 100%; padding: 8px; cursor: pointer; }
         #result { margin-top: 12px; white-space: pre-wrap; direction: rtl; }
       </style>
     </head>
     <body>
       <input id="word" type="text" placeholder="أدخل كلمة" />
       <button id="analyze">حلّل</button>
       <div id="result"></div>
       <script type="module" src="./main.ts"></script>
     </body>
   </html>
   ```

8. Create `extension/entrypoints/popup/main.ts`:
   ```ts
   import init, { analyze_word } from "../../../pkg/sarf_core";

   async function setup() {
     await init();
     const input = document.getElementById("word") as HTMLInputElement;
     const button = document.getElementById("analyze") as HTMLButtonElement;
     const result = document.getElementById("result") as HTMLDivElement;

     button.addEventListener("click", () => {
       result.textContent = analyze_word(input.value);
     });
   }

   setup();
   ```

9. Create `extension/.gitignore`:
   ```
   node_modules/
   .wxt/
   .output/
   ```

10. Run `cd /Users/demouser/Code/sarf/extension && pnpm install`

### Deliverables (verified)
- All files listed above created
- `pnpm install` succeeds (pnpm v10.29.3, WXT 0.20.17)
- `pnpm run typecheck` — only errors are WASM import errors for `pkg/sarf_core` (expected, `pkg/` doesn't exist yet)
- `tsconfig.json` updated to extend `.wxt/tsconfig.json` (plan had `types: ["wxt/client-types"]` which doesn't work with WXT 0.20.17)

### Phase Completion Gate
1. Run `pnpm run typecheck` from extension/ — verify no unexpected errors (WASM import errors OK)
2. Update this status document
3. Commit: `git add && git commit -m "Phase 2: WXT extension scaffolding"`
4. **STOP and wait for user approval**

---

## Phase 3: Wire WASM build and verify end-to-end — COMPLETE

**Subagent**: modular-builder

### Code Style Checklist
- [x] Functions <20 lines, <10 if possible
- [x] Pure functions, no defensive coding
- [x] No dead code, no TODOs
- [x] Tests for new functions (no new testable pure functions — wiring only)

### Steps

1. Run `wasm-pack build --target bundler --out-dir pkg` from `/Users/demouser/Code/sarf/`
2. Run `pnpm run build` from `extension/` to verify full build pipeline
3. Fix any import path or configuration issues discovered during build
4. Run `pnpm run dev` briefly to verify extension loads with WASM initialized

### Changes made during Phase 3
- `wxt.config.ts`: Added `build: { target: "esnext" }` to vite config
- `entrypoints/popup/main.ts`: Changed to named imports `{ init, analyze_word }` (wasm-pack bundler target exports named, not default)
- `entrypoints/content.ts`: Removed WASM import — WXT content scripts build as IIFE which cannot use top-level await. Content script is now a simple placeholder; WASM usage is in popup (ES module context)
- `entrypoints/background.ts`: Reverted to original arrow function form (no WASM needed)

### Deliverables (verified)
- `wasm-pack build --target bundler --out-dir pkg` — succeeded
- `pnpm run build` in extension/ — succeeded, produced `.output/chrome-mv3/` (32.25 kB total, includes WASM)
- `pnpm run typecheck` — clean, no errors
- `cargo test` — 1/1 passed
- `cargo clippy` — no warnings

### Phase Completion Gate
1. `cargo test` — 100% pass
2. `cargo clippy` — no warnings
3. `wasm-pack build --target bundler --out-dir pkg` — succeeds
4. `pnpm run build` in extension/ — succeeds
5. Update this status document
6. Commit: `git add && git commit -m "Phase 3: End-to-end WASM integration verified"`
7. **STOP and wait for user approval**

---

## Agreements Made
- Package manager: pnpm (user specified)
- Project name: "sarf" / crate name: "sarf-core" (user specified)
- Two layers: Rust crate (native + WASM) and WXT browser extension in TypeScript (user specified)
- Directory structure as specified in plan context

## Explicitly Rejected
- (none yet)

## Issues Encountered
- Phase 2: `tsconfig.json` plan specified `"types": ["wxt/client-types"]` but WXT 0.20.17 generates its own tsconfig at `.wxt/tsconfig.json`. Fixed by using `"extends": "./.wxt/tsconfig.json"` instead.
- Phase 2: pnpm was not installed on system. Installed via `npm install -g pnpm`.
- Phase 3: WXT content scripts build as IIFE format, which does not support top-level await required by WASM. Resolved by removing WASM import from content script (WASM is used in the popup, which runs as an ES module). Content scripts that need WASM results can use messaging to the background worker in the future.
- Phase 3: wasm-pack bundler target produces named exports (`{ init, analyze_word }`), not default exports. Updated popup imports accordingly.
