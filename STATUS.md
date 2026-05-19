# Project Status / Handoff

Last updated: 2026-05-19  
Audience: Backend / Frontend / Full-stack / DevOps / DB engineer

---

## 1) Executive summary

SpendSense AI is a monorepo for an AI-assisted personal finance application. It currently has:

- A FastAPI backend in `src/` with `main.py` as the ASGI entry point.
- A React + TypeScript + Vite frontend in `frontend/`.
- A receipt-analysis flow using YOLOv11/Ultralytics for field detection and VietOCR for text extraction.
- A receipt review UI where users can drag OCR tokens into item rows, edit cells inline, and apply the reviewed data as a transaction.
- SQLAlchemy async database setup targeting PostgreSQL through `DATABASE_URL`.

Current development state:

- **Implemented:** Backend route wiring, CORS regex for local Vite ports, auth routes, SQLAlchemy models for users/receipts/receipt items/transactions, YOLO detection integration, Hugging Face model download support, VietOCR field OCR, receipt row reconstruction, receipt analysis API, frontend upload/camera receipt flow, receipt review UI, transaction create/list APIs.
- **Partially implemented:** Transaction persistence works for reviewed receipt items, but the schema is still basic and uses `Float` for money/quantity. Dashboard/analytics pages still use mock data. ChromaDB semantic cache is present but disabled by default.
- **Not implemented:** Alembic migrations, production deployment, real login UI, category table, transaction item table separate from receipt items, OCR token persistence, SQL-backed insight persistence, automated tests.
- **Needs review:** Hugging Face model filename/repo must match the actual uploaded file. Current error `RemoteEntryNotFoundError: 404` means the configured `YOLO_MODEL_FILENAME` does not exist at the configured repo/revision.

The current core receipt-analysis path can run without a database. Database is only required when authentication or transaction persistence endpoints are used.

---

## 2) Project architecture

### Frontend

Status: **Partially implemented**

Location: `frontend/`

Important files:

- `frontend/src/main.tsx` - React entry point.
- `frontend/src/App.tsx` - Route definitions.
- `frontend/src/components/layout/AppLayout.tsx` - Shared app shell.
- `frontend/src/components/layout/Navigation.tsx` - Navigation and add-transaction modal trigger.
- `frontend/src/components/AddTransactionModal.tsx` - Main manual transaction and receipt review UI.
- `frontend/src/lib/api.ts` - API client for health, demo auth, receipt analysis, and transaction creation.
- `frontend/src/data/mockData.ts` - Mock data for dashboard, analytics, goals, investments, and settings.
- `frontend/src/pages/*.tsx` - Main pages.
- `frontend/src/index.css` - Global styles, including receipt modal sizing.

Frontend behavior:

- The receipt analysis button calls `POST /receipts/analyze` directly without auth.
- The apply/save action calls `POST /transactions` and still needs auth/database.
- Receipt review displays the original bill image on the left and an editable item table on the right.
- Users can drag tokens into `Tên món`, `SL`, and `Đơn giá`.
- Users can double-click cells to edit inline.
- Quantity supports decimal values such as `0.678`, `1.702`, `0,678`, and `1,702`.
- Item total is computed as `quantity * unit_price` and is not manually editable.

### Backend

Status: **Partially implemented**

Important files:

- `main.py` - FastAPI app creation, lifespan startup, CORS, route registration.
- `src/core/config.py` - Pydantic settings from `.env`.
- `src/db/base.py` - Async SQLAlchemy engine/session.
- `src/db/models.py` - SQLAlchemy models.
- `src/api/schemas.py` - Pydantic request/response DTOs.
- `src/api/routes/auth.py` - Register/login/current user.
- `src/api/routes/receipts.py` - Public receipt image analysis endpoint.
- `src/api/routes/transactions.py` - Authenticated transaction create/list endpoints.
- `src/api/routes/insights.py` - Health and Chroma-backed insight listing.
- `src/api/routes/feedback.py` - Chroma-backed feedback delete/confirm route.
- `src/pipeline.py` - Receipt analysis pipeline orchestrator.
- `src/vision/detector.py` - YOLO/Ultralytics detector with local path or Hugging Face download.
- `src/vision/ocr.py` - VietOCR field OCR.
- `src/vision/reconstructor.py` - Reconstructs item rows from detected/OCR fields.
- `src/embedding/embedder.py` - Deterministic embedding stub.
- `src/llm/gemini_client.py` - Gemini stub.
- `src/cache/vector_store.py` - ChromaDB semantic cache client.

