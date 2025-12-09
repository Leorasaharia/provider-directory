# Integration Guide: Flow-1 Backend with Provider Directory Frontend

## Project Structure

```
provider-directory/
├── Flow-1/              # Backend (FastAPI)
│   ├── main.py
│   ├── models.py
│   ├── orchestrator.py
│   ├── agents/
│   └── data/
├── app/                 # Frontend (Next.js)
│   └── api/
└── lib/
```

## Setup Instructions

### 1. Backend Setup (Flow-1)

Navigate to the Flow-1 directory and set up the Python environment:

```bash
cd provider-directory/Flow-1
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic requests
```

### 2. Start Backend Server

From the `provider-directory/Flow-1` directory:

```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at: `http://127.0.0.1:8000`

Test it: `http://127.0.0.1:8000/health`

### 3. Frontend Setup

From the `provider-directory` directory:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the `provider-directory` directory:

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

### 5. Start Frontend Server

From the `provider-directory` directory:

```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000` (or the port shown in terminal)

## API Integration

The frontend communicates with the backend via HTTP API calls:

- **Backend Endpoint**: `POST /flow1/validate-batch`
- **Frontend Route**: `app/api/uploads/route.ts`
- **API Base URL**: Configured via `NEXT_PUBLIC_API_BASE` environment variable

## Data Flow

1. User uploads CSV file via frontend
2. Frontend parses CSV and maps to `ProviderInput` format
3. Frontend sends batch request to `http://127.0.0.1:8000/flow1/validate-batch`
4. Backend processes providers and returns `ProviderReport[]`
5. Frontend stores results and updates UI

## CSV Format

The CSV should have the following columns (case-insensitive):
- `name` or `Name`
- `npi` or `NPI`
- `mobile_no`, `phone`, or `mobile`
- `address` or `Address`
- `speciality` or `specialty`
- `member_impact` or `Member_Impact` (optional, defaults to 3)

## Troubleshooting

### Backend not responding
- Check if backend is running on port 8000
- Verify CORS settings in `Flow-1/main.py`
- Check backend logs for errors

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_BASE` in `.env.local`
- Restart Next.js dev server after changing env vars
- Check browser console for CORS errors

### No uploads showing
- Uploads are stored in-memory (lost on server restart)
- Make sure upload completed successfully (check network tab)
- Verify backend returned valid response

