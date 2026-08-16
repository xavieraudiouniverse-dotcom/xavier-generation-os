# PR: feat(director): add UI Director prototype

This PR introduces a UI-only prototype for the Director feature. It includes a modal with multiple suggestion variants, a client-side change patch engine with undo, and a demo route that integrates with the timeline redesign.

## What's included
- Director modal (Variants / Timeline Preview / JSON Plan)
- Variant cards with Preview / Apply / Undo actions (3 default variants)
- ChangePatchEngine: client-side patch application and undo
- Demo route: /director-demo showcasing the modal with the timeline demo
- Styles for the Director modal and variants

## How to review
1. Checkout the branch: `git fetch && git checkout feat/director-proto`
2. Install and run: `npm install && npm run dev`
3. Open: `http://localhost:5173/director-demo`
4. Open the Director modal and test the variants (Preview, Apply, Undo) and JSON Plan download.

## QA checklist
- [ ] The modal opens and displays three variants
- [ ] Preview shows a mock preview (alert)
- [ ] Apply adds a patch to the Applied patches list
- [ ] Undo removes the last applied patch
- [ ] JSON Plan shows and downloads correctly
- [ ] Modal is keyboard accessible and respects reduced-motion

---

Please review and merge into `main` when ready.