### Database

Status: **Partially implemented**

Target:

- PostgreSQL via SQLAlchemy async engine.
- Default code-level `DATABASE_URL`: `postgresql+asyncpg://spendsense:spendsense@localhost:5432/spendsense`.
- `.env.example` currently shows a local PostgreSQL-style URL that should be replaced with the developer's actual local/Supabase URL.

Implemented SQLAlchemy models:

- `users`
- `receipts`
- `receipt_items`
- `transactions`

Missing:

- Alembic migrations.
- `categories`.
- `transaction_items` separate from `receipt_items`.
- `detected_receipt_tokens`.
- `receipt_review_assignments`.
- SQL-backed `insights`.
- SQL-backed `feedback`.
- Budgets/goals/investment tables.

### AI / OCR / automation modules

Status: **Partially implemented**

Implemented:

- YOLO detection using Ultralytics.
- Hugging Face Hub download support through `huggingface_hub.hf_hub_download`.
- VietOCR text extraction per detected field.
- Reconstruction of item rows using detected `item`, `quantity`, and `price` boxes.
- `store_name` is skipped before OCR and filtered before frontend response.

Still stubbed:

- Gemini insight generation.
- Sentence-transformer embeddings.
- ChromaDB semantic cache is skipped by default through `SEMANTIC_CACHE_ENABLED=false`.

---

## 3) Current feature status

### 3.1 Receipt analysis with YOLO + VietOCR

Current status: **Implemented / needs model config review**

Related files:

- `src/api/routes/receipts.py`
- `src/pipeline.py`
- `src/vision/detector.py`
- `src/vision/ocr.py`
- `src/vision/reconstructor.py`
- `src/api/schemas.py`
- `frontend/src/components/AddTransactionModal.tsx`
- `frontend/src/lib/api.ts`

How it works:

1. Frontend sends `multipart/form-data` image to `POST /receipts/analyze`.
2. This endpoint does not require auth and should not query the database.
3. Backend validates content type: `image/jpeg`, `image/png`, or `image/webp`.
4. `analyze_receipt_details(image_bytes)` runs the pipeline.
5. `detect_receipt()` loads YOLO weights:
   - First from `YOLO_MODEL_PATH` if that local file exists.
   - Otherwise from Hugging Face using `YOLO_MODEL_REPO`, `YOLO_MODEL_FILENAME`, `YOLO_MODEL_REVISION`, and optional `HF_TOKEN`.
6. Ultralytics returns detection boxes.
7. Pipeline filters out `store_name` detections.
8. `extract_receipt()` crops each detected field and runs VietOCR.
9. `reconstruct_receipt()` builds draft receipt items.
10. API returns receipt draft, detected fields, suggested transaction, and stub insight.
11. Frontend displays the bill image and editable rows/tokens.

Current API endpoint:

- `POST /receipts/analyze`

Data flow:

User image -> `AddTransactionModal.tsx` -> `analyzeReceipt(file)` -> `POST /receipts/analyze` -> `detect_receipt()` -> `extract_receipt()` -> `reconstruct_receipt()` -> API response -> review UI.

Known limitations:

- Current Hugging Face error `RemoteEntryNotFoundError: 404` means the configured file is not found at the configured repo/revision.
- `YOLO_MODEL_FILENAME` must exactly match the file path inside the Hugging Face model repo. If the file is in a folder, include that folder path.
- If the Hugging Face repo is private, `HF_TOKEN` must be set.
- First run with Hugging Face requires internet and may be slow while downloading the `.pt` file.
- If detection fails or model is missing, detector can fall back to no detections, which leads to the old stub receipt behavior.

TODO / next steps:

