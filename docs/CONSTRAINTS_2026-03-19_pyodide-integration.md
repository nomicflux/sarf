# Constraints — 2026-03-19 Pyodide Integration

## Technical Constraints
- "Replace the localhost CAMeL backend with Pyodide running in an offscreen document"
- "AlKhalil remains as fallback"
- "Bundle all three dialect DBs (Gulf=8MB, MSA=40MB, Egyptian=67MB) gzip-compressed"
- Offscreen document as plain JS in `public/` — not processed by Vite/WXT
- Dialect mapping: `{ egy: 'egy', gulf: 'gulf', lev: 'msa' }`
- Lazy DB loading per dialect
- `DecompressionStream('gzip')` for runtime decompression
- 30s timeout on first Pyodide call (init + packages + DB)
- CSP: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'`

## Rejected Approaches
- Localhost Python server for CAMeL (architecturally invalid for extension)
