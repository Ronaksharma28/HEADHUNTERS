# Flame in Freefall — FastAPI + Supabase Backend

Complete backend and PostgreSQL (Supabase) database system verified against NASA PSI, NTRS, and the NASA research briefs (`BASS/BASS-II`, `FLEX/FLEX-2`, `CFI/CFI-G`, `Saffire I–V`, `SAME/SAME-R`).

## Quick Setup

1. **Create Supabase Tables**:
   - Open your Supabase project -> **SQL Editor**.
   - Paste and run `database/schema.sql`.

2. **Configure Environment**:
   - Copy `.env.example` to `.env` and add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

3. **Install Dependencies & Seed Verified Data**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m app.seed_nasa_data
   ```

4. **Ingest Additional Raw PSI CSV/Excel Files (Optional)**:
   ```bash
   python -m app.ingest_psi_csv path/to/psi_data.csv --investigation BASS-II
   ```

5. **Run FastAPI Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive API docs: `http://localhost:8000/docs`
