# RitmaKoks

RitmaKoks is a web-based music education platform for creating rhythm exercises and musical compositions.

## Project structure

- `backend/` — Laravel REST API
- `frontend/` — Vue 3 single-page application

The database schema and application features are intentionally deferred to later roadmap steps.

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

## Run tests

```powershell
cd backend
php artisan test
```

```powershell
cd frontend
npm run test:unit -- --run
```
