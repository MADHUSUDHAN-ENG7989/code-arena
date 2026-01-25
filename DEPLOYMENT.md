# Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide walks you through deploying your MERN stack application with the backend on **Render** and the frontend on **Vercel**.

---

## Part 1: Deploy Backend to Render

1.  **Push Code**: Ensure your latest code is pushed to GitHub.
2.  **Create Service**:
    *   Go to [Render Dashboard](https://dashboard.render.com/).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
3.  **Configure Service**:
    *   **Name**: `code-arena-api` (or similar).
    *   **Root Directory**: `server` (Important!).
    *   **Runtime**: Node.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `npm start`.
4.  **Environment Variables**:
    *   Scroll down to "Environment Variables" and add:
        *   `MONGO_URI`: Your MongoDB Connection String.
        *   `JWT_SECRET`: A secure random string.
        *   `NODE_ENV`: `production`.
        *   `GROQ_API_KEY`: Required for AI Code Analysis (Get from [Groq Console](https://console.groq.com/keys)).
        *   `CLIENT_URL`: **Leave this empty for now** (We will update it after deploying the frontend).
5.  **Deploy**: Click **Create Web Service**.
6.  **Copy URL**: Once deployed, copy the service URL (e.g., `https://code-arena-api.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel

1.  **Create Project**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **Add New...** -> **Project**.
    *   Import your `code-arena` repository.
2.  **Configure Project**:
    *   **Framework Preset**: Vite (Should auto-detect).
    *   **Root Directory**: Click "Edit" and select `client`.
3.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add:
        *   **Name**: `VITE_API_URL`
        *   **Value**: Your Render Backend URL + `/api` (e.g., `https://code-arena-api.onrender.com/api`).
4.  **Deploy**: Click **Deploy**.
5.  **Copy URL**: Once finished, copy your Vercel domain (e.g., `https://code-arena-frontend.vercel.app`).

---

## Part 3: Connect Frontend to Backend

1.  Go back to your **Render Dashboard**.
2.  Select your backend service.
3.  Go to **Environment**.
4.  Add/Update `CLIENT_URL` with your **Vercel Frontend URL** (no trailing slash, e.g., `https://code-arena-frontend.vercel.app`).
5.  **Save Changes**. Render will restart your server.

**Done!** Your app is now split-deployed and connected.
