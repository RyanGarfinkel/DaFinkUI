# JobApplicationTracker

Directory guide for this block. Paths are relative to wherever the block was installed.

## Data flow

All list state lives in `useApplications.ts`. `JobApplicationTracker.tsx` renders from it and calls its actions.

- **Load:** fetches via `fetchApplications()` on mount; `status` is `loading | ready | error`. `loading` shows `TrackerSkeleton` (board- or table-shaped), a skeleton in place of the stat badges, a disabled "+ Add application", and a hidden `role='status'` line. `error` shows a danger `Alert` with "Try again".
- **Mutations are optimistic.** Local state changes first; the API call follows in the background.
  - **Add:** `addDraft()` puts a blank row in the list (local only) and opens the modal. Cancelling or closing calls `discardDraft()`. Saving calls `create`, which POSTs. The client generates the id, so later edits never wait on a server-assigned one.
  - **Edit:** `update(id, patch)`. Table-cell edits are debounced (400ms) and coalesced into one PATCH containing only fields that differ from what the server last confirmed. Modal saves and drag-drops pass `immediate` to skip the debounce.
  - **Drag between stages:** card moves are local while dragging; on drop (or cancel) the final `status` is PATCHed. Dropping back where it started sends nothing.
  - **Delete:** `remove(id)` drops the row and sends DELETE. A 404 counts as success.
- **Failures roll back.** A failed PATCH restores just the fields it carried; a failed POST removes the row; a failed DELETE re-inserts it at its old index. `syncError` drives a dismissible danger `Alert`.

The docs-site routes are `app/api/jobs/route.ts` (GET, POST) and `app/api/jobs/[id]/route.ts` (PATCH, DELETE), backed by an in-memory store in `app/api/jobs/data.ts` that resets on server restart. None of them are installed with the block. They add artificial latency so the skeleton and optimistic updates are visible.

## File map

| File | What's in it | Edit this when you're... |
|---|---|---|
| `JobApplicationTracker.tsx` | Orchestrator: view toggle, drag-and-drop, droppable columns, inline-editable table cells. No props. | ...changing layout or behavior of the tracker itself. |
| `useApplications.ts` | List state, load status, optimistic mutations, rollback, debounced and per-id-serialized sync. | ...changing when or how changes reach the API. |
| `jobsApi.ts` | The only `fetch` calls: `fetchApplications`, `createApplication`, `updateApplication`, `deleteApplication`. | ...pointing the block at your own backend. |
| `TrackerSkeleton.tsx` | Loading placeholder for both views. Columns come from `STAGES`. | ...changing what the loading state looks like. |
| `ApplicationCard.tsx` | `JobApplication` type, `STAGES`, and the draggable card face. | ...adding a field or stage, or restyling the card. |
| `ApplicationDetailsModal.tsx` | The shared details modal used by both views. | ...changing the fields that don't fit inline. |

## Gotchas

**Reordering within a column is not persisted.** There is no order field on `JobApplication`, so `arrayMove` in `handleDragEnd` is local only and the order resets on reload. To persist it, add a `position` field and send it in the PATCH.

**Writes for one id run strictly in order** (`queues` in the hook). Without that, an edit made right after adding could reach the server before the POST and 404, or two PATCHes could land out of order. Keep new calls going through `enqueue`.

**`draftId` is a ref, not state.** The modal calls `onSave` and then `onOpenChange(false)` in the same tick; with state, close would still see the draft as unsaved and delete the row you just created.

**Cleared fields are sent as `null`**, because JSON drops `undefined`. The PATCH route deletes a key whose value is `null`. Your backend needs the same convention.

**The load effect guards against stale responses** with a `cancelled` flag, and `attempt` is the retry trigger. Don't replace it with a bare `useEffect(() => { fetch... }, [])`, or a slow earlier response can overwrite a newer one.

**Adding a field to `JobApplication`** means updating the sample data in `app/api/jobs/data.ts` too, not just the type.
