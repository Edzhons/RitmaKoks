# RitmaKoks

RitmaKoks is a Latvian-language music education platform for schools, teachers, and students. Its central learning area is the rhythm studio, supported by tools for creating rhythm exercises and musical compositions.

## Project structure

- `backend/` — Laravel REST API
- `frontend/` — Vue 3 single-page application with Bootstrap 5 and custom responsive styles

The initial database design is documented in [backend/database/README.md](./backend/database/README.md). The frontend provides a responsive Latvian-language, theme-aware application shell with the rhythm studio presented as its main learning area. Account authentication is now available; rhythm and melody editing and the full library remain planned for later roadmap steps.

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

The UI foundation includes a responsive navigation shell, a persistent light/dark theme switch, and Latvian account registration, sign-in, sign-out, and password-reset pages. The rhythm and melody editor cards are intentionally marked as upcoming work.

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
