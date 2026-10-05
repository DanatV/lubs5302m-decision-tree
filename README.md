# Decision Tree Builder

LUBS5302M Foundations of Machine Learning in Business

## Purpose

A self-contained university teaching exercise for business students. Students make their own decision logic explicit when choosing a university for Master's study: variables, root, hierarchy, branch criteria and final outcomes. The app supports construction and checks structure; it never ranks universities, supplies decision rules, assigns weights or scores students.

## Student workflow

1. **Factors:** review the five provided factors. Optionally add, rename or delete up to three personal factors. Using every factor is not required.
2. **Root:** choose the factor to consider first. Changing it later preserves all branches after an explanatory confirmation.
3. **Build:** select the root, add a branch and enter a criterion in your own words. Use **What happens next?** to choose another decision or enter an outcome. Repeat for each route. A decision needs at least two branches to be structurally complete. Drafts may have missing criteria or targets.
4. **Review:** inspect the tree and its summary. Optional reflection responses are saved and included in print/JSON exports.

**Check My Tree** reports structural omissions only. Reusing factors is allowed. Use Undo/Redo for the last 20 meaningful edits. Factor/response typing is grouped as one edit when leaving the field.

Select nodes directly or use the keyboard-editable outline. Move a non-root decision and its descendants to an empty branch with **Move node**. Its previous branch remains incomplete; define a new next step there or delete that branch. Destinations within the moved subtree are excluded to prevent cycles. Change branch order using Up/Down. Used custom factors must be replaced in the tree before deletion; the app explains this.

Zoom controls, Fit tree, native scrolling and optional full screen help explore larger trees. Review includes a read-only text outline. The Export menu provides PNG, SVG, JSON and **Print / Save as PDF**. Exports are allowed for incomplete trees too.

## Running locally

Download or copy this entire folder, preserving `css/` and `js/`, and open **index.html** in a modern browser. Enable JavaScript. No npm, Node.js, installation, internet connection or local server is needed for normal use. Classic scripts and relative paths support `file://` operation.

Browser policies differ for local-file storage. If storage is unavailable, editing and exports still work and a notice explains that work will not persist. Use GitHub Pages for a consistent classroom URL.

## GitHub Pages deployment

1. Create or select a GitHub repository.
2. Add the application files, keeping `index.html`, `css/` and `js/` together. Putting the app at the repository root gives the simplest URL.
3. Commit and push to the main branch.
4. Open repository **Settings**.
5. Open **Pages**.
6. Select deployment from the relevant branch (usually main).
7. Select the repository root if appropriate. Alternatively, place the complete app in `/docs` and select that folder.
8. Save.
9. Use the generated GitHub Pages URL with students after deployment finishes.

If the app is in a subdirectory of the published source, append that directory to the Pages URL. All asset links are relative. No Actions workflow, environment variables or backend are needed. These are deployment instructions; this project has not been published to a repository on your behalf.

## Data and privacy

Student data stays in that student's browser, in `localStorage` under `masters-decision-tree-v1`. The app contains no analytics, remote fonts, external scripts, API calls, accounts, database or submission mechanism. Changes save automatically; a returning student chooses whether to continue or replace saved work. Reset requires confirmation.

Storage is scoped to the browser profile and origin, not to a student identity. Students using separate devices/profiles do not share data. People sharing the same browser profile and URL can access the same saved exercise. Different copies hosted on the same origin share the storage key unless a lecturer changes it. Moving to a different URL/origin or clearing browser data may make previous work unavailable. Only one working exercise per browser/origin is stored; avoid editing it in multiple tabs, where the latest save wins.

JSON exports include all state and reflections; they are downloadable records, not an import/restore feature. The app's ongoing restore mechanism is localStorage. PNG/SVG contain only the visual tree. Print includes the title, tree, structural status, summary, optional reflection responses and generation date.

Approximately 100 simultaneous students require only static file delivery by GitHub Pages. Each browser runs its own independent code and stores its own state; there is no shared mutable application server state.

## Customisation

- **Default factors:** edit the `provided` array at the beginning of `js/model.js`. Keep stable IDs when changing wording. Changing IDs can invalidate existing saved trees.
- **Maximum custom factors:** edit `maxCustom` in `js/model.js`. Counter and limit derive from this value.
- **Instructions and title:** edit `index.html`; stage-specific guidance lives in `js/app.js`.
- **Reflection questions:** edit `questions` in `js/model.js`. Responses are indexed by question position, so changing their order changes the interpretation of existing responses.
- **Banner:** replace `assets/banner.png` and update its alternative text in `index.html` if the course changes. The supplied image is displayed in full without cropping.
- **Colours and branding:** edit CSS custom properties at the top of `css/styles.css` and header branding in `index.html`. SVG export colours live in `js/tree.js`, so update those too if needed, maintaining contrast.
- **Independent exercise copies:** change `KEY` in `js/app.js` to isolate saved work on the same origin.

Student-facing labels are escaped before insertion into HTML/SVG. Factor names are capped at 100 characters; criteria and outcomes at 240, with wrapping. Reflections are unrestricted. Keep replacements pedagogically neutral: do not add suggested thresholds, outcome defaults, rankings or weights.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the design documented before implementation.

- `index.html`: page shell, stage navigation and shared controls.
- `css/styles.css`: responsive styling, focus states, modal and print layout.
- `js/model.js`: configuration, serializable model, safe subtree mutations, saved-state checks and structural validation.
- `js/tree.js`: deterministic SVG tree layout, label escaping/wrapping and summary.
- `js/export.js`: native Blob downloads, SVG-to-canvas PNG and print content.
- `js/app.js`: workflow, editing, undo/redo, dialogs and localStorage.
- `tests/test.cjs`: development-only tests for model and application handlers using a small DOM test double.

The authoritative state is separate from the DOM. Nodes own ordered branch IDs; branches reference a decision, leaf or empty draft. Snapshot history is in memory and is not retained after reopening. The root factor can be changed without deleting existing logic.

## Dependencies

**None at runtime.** Rendering uses SVG; image export uses browser Canvas; downloads use Blob URLs; printing uses the browser print dialogue. No CDN, package manager or third-party library is required.

Development tests can optionally run with Node.js (`node tests/test.cjs`), using built-in modules only. Node is not needed to use or publish the app.

## Testing and limitations

See [TESTING.md](TESTING.md) for checks, evidence and unverified browser behaviour.

- Restructuring uses menus/buttons, not drag-and-drop.
- Very wide trees are reduced to fit the printable page and may have small labels. SVG retains resolution for enlargement; PNG dimensions are capped to avoid excessive canvas memory.
- Full screen and local-file storage availability depend on the browser.
- Native browser downloads, print dialogues, real keyboard navigation, 200% zoom and cross-browser interactions still need a classroom smoke test: this environment's browser security policy prevented opening the local app.
- No JSON import, collaboration, teacher collection, university data or automated decision logic is included.

## License

MIT; see [LICENSE](LICENSE).
