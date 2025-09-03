IMPORTANT: Supabase Configuration Required

1) Environment variables (notes_frontend/.env)
REACT_APP_SUPABASE_URL=https://rzylvzcogzshyzegvdmo.supabase.co
REACT_APP_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...

Optionally set REACT_APP_SITE_URL to your production domain (e.g., https://yourapp.com). Defaults to http://localhost:3000.

2) Supabase Dashboard
- Authentication > URL Configuration
  - Site URL: your production URL
  - Redirect URLs:
    * http://localhost:3000/**
    * https://yourapp.com/**

3) Auth flows in the app use a dynamic redirect URL from src/utils/getURL.js.
- Add a route or conditional rendering for /auth/callback and /auth/error.

4) Start the app
npm install
npm start

Troubleshooting
- Missing env vars -> auth/db calls will fail; check console warnings.
- Redirect not allowed -> update Supabase redirect allowlist.
