# Testing and review

Date: 22 September 2026.

## Automated verification

Run `node tests/test.cjs` for the development-only checks. Normal app use requires no Node. Sixteen synchronous test groups and one asynchronous export group pass. Tests use actual model/rendering/application code, Node's built-in VM/assert modules, and a minimal DOM/localStorage test double. They exercise state changes and event handlers, not a browser engine.

| Requested scenario | Evidence / result |
| --- | --- |
| A — provided factors only | Complete tree using provided factors passes; using every factor is not required. |
| B — three optional factors | Add handler caps at three even on a fourth invocation. Empty factor validation, renaming and field-level undo/redo pass. |
| C — delete a custom factor | Deletion and undo/redo pass. Code review confirms used factors are protected with replacement instructions. |
| D — change root after building | Confirmed factor change retains branch/leaf records; undo and redo restore the expected root. |
| E — more than two branches | Three and larger branch sets supported; reorder handler tested. |
| F — incomplete branch | Empty criterion and missing target each produce neutral actionable validation messages. |
| G — subtree deletion | Descendants removed, incoming branch becomes incomplete, no orphan objects; undo restores subtree. |
| H — reload/restore | Serialized saved state feeds a new application instance; Continue restores it. Cancelled new-tree confirmation retains existing branches. Storage failure does not stop app initialization. A real browser reload remains unverified. |
| I — export | JSON round trip, SVG escaping, Blob export handlers, complete print HTML including escaped reflections and date pass. Native PNG/download/print-dialog interactions remain unverified. |
| J — large tree | 15 decisions plus 16 leaves / 30 branches pass validation. All 31 node rectangles are checked pairwise for overlap. SVG parsed and rasterized successfully; image visually inspected. |
| K — repeated factor | Structurally complete tree with repeated factor passes; non-blocking warning reviewed in UI code. |
| L — cycle attempt | Move into own subtree throws before mutation. Valid move preserves descendants and leaves old branch incomplete. A deliberately malformed cycle is detected and rejected on restore. |
| M — keyboard controls | Source audit: native buttons/forms/dialogs, Enter/Space SVG activation, editable HTML outline, read-only review outline and focus handling. Actual keyboard-only navigation remains unverified. |

Additional checks: empty outcomes, disconnected objects, malformed saved connections, 20-action history limit, immediately persisted reflection typing, escaping potentially executable markup, long wide-glyph labels, syntax parsing, relative asset references, absence of runtime dependencies or network requests.

Small and large exported SVGs were parsed as XML, rendered with a development-only image tool, and visually inspected. Nodes and branch labels occupy separate vertical bands and sibling subtrees reserve separate horizontal space. This checks the exported drawing independently of browser UI layout. Development tools are not shipped as app dependencies.

## Issues corrected during review

- Cancelling “Start a new tree” now retains the saved state.
- Startup continuation dialog cannot silently close with Escape.
- Node actions restore keyboard focus after workspace replacement; dialog-close handling provides a focus fallback.
- Workspace scroll position is preserved during edits.
- Zoom buttons have descriptive accessible names.
- Review has a full text tree for assistive technology.
- Conservative glyph-width wrapping handles wide letters and Unicode without clipping labels to a fixed character count.
- Bad stored connections are checked before restoration.
- Selected nodes have a visible outline and selection state.

## Accessibility audit

Source review covers explicit input labels, live status/error regions, native modal focus containment, Cancel and Escape for editing dialogs, non-colour node distinctions, visible focus, keyboard alternatives for all structural operations, resizable text areas, responsive single-column layout below 760px and scrollable large trees. Review hides editing controls but retains a text representation of all routes. No hover-only essential functions or drag requirement exist.

The main foreground/background combinations were reviewed for contrast (dark text on white, white primary-button text on dark teal). Small metadata and diagram captions are supplemental; node labels can be enlarged with zoom. Full screen is optional and has an unavailable-browser fallback.

**Not a certification:** screen-reader output, browser keyboard focus restoration, tablet interaction, native full screen, 200% browser zoom and print pagination have not been manually verified in a browser.

## Browser testing limitation

The available browser tool rejected the local `file://` URL under its security policy. Chrome was also unavailable. No alternate browser surface or URL workaround was used. Therefore the app has not been opened interactively in this environment; no browser-console or real download/print verification is claimed.

Before class, perform this smoke test in the intended browser:

1. Open `index.html`, then repeat at the eventual GitHub Pages subdirectory URL.
2. Build a two-branch tree, deliberately leave a criterion blank and run Check My Tree. Fill both routes with student-written outcomes and check again.
3. Change the root; cancel, then apply. Verify branches remain. Undo and redo.
4. Add another decision, move it to an empty sibling branch, delete its subtree and undo.
5. Refresh and Continue; confirm the same tree and reflection responses appear.
6. Download PNG, SVG and JSON. Open the images/JSON and verify complete content. Use Print / Save as PDF and inspect summary/reflections/date.
7. Use Tab, Shift+Tab, Enter, Space and Escape through stages, dialogs, outline and exports. Check visible focus and return focus.
8. At 200% browser zoom and tablet width, confirm controls reflow, text remains readable and the tree scrolls within its own panel.
9. Check developer console for errors and verify no network requests beyond static app assets.

## Pedagogical audit

Reviewed all provided values, placeholders, help, dialogs, validation, review content and automated behaviour:

- Only the requested five factor names are prefilled.
- No root or next-decision factor is preselected for new decisions.
- Criterion and outcome fields start empty; placeholders describe the input without supplying substantive examples.
- No recommended universities, thresholds, categories, rankings, numerical weights, quality scores or generated rules.
- Fewer than five factors, no custom factors, repeated factors, and unfinished drafts are allowed.
- Students determine the branch count, ordering, factors, criteria and outcomes.
- Structural completeness requires two branches per decision and a labelled outcome at the end of every route; it does not assess logic quality, overlap or exhaustiveness of student criteria.
- Reflection is optional; exports are never gated on it or on structural completeness.
- Moving, deleting or changing the root never silently generates replacement logic. Explanations describe exactly what is retained or removed.
- Machine-learning explanation is optional, makes the manual/algorithmic distinction and contains no unnecessary mathematics.
- Test fixtures contain only synthetic generic labels and are not loaded by the app.

## Final engineering review

A single serializable state is the source of truth. Native browser features avoid library-loading failures. No modules/fetch/build steps interfere with local-file use. Destructive structural edits require explanations and support undo. SVG exports are independent of current scroll/zoom and omit editing controls. PNG size is bounded to limit canvas memory. All student-supplied HTML/SVG text is escaped. Persistence errors produce a visible fallback notice.

No shared server state exists. Approximately 100 students on independent browsers/profiles do not interfere with one another. Shared browser profiles or multiple tabs on the same origin share one localStorage key, as documented. GitHub Pages publishing itself was not performed or tested. Very large trees may be small on a single printed page; SVG is the scalable alternative.

## Course branding update — 5 October 2026

Applied the supplied course banner as a local, uncropped responsive image; updated the course line and application title; removed the requested subtitle, slogan and About sentence. Replaced the teal palette with coral, charcoal and warm neutrals. Increased interface, print and SVG font sizes and expanded node dimensions/line spacing accordingly.

Re-ran all 17 existing automated test groups successfully, including large-tree overlap checks and export handlers. Verified all relative assets, including the banner. Rendered and visually inspected the updated SVG. Checked contrast ratios: white primary-button text 6.38:1, muted body text 6.39:1, course heading on charcoal 9.51:1. No new live browser verification is claimed; the previously documented browser limitation remains.
