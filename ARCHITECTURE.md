# Architecture

1. Files: `index.html`, `css/styles.css`, and classic scripts `js/model.js`, `js/tree.js`, `js/export.js`, `js/app.js`. Classic scripts work directly over file:// without a server. Documentation and an MIT license accompany the app.
2. State: one serializable exercise contains custom factors, root ID, decision-node and branch maps, leaf map, reflections, and metadata. Provided factors are configuration. View state (stage, selection, zoom) is separate.
3. Decision nodes: ID, factor ID and ordered outgoing branch IDs. The root is a normal decision node referenced by root ID.
4. Branches: ID, source node ID, student-written criterion and optional target ID/type. Empty targets are legitimate drafts.
5. Leaves: ID and student-written outcome label.
6. History: snapshots before each meaningful change; 20 undo and redo entries. Restoring a snapshot also saves it.
7. Persistence: versioned JSON in localStorage after mutations, with a restore/new dialog at startup and graceful storage failure. No network calls.
8. Visualization: native SVG; recursively allocate non-overlapping subtree widths, lay out levels top to bottom, wrap text, label connectors in reserved space. Native scroll and zoom controls; buttons and an HTML outline provide accessible editing alternatives.
9. Export: standalone SVG, SVG-to-canvas PNG, JSON Blob download, and a dedicated print layout with the full tree, summary, reflections and date. No external libraries.
10. Validation: root, branch count, missing criteria/targets/outcomes/factors, disconnected objects and cycles. Moves are restricted to empty branches outside the moved subtree. Root changes replace its factor while preserving all branches; the confirmation explains this. Delete operations explicitly confirm subtree removal. Custom-factor deletion is prevented while referenced, with directions to replace usages first.

Restructuring uses explicit menus rather than drag-and-drop. Moving a subtree leaves its former branch incomplete and attaches it to a selected empty branch. Branch order can be changed with up/down controls. These operations keep a single-parent tree and preserve student-authored logic.
