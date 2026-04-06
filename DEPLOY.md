# Lumina: Deploying for $0

Lumina uses a zero-cost stack intended for college students to easily run and host.

## 1. Hosting the Backend (Render / Railway)
Since GitHub Pages only hosts static sites, you must host your Java Spring Boot API on a service like **Render**.

1. Create an account on Render.com and connect your GitHub.
2. Click **New Web Service** and select your Lumina repository.
3. **Build Command**: `cd backend && mvn clean package -DskipTests`
4. **Start Command**: `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar`
5. *Important!* Because `secrets/` is not pushed to GitHub, add these Environment Variables in the Render Dashboard under **Environment**:
    - `GROQ_API_KEY` = your_key
    - `OPENROUTER_API_KEY` = your_key
    - `NVIDIA_API_KEY` = your_key
*(Note: You'll also need to update `SecretsConfig.java` to read `System.getenv("GROQ_API_KEY")` when running in production).*

## 2. Hosting the Frontend (GitHub Pages or Vercel)
Vercel is much easier for Vite apps, and it's 100% free.

1. Go to Vercel.com.
2. Import the Git repository.
3. Set the Root Directory to `frontend`.
4. Deploy!

## 3. The Database (Supabase)
Your Supabase instance is already set up and hosted for free.
Because we used `spring.jpa.hibernate.ddl-auto=update`, the moment your Spring Boot application starts, it will automatically create all the necessary SQL tables (`app_users`, `app_tasks`, `attendance_logs`, `study_notes`).

You do not need to write any SQL scripts manually.