- Confirm the actual Hugging Face file list with:

```powershell
uv run python -c "from huggingface_hub import list_repo_files; print('\n'.join(list_repo_files('khoaaaaa/yolov11s_1', repo_type='model')))"
```

- Update `.env` to match the exact repo filename.
- Add clearer logs for resolved local/HF model path and number of detections.
- Add a test image fixture and a manual verification checklist.

### 3.2 Receipt row reconstruction

Current status: **Implemented**

Related files:

- `src/vision/reconstructor.py`

How it works:

- `item` detections are sorted from top to bottom by `(y, x)`.
- Each item is used as the anchor row.
- Quantity and price are matched only if their y-position is equal to or lower than the item row within the configured band.
- Values above an item are not attached to that item because they likely belong to the previous row.
- If YOLO misses an `item`, the backend creates approximate rows from unused `quantity` and `price` fields named `Món chưa nhận diện`.
- Final draft rows are sorted top-to-bottom by row y-position before returning to the frontend.

Known limitations:

- Reconstruction is heuristic and depends on receipt layout.
- Multi-line item names may still need user correction in the frontend.
- If OCR reads quantity/price poorly, the frontend review step is still required.

### 3.3 Receipt review UI

Current status: **Implemented**

Related files:

- `frontend/src/components/AddTransactionModal.tsx`
- `frontend/src/index.css`

How it works:

- Shows original bill image beside an editable table.
- Shows detected tokens under the item list.
- Users can drag tokens into cells.
- Already assigned tokens can also be dragged again to another cell.
- Double-click edits inline in the cell, not via browser prompt.
- Quantity and unit price edits update row totals automatically.
- `store_name` tokens are filtered out in frontend as a defensive layer.

Known limitations:

- Token assignments are not persisted.
- If the user closes the modal before saving, review state is lost.
- No image is stored, by design.

### 3.4 Transaction creation from reviewed receipt

Current status: **Partially implemented**

Related files:

- `frontend/src/components/AddTransactionModal.tsx`
- `frontend/src/lib/api.ts`
- `src/api/routes/transactions.py`
- `src/api/schemas.py`
- `src/db/models.py`

How it works:

1. User reviews OCR result.
2. User clicks apply/save.
3. Frontend calls `createTransaction()`.
4. API client gets a demo token through `/auth/register`, `/auth/login`, or `/auth/me`.
5. Frontend sends `POST /transactions`.
6. Backend creates a `ReceiptRecord` if receipt items are present.
7. Backend creates `ReceiptItemRecord` rows.
8. Backend creates a `Transaction` linked to the receipt.

API endpoint:

- `POST /transactions`

Known limitations:

- Requires database.
- Requires auth/demo user.
- Uses `ReceiptItemRecord` to store item details; there is no dedicated `transaction_items` table yet.
- Money and quantity use `Float`; PostgreSQL `Numeric` would be safer.
- Transaction list exists but frontend pages still use mock data.

### 3.5 Auth

Current status: **Partially implemented**

Related files:

- `src/api/routes/auth.py`
- `src/auth/service.py`
- `src/auth/dependencies.py`
- `frontend/src/lib/api.ts`

Implemented:

- Register.
- Login.
- Current user.
- JWT bearer auth.
- Frontend demo-token helper for save flows.

Important current behavior:

- Receipt analysis no longer requires auth.
- Transaction save still requires auth because it persists user-owned data.

Known limitations:

- No real login/register UI.
- No refresh tokens.
- No logout.
- Hardcoded demo account is development-only behavior.

### 3.6 Dashboard, analytics, goals, investment, settings

Current status: **Partially implemented**

Related files:

- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/AnalyticsPage.tsx`
- `frontend/src/pages/GoalsPage.tsx`
- `frontend/src/pages/InvestmentPage.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/data/mockData.ts`

How it works:

- These pages render mock data from `frontend/src/data/mockData.ts`.
- They are not connected to transaction APIs yet.

Known limitations:

- No real dashboard data.
- No summary APIs.
- No category breakdown from database.
- No goal/investment/settings persistence.

---

## 4) Backend status

### Server entry point

Status: **Implemented**

- `main.py` creates the app through `create_app()`.
- `app = create_app()` is the Uvicorn target.
- Startup attempts `Base.metadata.create_all`.
- If database is unavailable, startup logs `DB init skipped` and continues. This allows receipt analysis to work without DB.

### Main routes/controllers

Implemented:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /receipts/analyze`
- `POST /transactions`
- `GET /transactions`
- `GET /insights`
- `GET /insights/{insight_id}`
- `POST /feedback/{insight_id}`

### Database access layer

Status: **Partially implemented**

- `src/db/base.py` defines `Base`, `engine`, `AsyncSessionLocal`, and `get_db()`.
- `src/db/models.py` defines `User`, `ReceiptRecord`, `ReceiptItemRecord`, and `Transaction`.
- `DATABASE_URL` accepts `postgresql://...` and normalizes it to `postgresql+asyncpg://...`.
- No migrations exist.

### Environment variables

Important backend variables:

- `DATABASE_URL`: PostgreSQL async SQLAlchemy URL.
- `YOLO_MODEL_PATH`: Optional local `.pt` file path. Leave empty to force Hugging Face download.
- `YOLO_MODEL_REPO`: Hugging Face model repo, for example `khoaaaaa/yolov11s_1`.
- `YOLO_MODEL_FILENAME`: File path inside the Hugging Face repo, for example `receipt_items_yolov11s.pt`.
- `YOLO_MODEL_REVISION`: Hugging Face branch/tag/commit, default `main`.
- `HF_TOKEN`: Optional Hugging Face token for private repos.
- `YOLO_CONFIDENCE`: YOLO confidence threshold.
- `SEMANTIC_CACHE_ENABLED`: Whether to use ChromaDB cache.
- `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_COLLECTION`: ChromaDB config.
- `GEMINI_API_KEY`, `GEMINI_MODEL`: Planned Gemini config.
- `SPENDSENSE_DEBUG`: Logging/SQL echo flag.
- `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`: Auth config.

### Error handling

Implemented:

- Pipeline tools return `ToolResult`.
- `PipelineError` is converted into HTTP 422 in `/receipts/analyze`.
- ChromaDB can be skipped if semantic cache is disabled.
- Database startup failure is non-fatal.

Needs improvement:

- No global exception handler.
- No structured error format across all routes.
- Hugging Face download errors are currently surfaced through a generic detector failure.
- More specific frontend messages would help distinguish missing HF file, private repo, missing token, and network failure.

### Authentication / authorization

Implemented:

- JWT auth for user-owned routes.
- `/transactions` uses `get_current_user`.
- `/insights` and `/feedback` use `get_current_user`.

Not required:

- `/receipts/analyze` is public/no-auth because it does not persist DB data.

---

## 5) Frontend status

### UI entry point

