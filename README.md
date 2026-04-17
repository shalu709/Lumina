# Lumina - The Academic Operating System

Lumina is an all-in-one productivity suite built to solve the 11 biggest pain points for college students. By combining task tracking, an AI tutor, attendance guards, and note management, Lumina serves as a unified digital campus....

## Features Built
- **The 75% Guard:** Visual tracker ensuring you don't fall below mandatory attendance.
- **Action Center:** Priority queue for college assignments and tasks.
- **Study Buddy AI (Multi-Model Resiliency):** Integrated AI fetching from Groq, OpenRouter, and Nvidia to ensure constant uptime without rate limit crashes.
- **The Vault / Notes:** Save and organize rough notes for automated structural markdown conversion.

## Tech Stack
- **Frontend:** React + Vite, Pure CSS (Glassmorphism & Dark Mode)
- **Backend:** Java 17 + Spring Boot
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Groq (Llama 3), OpenRouter, Nvidia APIs

## Running Locally

1. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Make sure `secrets/config.json` exists in the Lumina root folder so API keys are loaded successfully.*

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *The React app will proxy requests to `http://localhost:8080`.*
