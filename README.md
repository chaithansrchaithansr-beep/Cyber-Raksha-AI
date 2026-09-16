# 🇮🇳 CYBER RAKSHA AI (साइबर रक्षा)
### AI-Powered National Cyber Threat Intelligence & Digital Scam Protection Platform

> **Defensive Cybersecurity, Threat Correlation, Citizen Protection, and Autonomous Threat Intelligence.**  
> Built for national-level innovation showcases, hackathons, and enterprise digital defense.

---

## 🌟 Executive Overview

**CYBER RAKSHA AI** is a full-stack, enterprise-grade cybersecurity platform architected to defend Indian citizens, organizations, and cyber defense cells against modern digital frauds and coordinated cyber attacks.

Unlike basic scanners that treat threat vectors in silos, CYBER RAKSHA AI introduces the **Cyber Threat Fusion Engine**, an AI correlation mechanism that correlates indicators across **URLs, SMS/WhatsApp texts, payment screenshots (OCR), and QR payloads** to identify organized, nationwide scam campaigns.

---

## 🛡️ Core Capabilities & Modules

### 1. Multi-Vector Threat Scanners
* **Module 01 — AI Phishing URL Scanner:** Heuristic lexical extraction (Shannon entropy, subdomain depth, lookalike brand spoofing, IP hosting) paired with pre-trained ML Random Forest classifiers.
* **Module 02 — Social Engineering Email Analyzer:** Parses email headers, urgency extortion signals, deceptive sender addresses, and credential harvesting forms.
* **Module 03 — SMS & WhatsApp Scam Detector:** Indian scam taxonomy NLP engine covering UPI PIN cashback traps, electricity bill disconnection extortion, Telegram fake task jobs, and KYC bank suspensions.
* **Module 04 — Fake Website & DOM Analyzer:** Brand impersonation detector analyzing DOM visual metrics, form targets, and certificate trustworthiness.
* **Module 05 — Screenshot & Payment OCR Analyzer:** Detects manipulated PhonePe/Paytm/GPay payment receipts, font discrepancies, synthetic transaction IDs, and embedded scam copy.
* **Module 06 — QR Code Security Auditor:** Decodes QR payloads, detecting malicious UPI debit intents (`upi://pay?am=...`) and phishing redirections before execution.

### 2. Core Innovation: Cyber Threat Fusion Engine
* **Multi-Vector Correlation:** Ingests URL + SMS + Screenshot OCR + Brand Context simultaneously.
* **Cluster Identification:** Correlates disparate citizen reports into unified campaign clusters (e.g. `CR-2026-00305: Nationwide SBI YONO KYC Suspension & UPI Trap`).
* **Cross-Vector Confidence:** Increases AI detection confidence when matching patterns appear across multiple communication vectors.
* **Containment Protocol Generation:** Recommends proactive CERT-In and ISP blocking advisories.

### 3. National Cyber Intelligence & Analytics
* **Module 10 — Privacy-Preserving India Heatmap:** Real-time geospatial state-level threat intelligence across 18 Indian states without disclosing victim GPS or personal identities.
* **Module 11 — National Analytics Dashboard:** Recharts-powered temporal line charts, vector distributions, and CSV/JSON telemetry export.
* **Module 08 — Community Threat Intelligence & Auto-PII Sanitizer:** Live crowdsourced threat reporting with **automatic client/server PII stripping** (masking mobile numbers, Aadhaar, PAN, card numbers, emails, and OTPs).
* **Module 07 — Real-Time WebSocket Threat Alert Radar:** Instant push notifications for critical threat campaigns with a 1-click Hackathon demo trigger.
* **Module 14 — Automated Incident Report Generator:** Generates official ReportLab PDF reports complete with a cryptographic **SHA-256 integrity hash**.
* **Module 12 — Defensive AI Cyber Safety Assistant:** Context-aware incident recovery assistant with strict ethical safety guardrails (politely refuses and redirects malicious offensive hacking requests).
* **Module 26 — Cyber Awareness Academy:** Interactive learning tracks, quizzes, and digital defense badges.
* **Module 28 — Multi-Language Citizen Accessibility:** Fully translated into 7 Indian languages (English, हिन्दी, ಕನ್ನಡ, தமிழ், తెలుగు, മലയാളം, मराठी).
* **Module 37 — AI Model Performance Dashboard:** Transparent evaluation metrics (Accuracy 96.4%, Precision 95.8%, Recall 97.1%, F1 96.4%, ROC-AUC 0.982).

---

## 🏗️ Architecture & Technology Stack

