# CivicConnect Deployment Guide

This repository contains a React/Vite frontend and a Java/Spring Boot backend.

## Before starting

- Push the deployment configuration to GitHub.
- Have a reachable MySQL database and its connection details ready.
- Never commit database passwords, JWT secrets, or `.env` files.
- The previous Aiven hostname in older configuration may no longer resolve. Use a currently valid database hostname.

## 1. Set up MySQL

The application requires MySQL. **For a student demo, start with Aiven's free MySQL tier**: https://aiven.io/free-mysql-database. Its current free tier is designed for small projects and includes limited resources; review its limitations before relying on it for anything important.

1. Sign in to Aiven and create a new MySQL service if your old Aiven hostname no longer resolves.
2. Wait for the service to become ready.
3. Record the new host, port, database name, username, and password from Aiven's connection information. Keep the credentials private.
4. Use the database name shown by Aiven in the JDBC URL. For a provider requiring TLS, include the provider's recommended SSL parameter, for example `?sslMode=REQUIRED`.

For Render hosting instead, you can use Render's MySQL template: https://render.com/templates/mysql. Review its plan and persistent-disk costs before creating the service; this can incur charges. If using the Render template, use the actual internal hostname and port displayed for that service.

Do not use `localhost` as the host for a database that runs outside the backend container.

## 2. Deploy the API on Render

This repository's root `render.yaml` defines a Docker-based Spring Boot web service. In the Render dashboard, create a new Blueprint from this repository and select the `deploy/render-vercel` branch, or manually create a Web Service from that branch with Docker.

Set these service environment variables:

- `DB_URL`: JDBC URL for the real, reachable MySQL database, e.g. `jdbc:mysql://YOUR_INTERNAL_MYSQL_HOST:3306/localresolve`
- `DB_USER`: the MySQL username
- `DB_PASS`: the MySQL password
- `JWT_SECRET`: a newly generated, long random secret
- `CORS_ALLOWED_ORIGINS`: the deployed Vercel origin, e.g. `https://your-civicconnect.vercel.app`
- `FILE_UPLOAD_DIR`: optional; set to `/var/data/uploads` if a persistent disk is mounted at `/var/data`

The service reads Render's `PORT` environment variable; its local default is port 8080.

### Uploaded photos

The default upload directory is `./uploads`, which is ephemeral on Render without a persistent disk. For persistent local-file uploads, attach a persistent disk to a paid web service at `/var/data` and set `FILE_UPLOAD_DIR=/var/data/uploads`. Alternatively, change the app to store images in object storage. Do not assume uploaded photos persist without one of these options.

## 3. Deploy the frontend on Vercel

1. Import this repository at https://vercel.com/new.
2. Set the Root Directory to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add this environment variable for Production (and Preview if needed):
   - `VITE_API_URL`: the deployed Render API origin, without a trailing `/api`, e.g. `https://civicconnect-api.onrender.com`.
7. Deploy and record the actual Vercel URL.

The `frontend/vercel.json` file enables client-side route fallback for React Router.

## 4. Complete CORS configuration

After the Vercel deployment is available, set the Render API's `CORS_ALLOWED_ORIGINS` to the exact Vercel production origin (scheme plus hostname, no route path), then redeploy the API. For example: `https://your-civicconnect.vercel.app`.

For local development, the default is `http://localhost:5173`.

## 5. Test the full application

- Open the Vercel URL.
- Test map loading and all frontend routes.
- Test registration/login.
- Submit a test civic issue and confirm it is saved in MySQL.
- Refresh the Issues page and confirm the report is still present.
- Upload a photo, then restart/redeploy the API and verify the photo still opens if persistent image storage is configured.

## Important notes

- The GitHub repository may include historical build output. Only source code is needed for deployments.
- The service may not start successfully until a reachable MySQL database and all required environment variables are configured.
- Render free web services can sleep when idle and have an ephemeral filesystem. Review current plans before enabling paid databases or persistent disks.
