# DoAn_NNPTUD - Backend Starter (RESTful, Node.js + Express + MongoDB)

## Features
- Authen/Autho (JWT + role/permission checks)
- RESTful endpoints (CRUD) for core resources
- File upload (avatar, documents, submissions)
- Soft delete (default) via `isDeleted`

## Requirements
- Node.js (>= 18)
- MongoDB

## Setup
1. `npm install`
2. Copy `.env.example` -> `.env`
3. (Optional) enable seeding: set `SEED_DEFAULTS=true`
4. Run: `npm run dev`

## Base URL
- API: `http://localhost:3000/api/v1`

## Notes
- Upload files are stored under `uploads/` and returned as `fileUrl`.
- `.env` is ignored by Git (see `.gitignore`).

