# Tai nguyen By DawnMmo (Railway + PostgreSQL)

## Goal
Run Telegram sales bot on Railway (long polling) and store data in PostgreSQL.

## Required environment variables
- `TELEGRAM_TOKEN`
- `DATABASE_URL`

## Optional environment variables
- `PGSSL` (`true` by default)
- `ADMIN_TELEGRAM_IDS`
- `ADMIN_SECRET_KEY`
- `ADMIN_DASHBOARD_KEY` (default fallback: `ADMIN_SECRET_KEY`)
- `ADMIN_DASHBOARD_PATH` (default: `/admin`)
- `ADMIN_DASHBOARD_SESSION_TTL_SECONDS` (default: `43200`)
- `SEPAY_API_KEY`
- `SEPAY_ACCOUNT_NO`
- `SEPAY_BANK_CODE`
- `SEPAY_ACCOUNT_NAME`
- `SEPAY_WEBHOOK_PATH` (default: `/sepay/webhook`, only path, not full URL)
- `PAYMENT_TIMEOUT_SECONDS` (optional, default `300` = 5 minutes)
- `ORDER_EXPIRY_SWEEP_INTERVAL_MS` (optional, default `15000`, min `5000`)
- `BOT_DISPLAY_NAME` (default: `Tai nguyen By DawnMmo`)
- `BOT_DESCRIPTION`
- `BOT_SHORT_DESCRIPTION`
- `SUPPORT_SHOP_NAME` (default fallback: `BOT_DISPLAY_NAME`)

## Database setup
1. Open your PostgreSQL SQL console/tool.
2. Run `docs/supabase_schema.sql`.
3. Run `docs/supabase_seed.sql`.

Or use script:
- `npm run db:init` (schema only)
- `npm run db:init:seed` (schema + seed)

If using Railway internal host (`*.railway.internal`), run the command inside Railway runtime (service shell or deploy command).

## Local run
1. `npm install`
2. Fill `.env`
3. `npm start`

## Deploy on Railway
1. Push this repo to GitHub.
2. Railway -> New Project -> Deploy from GitHub repo.
3. In Railway Variables, set at least:
   - `TELEGRAM_TOKEN`
   - `DATABASE_URL`
   - `SEPAY_ACCOUNT_NO`
   - `SEPAY_API_KEY` (recommended)
4. Start command: `npm start` (already in `railway.json`).
5. Redeploy and check logs for `Bot launched.`

## Admin dashboard (web)
- Default URL: `/admin` (can be changed by `ADMIN_DASHBOARD_PATH`)
- Login key: `ADMIN_DASHBOARD_KEY`

## Sepay webhook setup
1. Deploy bot and get public app URL from Railway.
2. Set Sepay webhook URL to:
   - `https://<your-app>.up.railway.app/sepay/webhook`
   - If changed, use `SEPAY_WEBHOOK_PATH`.
3. Send one of these headers with your key:
   - `secret-key: <SEPAY_API_KEY>`
   - `x-api-key: <SEPAY_API_KEY>`
   - `api-key: <SEPAY_API_KEY>`
   - `Authorization: Bearer <SEPAY_API_KEY>`
4. Bot auto-marks order as `paid` when:
   - transfer content contains order code `DH...`
   - transfer amount is valid
   - account number matches `SEPAY_ACCOUNT_NO` (when configured)

## Available bot functions
- User: `/start`, `/menu`, `/orders`, `/me`, `/help`
- Admin: `/admin`, `/claimadmin`, product/order management, reports

## Admin guide
- See `docs/admin_guide.md`

## Notes
- Keep only one running instance when using long polling.
- SQL file names still use `supabase_*` for backward compatibility, but they are standard PostgreSQL scripts.
