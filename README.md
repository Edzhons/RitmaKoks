# RitmaKoks

RitmaKoks is a Latvian-language music education platform for schools, teachers, and students. Its main learning activity is Skanošie žesti: students follow a song and perform the corresponding gestures in time.

## Project structure

- `backend/` — Laravel REST API
- `frontend/` — Vue 3 single-page application with Bootstrap 5 and custom responsive styles

The initial database design is documented in [backend/database/README.md](./backend/database/README.md). The responsive, theme-aware frontend includes Skanošie žesti, where a teacher can upload a song, record beat-based gesture cues, set the tempo and time signature, and present them in a large left-to-right sequence. The current beat is highlighted; empty beats are shown as pauses. Krāsainās notis and the instrument activity are separate planned areas.

## Development roadmap

We complete and verify one milestone before moving to the next. Each finished milestone is recorded in Git as its own commit.

- [x] **01 — Project setup:** Laravel API, Vue/Vite frontend, local development configuration, and initial test/build checks.
- [x] **02 — Database architecture:** users and roles, rhythm and melody composition schema, categories, relationships, soft deletes, seed data, and schema documentation.
- [x] **03 — UI foundation:** responsive Latvian application shell, rhythm-first landing page, navigation, shared layout, and light/dark themes.
- [x] **04 — Authentication and permissions:** Sanctum cookie-based sessions, registration/login/logout/password reset, regular/admin authorization, and a separate account area in the header.
- [x] **05 — Reusable CRUD foundation:** authenticated rhythm and melody composition API conventions, request validation, owner authorization, category filtering, search, pagination, asynchronous frontend CRUD state, and soft-delete/restore workflows.
- [x] **06 — Skanošie žesti:** private song uploads, timed clap/foot/snap cues, synchronized highlighting, personal exercise saving, and presentation mode.
- [ ] **07 — Krāsainās notis:** separate melody composer with note durations, rests, color choices, playback, and saved compositions.
- [ ] **08 — Mūzikas instrumenti:** a separate song-following activity with timed cues for classroom instruments such as sticks and triangle.
- [ ] **09 — Library:** personal and public works, search and filters, categories, publishing, previews, and independent attributed copies.
- [ ] **10 — Admin panel:** user management, moderation, category/icon management, deleted-work restoration, and activity logs.
- [ ] **11 — Testing and security:** broader backend/frontend coverage, permissions, validation, upload restrictions, accessibility, and bug fixes.
- [ ] **12 — Deployment and documentation:** repeatable deployment to the planned Hetzner EU VPS using Ubuntu LTS, Nginx, PHP-FPM, static Vue assets, and private MySQL; Cloudflare DNS/proxy, auto-renewed HTTPS, secrets management, backups and restore, monitoring, secure SSH/firewall, migrations, and rollback documentation. No infrastructure or paid services are to be introduced during development.

**Next:** Step 07, Krāsainās notis. Deployment remains the final milestone.

## Requirements

- PHP 8.3 or newer
- Composer
- Node.js 22.18+ or 24.12+
- npm
- MySQL 8

On Windows with Laragon, make sure the selected PHP and Composer folders are available on `PATH`. Reopen VS Code after changing `PATH` so new terminals inherit it.

## Run locally

In one terminal, start the Laravel development server:

```powershell
cd backend
composer install
php artisan serve
```

In another terminal, start the Vue development server:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite to view the frontend.

The UI includes a responsive navigation shell, a persistent light/dark theme switch, and Latvian account registration, sign-in, sign-out, and password-reset pages. Skanošie žesti is available at `/sound-gestures` (`/rhythm-studio` redirects there); Krāsainās notis is the next planned milestone.

Authenticated CRUD API and frontend conventions are documented in [backend/README.md](./backend/README.md). Gesture cues are stored as versioned JSON, while each private audio upload is stored outside the public web root and streamed only to its owner or an administrator.

## Authentication (local development)

Laravel Sanctum uses same-site session cookies for the Vue SPA; browser credentials and session tokens are not stored in `localStorage`. Keep the Vite and Laravel hosts consistent (`localhost` with `localhost`, or `127.0.0.1` with `127.0.0.1`). The backend `.env.example` lists both local frontend origins; copy those values into `backend/.env` if its settings differ:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
FRONTEND_ALT_URL=http://127.0.0.1:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost,127.0.0.1
```

Run `php artisan migrate` in `backend/` before using accounts. For local password resets, the default `MAIL_MAILER=log` writes the message and reset link to `backend/storage/logs/laravel.log`. Set a working mail transport in `backend/.env` for real delivery. New public accounts always receive the regular user role. To promote a user for development, use the trusted Laravel Tinker console (`php artisan tinker`) and run:

```php
App\Models\User::where('email', 'teacher@example.com')->firstOrFail()
    ->forceFill(['role' => App\Enums\UserRole::Admin])
    ->save();
```

Never expose role assignment through public registration or client-controlled data.

## Database

Create a local MySQL database named `ritmakoks` and configure `backend/.env` with your MySQL credentials. Then run migrations and seed the default category:

```powershell
cd backend
php artisan migrate --seed
```

See [backend/database/README.md](./backend/database/README.md) for the schema diagram and local database commands.

## Run tests

```powershell
cd backend
php artisan test
```

```powershell
cd frontend
npm run test:unit -- --run
```