Status: **Implemented**

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`

### Main pages/components

Status: **Partially implemented**

- `AddTransactionModal.tsx` is the most complete feature surface.
- Dashboard/analytics/goals/investment/settings are mock-data screens.

### API integration

Status: **Partially implemented**

File:

- `frontend/src/lib/api.ts`

Implemented functions:

- `getHealth()`
- `analyzeReceipt(file)`
- `createTransaction(payload)`
- demo auth helpers: `getDemoToken()`, `loginDemoUser()`

Current behavior:

- `analyzeReceipt()` does not request a token.
- `createTransaction()` requests a demo token.
- API fallback tries localhost/127.0.0.1 ports 8080 and 8081 if `VITE_API_URL` is not set.

### Real data vs mock data

- Receipt analysis and transaction creation use real backend APIs.
- Main app pages still use mock frontend data.

### Known frontend issues

- No real auth UI.
- No transaction list UI connected to `GET /transactions`.
- No persistence of OCR token assignments.
- Large Vite bundle warning appears during production build.

---

## 6) Database status

### Tables implemented

#### `users`

Status: **Implemented**

Fields:

- `id`
- `email`
- `hashed_password`
- `created_at`

Relationships:

- `transactions`
- `receipts`

#### `receipts`

Status: **Partially implemented**

Fields:

- `id`
- `user_id`
- `merchant`
- `purchase_date`
- `total_amount`
- `currency`
- `raw_text`
- `created_at`

Relationships:

- `user`
- `items`
- `transactions`

#### `receipt_items`

Status: **Implemented, needs review**

Fields:

- `id`
- `receipt_id`
- `name`
- `quantity`
- `unit_price`
- `total_price`

Notes:

- Currently used to store reviewed receipt line items.
- Long term, this may need to be separated into OCR draft items and confirmed transaction items.

#### `transactions`

Status: **Partially implemented**

Fields:

- `id`
- `user_id`
- `receipt_id`
- `type`
- `amount`
- `currency`
- `category`
- `description`
- `merchant`
- `transaction_date`
- `created_at`
- `updated_at`

### Missing tables

Status: **Not implemented**

- `categories`
- `transaction_items`
- `detected_receipt_tokens`
- `receipt_review_assignments`
- `insights`
- `feedback`
- `budgets`
- `goals`
- `portfolio` / investment tables
- user preferences/settings

### Migration status

Status: **Not implemented**

- `alembic` is listed in dependencies.
- There is no `alembic.ini` or migration folder.
- Tables are created through `Base.metadata.create_all` on app startup.

---

## 7) API contract

### `GET /health`

Status: **Implemented**

Purpose:

- Liveness check.

Response:

```json
{ "status": "ok" }
```

Frontend usage:

- `getHealth()` exists but is not currently used by a page.

### `POST /auth/register`

Status: **Implemented**

Purpose:

- Register user and return JWT.

Request body:

```json
{
  "email": "user@example.com",
  "password": "minimum-6-characters"
}
```

Response:

```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "datetime"
  }
}
```

### `POST /auth/login`

Status: **Implemented**

Purpose:

- Login user and return JWT.

### `GET /auth/me`

Status: **Implemented**

Purpose:

- Return current authenticated user.

Requires:

- `Authorization: Bearer <jwt>`

### `POST /receipts/analyze`

Status: **Implemented / needs model config review**

Purpose:

- Analyze receipt image using YOLO + VietOCR and return editable draft data.

Auth:

- Not required.

Request:

- `Content-Type: multipart/form-data`
- `file`: image file

Accepted file types:

- `image/jpeg`
- `image/png`
- `image/webp`

Response shape:

```json
{
  "insight": {
    "insight_id": "uuid",
    "receipt_id": "uuid",
    "summary": "string",
    "category": "string",
    "tips": ["string"],
    "source": "llm",
    "similarity_score": null
  },
  "vector_id": null,
  "receipt": {
    "receipt_id": "uuid",
    "merchant": "Unknown Merchant",
    "purchase_date": "2026-05-19",
    "total_amount": 10000,
    "currency": "VND",
    "raw_text": "string",
    "items": [
      {
        "id": "uuid",
        "name": "Item name",
        "quantity": 1.702,
        "unit_price": 28000,
        "total_price": 47656,
        "source_token_ids": {
          "name": "token-id",
          "quantity": "token-id",
          "unit_price": "token-id"
        }
      }
    ]
  },
  "suggested_transaction": {
    "type": "expense",
    "amount": 10000,
    "currency": "VND",
    "category": "khac",
    "description": "",
    "merchant": "",
    "transaction_date": "2026-05-19",
    "receipt_id": null
  },
  "detected_fields": [
    {
      "id": "token-id",
      "class_name": "item",
      "text": "BÍ XANH",
      "confidence": 0.7,
      "x": 100,
      "y": 200,
      "width": 120,
      "height": 24
    }
  ]
}
```

### `POST /transactions`

Status: **Partially implemented**

Purpose:

- Save reviewed transaction and optional receipt items.

Requires:

- `Authorization: Bearer <jwt>`

Request body:

```json
{
  "type": "expense",
  "amount": 85000,
  "currency": "VND",
  "category": "khac",
  "description": "BÍ XANH, CÀ RỐT",
  "merchant": "",
  "transaction_date": "2026-05-19",
  "receipt_id": null,
  "receipt_items": [
    {
      "name": "BÍ XANH",
      "quantity": 1.77,
      "unit_price": 55000
    }
  ]
}
```

Response:

- `TransactionResponse`.

### `GET /transactions`

Status: **Implemented**

Purpose:

- List current user's transactions.

Requires:

- `Authorization: Bearer <jwt>`

Query params:

- `limit`
- `offset`

### `GET /insights`, `GET /insights/{insight_id}`, `POST /feedback/{insight_id}`

Status: **Partially implemented / needs review**

Notes:

- These routes depend on ChromaDB.
- `SEMANTIC_CACHE_ENABLED=false` means receipt analysis skips cache by default.
- Insight ID vs vector ID semantics still need review.

---

## 8) Data flow

### Receipt analysis only

Status: **Implemented**

This flow does not require database:

```text
User selects image
-> AddTransactionModal
-> analyzeReceipt(file)
-> POST /receipts/analyze
-> detect_receipt()
-> Hugging Face/local YOLO weights
-> Ultralytics detections
-> filter store_name
-> VietOCR per detected box
-> reconstruct_receipt()
-> response JSON
-> frontend review table
```

### Apply reviewed receipt as transaction

Status: **Partially implemented**

This flow requires database:

```text
User clicks apply
-> createTransaction(payload)
-> getDemoToken()
-> POST /auth/register or /auth/login if needed
-> POST /transactions
-> create ReceiptRecord
-> create ReceiptItemRecord rows
-> create Transaction
-> commit DB transaction
```

### Dashboard/analytics pages

Status: **Partially implemented**

```text
mockData.ts
-> React pages
-> charts/cards/tables
```

No backend API is used yet for these pages.

---

## 9) Environment variables and configuration

### Backend `.env`

Important current variables:

```env
YOLO_MODEL_PATH=
YOLO_MODEL_REPO=khoaaaaa/yolov11s_1
YOLO_MODEL_FILENAME=receipt_items_yolov11s.pt
YOLO_MODEL_REVISION=main
YOLO_CONFIDENCE=0.3
HF_TOKEN=
SEMANTIC_CACHE_ENABLED=false
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET_KEY=change-me
```

Notes:

- Leave `YOLO_MODEL_PATH` empty if using Hugging Face.
- Set `HF_TOKEN` only if the Hugging Face repo is private.
- `YOLO_MODEL_FILENAME` must be the exact path in the Hugging Face repo.
- `DATABASE_URL` is not needed for `/receipts/analyze`, but is needed for auth and transaction save.

### Frontend `.env.example`

Important variables:

- `VITE_API_URL`: Backend API base URL.
- `VITE_TIMEOUT_MS`: Request timeout. OCR may take longer than normal API calls, so keep this high enough.

---

## 10) How to run locally

### Install backend dependencies

```powershell
cd D:\HOC_KI_6\CNPM-AI\Spend-Sense-AI
uv sync
```

### Verify Hugging Face model config

List files in the configured Hugging Face repo:

```powershell
uv run python -c "from huggingface_hub import list_repo_files; print('\n'.join(list_repo_files('khoaaaaa/yolov11s_1', repo_type='model')))"
```

If the repo is private:

```powershell
$env:HF_TOKEN="hf_xxxxxxxxx"
uv run python -c "import os; from huggingface_hub import list_repo_files; print('\n'.join(list_repo_files('khoaaaaa/yolov11s_1', repo_type='model', token=os.getenv('HF_TOKEN'))))"
```

### Run backend

```powershell
uv run uvicorn main:app --host 127.0.0.1 --port 8080 --log-level debug --no-access-log
```

### Install frontend dependencies

```powershell
cd D:\HOC_KI_6\CNPM-AI\Spend-Sense-AI\frontend
npm install
```

### Run frontend

```powershell
cd D:\HOC_KI_6\CNPM-AI\Spend-Sense-AI\frontend
npm run dev
```

### Build frontend

```powershell
cd D:\HOC_KI_6\CNPM-AI\Spend-Sense-AI\frontend
npm run build
```

Recent verification:

- `npm run build` completed successfully.
- Backend Python files were compile-checked during implementation.

---

## 11) Testing status

### Existing tests

Status: **Not implemented**

- No `tests/` directory exists.
- `pyproject.toml` has pytest configuration but no test files.

### Manual testing performed

Status: **Partially implemented**

Observed manually:

- Backend starts even when database connection is unavailable.
- Receipt analysis route can be reached without database/auth.
- Frontend receipt modal renders review UI.
- Frontend build succeeds.

Current issue observed:

- Hugging Face returns `RemoteEntryNotFoundError: 404` for:

```text
https://huggingface.co/khoaaaaa/yolov11s_1/resolve/main/receipt_items_yolov11s.pt
```

This means the file name/path or revision is wrong, or the repo/file is private and token access is missing.

Critical tests to add:

- Detector resolves local path.
- Detector resolves Hugging Face path.
- Detector returns detections for a known fixture.
- OCR skips `store_name`.
- Reconstructor sorts rows top-to-bottom.
- Reconstructor does not attach quantity/price above an item row.
- Frontend can edit decimal quantities.
- `/receipts/analyze` does not require DB/auth.
- `/transactions` requires auth and saves rows.

---

## 12) Deployment status

Status: **Not implemented**

No production deployment config is present.

Known deployment requirements:

- Backend server with internet access if using Hugging Face download.
- `HF_TOKEN` if model repo is private.
- PostgreSQL database if transaction persistence/auth are enabled.
- Proper `DATABASE_URL`.
- Strong `JWT_SECRET_KEY`.
- Frontend `VITE_API_URL` pointing to backend.
- CORS configured for deployed frontend origin.

Known deployment risks:

- First model download can slow cold start.
- Heavy AI dependencies increase image/build size.
- No migrations.
- No production file/image storage; current design intentionally does not store bill images.

---

## 13) Known issues and risks

### P0

- **Hugging Face 404:** `YOLO_MODEL_FILENAME` does not match the actual file path in `khoaaaaa/yolov11s_1`.
- **No migrations:** Production/Supabase schema changes are not controlled.
- **Transaction schema is early-stage:** `receipt_items` is doing the job of confirmed item rows; a future `transaction_items` table may be cleaner.
- **Money stored as float:** PostgreSQL `Numeric` should replace `Float` for money.

### P1

- **Frontend main pages use mock data:** Dashboard/analytics do not reflect saved transactions.
- **No real auth UI:** Demo auth exists only inside API client.
- **No OCR token persistence:** Review state is transient.
- **Gemini/embedding still stubbed:** Insight text is not true AI analysis.
- **ChromaDB disabled by default:** Semantic cache exists but is not part of normal receipt flow.

### P2

- **Large frontend bundle warning:** Vite warns about JS chunk size.
- **No CI/tests:** Build/test automation is missing.
- **No model download progress UI:** First HF download may look slow to the user.

---

## 14) Recommended next steps

### P0: Must fix immediately

1. Fix Hugging Face model config.
   - Run `list_repo_files`.
   - Set `YOLO_MODEL_FILENAME` to the exact path.
   - Set `HF_TOKEN` if private.

2. Add clearer detector logging.
   - Log whether local or Hugging Face model is used.
   - Log resolved model path.
   - Log number of detections and class names.

3. Add database migrations.
   - Initialize Alembic.
   - Create migration for current models.
   - Stop relying on `Base.metadata.create_all` for production.

4. Connect saved transactions to dashboard.
   - Use `GET /transactions`.
   - Replace recent transaction mock data.

### P1: Important

1. Add `transaction_items` table or finalize current `receipt_items` design.
2. Change money fields to `Numeric`.
3. Persist OCR analysis metadata if reopening review is required.
4. Add backend tests for detector/OCR/reconstructor/routes.
5. Add frontend tests for receipt review interactions.

### P2: Nice to have

1. Add real auth UI.
2. Add category management.
3. Add SQL-backed insights and feedback.
4. Add deployment docs for Supabase + Hugging Face model loading.
5. Add bundle code splitting for frontend.
