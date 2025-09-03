# Simple Notes App (React + Supabase)

Features
- Create, edit, delete, list, and search notes
- Supabase authentication (email/password and OAuth)
- Minimalistic light theme with primary #1976d2, secondary #424242, accent #ffd600
- Layout: sidebar list + main editor

Getting started
1) Copy .env.example to .env and fill:
   REACT_APP_SUPABASE_URL=
   REACT_APP_SUPABASE_KEY=
   # optional
   # REACT_APP_SITE_URL=https://yourapp.com

2) Ensure Supabase Auth redirect URLs include:
   http://localhost:3000/**
   https://yourapp.com/**

3) Install and run:
   npm install
   npm start

Routes
- /signin — sign-in form with email/password and OAuth
- /auth/callback — handles Supabase auth redirect
- /auth/error — shows auth error message
- / — protected notes UI

Files of interest
- src/utils/supabase.js — Supabase client (uses env vars)
- src/services/notesService.js — CRUD operations
- src/NotesApp.js — UI + routing
- src/theme.css — styling
