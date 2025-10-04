
# 🩺 Provider Directory Validation System  

### An AI-powered platform for automating healthcare provider data validation, ensuring accuracy, compliance, and better patient access.  

---

## 🚀 Overview  
Healthcare payers often maintain large directories of providers (doctors, clinics, hospitals) — but over **80% of entries contain inaccurate data** such as wrong phone numbers, addresses, or outdated credentials.  
Manual validation through phone calls and spreadsheets is slow, costly, and error-prone.  

The **Provider Directory Validation System** automates this process using AI-driven data validation, enrichment, and cross-verification from public sources. It provides a clean, interactive dashboard for monitoring progress, viewing results, and generating analytical reports.  

---

## 🌟 Key Features  

### 🧠 1. Provider Data Validation  
- Upload provider CSV and optional scanned PDF records.  
- AI agents automatically validate details (phone, address, license, specialty) using:  
  - **NPI Registry (CMS)**  
  - **Google Maps API**  
  - **State Medical Board websites**  
  - **Hospital directories**  
- Confidence scoring for each field based on source reliability.  

### 📊 2. Results Dashboard  
- Visual KPIs: total processed, validation accuracy, flagged entries, and average confidence score.  
- Time-series trend chart showing progress over time.  
- Error distribution graph by category (e.g., wrong phone, missing NPI, moved address).  
- Quick access to flagged providers for human review.  

### ⏳ 3. Progress Tracker  
- Real-time tracking of each upload job (e.g., “142 of 200 providers validated”).  
- Visual progress bars and live status updates via polling or WebSockets.  
- Automatic ETA estimation and failure alerts.  
- Summary of validated, flagged, and pending providers per batch.  

### 📈 4. Reports & Analytics  
- Export validated directory or flagged providers as **CSV / PDF**.  
- Custom filters for date, specialty, and location.  
- Generate on-demand or schedule weekly/monthly reports via the dashboard.  
- View and download previously generated reports with status tracking.  

---

## 🧩 System Architecture  

**Frontend:**  
- React + Tailwind CSS  
- Axios for API calls  
- Recharts (or Chart.js) for analytics visualization  
- Modular components: UploadForm, ProvidersTable, ProviderDetailModal, ProgressTracker, ResultsDashboard, ReportsPage  

**Backend (Mock / Real Ready):**  
- FastAPI (Python) or mock Node server for demonstration  
- SQLite/PostgreSQL database  
- Celery + Redis for background validation tasks  
- BeautifulSoup + Requests + OCR for validation logic  

**Integration Flow:**  
```

User Uploads CSV → Backend validates via APIs → Confidence scores generated →
Progress Tracker updates → Dashboard visualizes results → Reports generated/exported

```

---

## 🗂️ Folder Structure  

provider-validation/
│
├── src/
│ ├── components/
│ │ ├── UploadForm.jsx
│ │ ├── ProvidersTable.jsx
│ │ ├── ProviderDetailModal.jsx
│ │ ├── ProgressTracker.jsx
│ │ ├── ResultsDashboard.jsx
│ │ ├── ReportsPage.jsx
│ │ └── DashboardCards.jsx
│ │
│ ├── pages/
│ │ ├── LandingPage.jsx
│ │ ├── AboutPage.jsx
│ │ ├── UploadPage.jsx
│ │ ├── ProvidersPage.jsx
│ │ ├── QueuePage.jsx
│ │ ├── DashboardPage.jsx
│ │ └── ReportsPage.jsx
│ │
│ ├── api/
│ │ └── apiClient.js
│ │
│ ├── assets/
│ │ └── sample_pdfs/
│ │
│ ├── data/
│ │ └── sample_providers.csv
│ │
│ └── utils/
│ ├── confidenceColors.js
│ ├── usePolling.js
│ └── formatAddress.js
│
├── mock-server/ (optional)
│ └── server.js
│
├── public/
│
├── README.md
│
└── package.json

---

## 🧠 How It Works  

1. **Upload provider CSV / PDF:**  
   Upload provider data files through the dashboard’s upload screen.  

