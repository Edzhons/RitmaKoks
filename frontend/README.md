# RitmaKoks frontend

The RitmaKoks frontend is a Vue 3 single-page application built with Vite, Vue Router, Pinia, Bootstrap 5, and custom responsive styles.

## Run locally

```powershell
npm install
npm run dev
```

## Check the frontend

```powershell
npm run build
npm run test:unit -- --run
npm exec eslint -- .
```

The UI foundation includes responsive navigation, reusable studio cards, and a light/dark theme preference saved in the browser. The rhythm and melody editors and full library are planned for later roadmap steps.

Authentication is provided by the Laravel API through Sanctum session cookies. Start the backend at `http://localhost:8000` and the Vite server at `http://localhost:5173`; set `VITE_API_BASE_URL` in a local `.env` file only if the backend uses a different URL. The frontend requests Sanctum's CSRF cookie before state-changing requests and does not persist credentials or session tokens in browser storage. Registration, sign-in, sign-out, and password reset are available in Latvian.