```
                                  CYBER RAKSHA AI
                                 System Architecture

      +-----------------------------------------------------------------------+
      |                           Vite + React 19                             |
      |          Tailwind CSS 4 • Lucide Icons • Recharts • Context API       |
      |         Multi-Language (7 Languages) • WebSocket Live Listener        |
      +-----------------------------------+-----------------------------------+
                                          | REST APIs + WebSocket (/ws)
                                          v
      +-----------------------------------------------------------------------+
      |                         FastAPI Application                           |
      |       RBAC Security • NIST-Compliant PBKDF2 Hashing • PyJWT           |
      +-----------------------------------+-----------------------------------+
                                          |
               +--------------------------+--------------------------+
               |                                                     |
               v                                                     v
      +------------------+                                  +------------------+
      | Threat Services  |                                  |   AI/ML Models   |
      | • PII Sanitizer  |                                  | • Random Forest  |
      | • Scoring Engine |                                  | • TF-IDF + LogReg|
      | • Fusion Engine  |                                  | • OCR Engine     |
      | • QR Analyzer    |                                  | • Heuristics     |
      | • ReportLab PDF  |                                  +------------------+
      +------------------+                                           |
               |                                                     |
               +--------------------------+--------------------------+
                                          |
                                          v
      +-----------------------------------------------------------------------+
      |                Async SQLAlchemy Database Layer                        |
      |          SQLite (Embedded Dev) / PostgreSQL 16 (Enterprise)           |
      |          State Telemetry • Threat Clusters • Audit Trails             |
      +-----------------------------------------------------------------------+
```

---

## ⚡ Quick Start Instructions

### Prerequisites
* Python 3.10+ (Tested with Python 3.14)
* Node.js 18+ (Tested with Node v24)
* Git

### Option 1: One-Click Launch (Windows)
Double-click `run.bat` in the root directory. This will:
1. Start the FastAPI backend on `http://localhost:8000`
2. Start the Vite React frontend on `http://localhost:5173`
3. Automatically seed demo accounts, threat clusters, and telemetry

### Option 2: Manual Terminal Startup

#### 1. Backend Setup:
```powershell
cd backend
pip install -r requirements.txt
python -m app.ml.train_models
$env:PYTHONPATH="."
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* Interactive API Documentation: `http://localhost:8000/docs`

#### 2. Frontend Setup:
```powershell
cd frontend
npm install
npm run dev
```
* Application Portal: `http://localhost:5173`

### Option 3: Multi-Container Docker Launch
```bash
docker-compose up --build
```

---

## 🔑 Demo Login Credentials & Authentication Architecture

The login page (`/login`) includes **1-Click Demo Login** buttons as well as standard credential login:

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@cyberraksha.gov.in` | `Citizen@123` | Scanners, Academy, AI Assistant, Community Reporting, Scoped History |
| **Organization** | `org@infosec-defense.in` | `OrgAdmin@123` | Brand Impersonation Radar, API Keys, Organization Scoped Threat Telemetry |
| **Administrator** | `admin@cyberraksha.gov.in` | `CyberRaksha@Admin2026` | SecOps Command Center, Model Benchmark Review, Threat Verification, User Management |

### Security & Cryptographic Features:
* **Dual-Token Architecture:** 60-minute JWT Access Tokens + 7-day SHA-256 hashed Refresh Tokens stored in SQLite/PostgreSQL with automatic rotation.
* **Rate Limiting:** Protects `/login` against brute force attempts with IP/email sliding window limits (`429 Too Many Requests`).
* **Active Session Management:** Inspect device User-Agent, creation time, expiration, and terminate all remote sessions on demand (`/security`).
* **Password Reset System:** Cryptographic one-time tokens with Development Mode copyable banner and production email toggle.
* **Role-Based Access Control (RBAC):** Zero-Trust route guards (`AccessDenied` 403) and backend API dependency enforcement (`require_role(...)`).

---

## 🧪 Automated Test Suite

Run the complete 17-test automated test suite covering authentication, token pairs, session rotation, RBAC, PII redaction, ML classifiers, fusion engine, and API endpoints:

```powershell
$env:PYTHONPATH="backend"
python -m pytest tests/ -v
```
**Results:** `17 passed in ~3 seconds`

---

## 🔒 Ethical Safety & Defensive Cybersecurity Disclaimer

CYBER RAKSHA AI is built exclusively for **defensive security monitoring, digital scam awareness, and citizen threat prevention**. 

* The system does **NOT** generate exploits, attack scripts, or penetration testing tools.
* User-provided data is sanitized on ingest using the automated PII masking engine before being stored or analyzed.
* State telemetry and heatmaps are aggregated at the regional boundary level to ensure victim anonymity.

---

*Developed for the National Cyber Safety Innovation Initiative.*
