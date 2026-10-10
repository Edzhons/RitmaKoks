# RitmaKoks

RitmaKoks is a Latvian-language music education platform for schools, teachers, and students. Its central learning area is the rhythm studio, supported by tools for creating rhythm exercises and musical compositions.

## Project structure

- `backend/` — Laravel REST API
- `frontend/` — Vue 3 single-page application with Bootstrap 5 and custom responsive styles

The initial database design is documented in [backend/database/README.md](./backend/database/README.md). The frontend provides a responsive Latvian-language, theme-aware application shell with the rhythm studio presented as its main learning area. Rhythm and melody editing, authentication, and the full library are planned for later roadmap steps.

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

The UI foundation includes a responsive navigation shell, a persistent light/dark theme switch, and starter pages. The rhythm and melody editor cards are intentionally marked as upcoming work.

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
