# Library / Documents Feature

## Planning
- [x] Read existing codebase (app structure, schema, API routes, layout)
- [x] Write implementation plan

## DB Schema
- [ ] Add `isFavourite`, `isDeleted`, `deletedAt`, `sharedWith` fields to `INote` + `noteSchema`

## API Routes
- [ ] `GET /api/library?view=all|favourites|trash|shared` — filtered note list
- [ ] `PATCH /api/notes/[id]` — already exists; confirm it handles new fields
- [ ] `DELETE /api/notes/[id]` (soft-delete) — update to set `isDeleted=true`

## Components
- [ ] `app/library/layout.tsx` — LibraryLayout with LibrarySidebar + main panel
- [ ] `app/library/page.tsx` — default redirect to /library/documents
- [ ] `app/library/[view]/page.tsx` — dynamic view: documents | favourites | shared | trash
- [ ] `components/library/LibrarySidebar.tsx` — nav: Documents, Favourites, Shared, Trash
- [ ] `components/library/NoteGrid.tsx` — card grid displaying notes
- [ ] `components/library/NoteCard.tsx` — individual note card with actions (favourite, delete, open)

## Navigation
- [ ] Add "Library" link in existing Sidebar.tsx footer area

## Verification
- [ ] Manual: navigate to /library, switch between views, favourite/trash a note
