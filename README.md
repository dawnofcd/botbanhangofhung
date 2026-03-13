# Tai Nguyen Hero (Railway + PostgreSQL)

## Goal
Run Telegram sales bot on Railway (long polling) and store data in PostgreSQL.

## Required environment variables
- `TELEGRAM_TOKEN`
- `DATABASE_URL`

Optional:
- `PGSSL` (`true` by default)
- `ADMIN_TELEGRAM_IDS`
- `ADMIN_SECRET_KEY`
- `MMOBANK_ACCOUNT_NO`

Optional:
- `MMOBANK_WEBHOOK_PATH` (default: `/mmobank/webhook`)
- `MMOBANK_SECRET_KEY`
- `MMOBANK_BANK_CODE`
- `MMOBANK_ACCOUNT_NAME`
- `ADMIN_DASHBOARD_KEY` (default fallback: `ADMIN_SECRET_KEY`)
- `ADMIN_DASHBOARD_PATH` (default: `/admin`)
- `ADMIN_DASHBOARD_SESSION_TTL_SECONDS` (default: `43200`)

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
3. In Railway Variables, set:
   - `TELEGRAM_TOKEN`
   - `DATABASE_URL`
   - `PGSSL=true` (set `PGSSL=false` only for local non-SSL DB)
   - `ADMIN_TELEGRAM_IDS` (optional)
   - `ADMIN_SECRET_KEY` (optional)
   - `MMOBANK_ACCOUNT_NO`
   - `MMOBANK_WEBHOOK_PATH` (optional, default `/mmobank/webhook`)
   - `MMOBANK_SECRET_KEY` (optional)
   - `MMOBANK_BANK_CODE` (optional)
   - `MMOBANK_ACCOUNT_NAME` (optional)
   - `PAYMENT_TIMEOUT_SECONDS` (optional, default `60`)
   - `ORDER_EXPIRY_SWEEP_INTERVAL_MS` (optional, default `15000`, min `5000`)
   - `ADMIN_DASHBOARD_KEY` (optional but recommended for dashboard)
   - `ADMIN_DASHBOARD_PATH` (optional, default `/admin`)
   - `ADMIN_DASHBOARD_SESSION_TTL_SECONDS` (optional, default `43200`)
4. Start command: `npm start` (already in `railway.json`).
5. Redeploy and check logs for `Bot launched.`

## Admin dashboard (web)
- URL mặc định: `/admin` (có thể đổi bằng `ADMIN_DASHBOARD_PATH`)
- Đăng nhập bằng `ADMIN_DASHBOARD_KEY` (hoặc fallback `ADMIN_SECRET_KEY`)
- Chức năng v1:
  - Quản lý đơn hàng (đổi trạng thái trực tiếp)
  - Quản lý sản phẩm (sửa giá/tồn/bật tắt)
  - Quản lý kho account (xem preview, thêm account, sync tồn kho)

## MMOBank webhook setup
1. Deploy bot, then get your public app URL from Railway.
2. Set webhook URL in MMOBank to:
   - `https://<your-app>.up.railway.app/mmobank/webhook`
   - If you changed `MMOBANK_WEBHOOK_PATH`, use that path instead.
3. If configured, MMOBank will call this endpoint with header `secret-key: <MMOBANK_SECRET_KEY>`.
4. Bot auto-marks order as `paid` when transfer content contains the order code `DH...`, amount is valid, and account number matches `MMOBANK_ACCOUNT_NO` (when provided).

## Available bot functions
- User: `/start`, Danh muc, Lich su, Ho tro, Ngon ngu, Dat ngay.
- Admin: `/admin`, `/claimadmin`, Don moi, cap nhat trang thai don, bat/tat san pham, thong ke.
- Admin utility: `/notify`, `/broadcast`.

## Admin guide
- See `docs/admin_guide.md`

## Notes
- Keep only one running instance when using long polling.
- SQL file names still use `supabase_*` for backward compatibility, but they are standard PostgreSQL scripts.