2. **AI Validation Pipeline:**  
   The backend automatically verifies and enriches provider details by comparing data across trusted public sources.  

3. **Progress Tracking:**  
   The upload job status updates live in the Progress Tracker (e.g., 65% completed).  

4. **Result Visualization:**  
   The Results Dashboard displays overall accuracy, confidence trends, and error types.  

5. **Report Generation:**  
   The user can export results as CSV/PDF or schedule recurring reports via the Reports & Analytics page.  

---

## ⚙️ Setup & Installation  

### 1. Clone the repository  
```bash
git clone https://github.com/yourusername/provider-directory-validation.git
cd provider-directory-validation
````

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

### 4. (Optional) Start mock API server

```bash
npm run start:mock
```

### 5. Open in browser

Visit **[http://localhost:5173](http://localhost:5173)** (or as shown in terminal).

---

## 📤 API Endpoints (Mock / Real)

| Endpoint                    | Method | Description                            |
| --------------------------- | ------ | -------------------------------------- |
| `/api/upload`               | POST   | Upload provider dataset (CSV/PDF)      |
| `/api/uploads/:id/progress` | GET    | Get live validation progress           |
| `/api/providers`            | GET    | List providers with validation results |
| `/api/dashboard/summary`    | GET    | Fetch KPI metrics                      |
| `/api/dashboard/trends`     | GET    | Get validation trends data             |
| `/api/reports/generate`     | POST   | Generate new report                    |
| `/api/reports/history`      | GET    | List previous reports                  |
| `/api/reports/:id`          | GET    | Get report status/download link        |

---

## 📊 Example Outputs

**✅ Progress Tracker**

```
Upload: provider_data_batch_3.csv  
Progress: 147 / 200 validated (74%)  
Flagged: 8 providers  
Status: Processing
```

**📈 Dashboard KPIs**

* Total processed: 200
* Validation accuracy: 82%
* Flagged entries: 8
* Avg confidence: 0.76

**📑 Report Example:**

* Type: CSV
* Filters: Specialty=Cardiology, State=Karnataka
* Generated in: 1m 42s
* Status: ✅ Ready for download

---

## 🛡️ Security & Privacy

* No real patient or PII data used — only synthetic demo data.
* Sensitive fields masked in logs and reports.
* APIs rate-limited to prevent misuse.

---

## 🧪 Testing

```bash
npm run test
```

Includes:

* Unit tests for dashboard components
* Integration tests for mock API responses
* Snapshot tests for UI rendering

---

## 📅 Development Roadmap

| Phase   | Focus                              | Status         |
| ------- | ---------------------------------- | -------------- |
| Phase 1 | Core upload + validation UI        | ✅ Done         |
| Phase 2 | Progress Tracker                   | ✅ Done         |
| Phase 3 | Results Dashboard                  | ✅ Done         |
| Phase 4 | Reports & Analytics                | ✅ Done         |
| Phase 5 | Real backend integration (FastAPI) | 🚧 In progress |
| Phase 6 | Multi-user roles & auth            | 🔜 Planned     |

---

## 🧰 Tech Stack

* **Frontend:** React, Tailwind CSS, Axios, Recharts
* **Backend (optional real):** FastAPI, PostgreSQL, Celery, Redis
* **Data:** NPI Registry API, Google Maps API (mocked in demo)
* **Deployment:** Render / Vercel / Heroku
* **Testing:** Jest / React Testing Library

---

## 💡 Future Enhancements

* Add LLM-based fuzzy name/address matching
* Integrate live provider confirmation emails
* Add multilingual dashboard support
* Role-based authentication for admins and reviewers

---

## 🤝 Contributors

* **Leora Saharia** — Frontend Developer, ML Engineer
* **Adya Singh** — UI/UX developer
* **Anshika Pandey** — Designer
* **Godson S Philip** — Full Stack, ML Engineer
* **Piyush Lokhande** — Backend Developer

---

## 🏥 Demo Preview

> 🧠 *“Fixing healthcare data accuracy, one provider at a time.”*
> Watch the demo video → [Insert Demo Link Here]

---

```

