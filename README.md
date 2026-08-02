# Clinic Management System

Local-first clinic management application built with React + TypeScript and ASP.NET Core + Entity Framework Core + SQLite.

## Included modules

- Administrator setup, login, logout and password change
- Dashboard with waiting queue, schedule, activity and revenue
- Patients and patient profiles
- Appointments
- Visits / consultations and medicines
- Printable prescriptions using clinic settings
- Billing and invoice numbering
- Payments and receipt numbering
- Printable payment receipts using clinic settings
- Reports and CSV export
- Clinic, doctor, consultation, billing and numbering settings
- Local SQLite backup, download, restore and safety backup

## Run locally

### Backend

Requirements: .NET 10 SDK.

```bash
cd backend
dotnet restore
dotnet run
```

The backend uses `clinic.db`. Database migrations are applied automatically at startup.

### Frontend

Requirements: Node.js and pnpm.

```bash
cd frontend
pnpm install
pnpm dev
```

Open the Vite URL (normally `http://localhost:5173`). On a database with no administrator, the app will show first-time administrator setup.

## Important data/privacy notes

- `backend/clinic.db` contains clinic data and must not be committed to GitHub or shared publicly.
- Database files, SQLite WAL/SHM files and `backend/Backups/` are ignored by Git.
- Keep external backups of the database in addition to the in-app local backup copies.
- Before replacing an existing installation, keep a copy of its `clinic.db` and `Backups` folder.

## API configuration

Frontend API requests are centralized in `frontend/src/lib/api.ts`. Normal feature files should use `apiFetch()` instead of hardcoding the backend URL.

## Production note

This repository is development-ready for local testing. Before distributing it as a one-click desktop installer or hosted SaaS product, add the appropriate deployment/installer configuration and perform full acceptance testing on the target Windows machine.
