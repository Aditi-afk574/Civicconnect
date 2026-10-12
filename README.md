# 🏙️ CivicConnect — Smart Civic Issue Reporting Platform

CivicConnect is a web-based civic issue reporting platform designed to connect citizens with local authorities by making it easier to report, locate, and track public infrastructure problems.

From potholes and damaged roads to overflowing garbage and broken streetlights, CivicConnect provides a centralized interface for documenting civic issues and supporting better community participation.

## ✨ Key Features

- **📍 Location-Based Reporting:** Select the exact location of a civic issue using an interactive map.
- **📸 Photo Upload:** Attach a photograph to help document the reported problem.
- **📝 Issue Reporting:** Submit an issue title, category, and detailed description.
- **🚧 Multiple Issue Categories:** Report potholes, streetlights, garbage accumulation, water leakage, and other civic problems.
- **🗺️ Interactive Map:** Visualize locations using Leaflet and OpenStreetMap.
- **📋 Issue Tracking:** View submitted issues and their status, where supported by the implementation.
- **💻 User-Friendly Interface:** Navigate between the Home, Issues, and Report sections.
- **🔧 Extensible Architecture:** Designed to support future administrative tools, issue prioritization, and civic analytics.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| JavaScript | Application logic and frontend interactions |
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| Java | Backend application logic |
| Spring Boot | Backend services and REST APIs |
| Maven | Java dependency and build management |
| Leaflet | Interactive maps |
| OpenStreetMap | Map data and geographic visualization |
| Git & GitHub | Version control and project collaboration |

**Database:** Configure the database technology according to the database actually connected to your backend.

## 🏗️ Project Architecture

```text
CivicConnect/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── docs/
│   └── Project documentation and diagrams
│
├── .gitignore
└── README.md
```

*The directory structure above is illustrative. Keep the actual filenames and folders present in your repository.*

## 🚀 Getting Started

### Prerequisites

Install the following tools:

- Node.js and npm
- Java JDK compatible with the backend configuration
- Apache Maven
- Git

A database server is required if the backend is configured to use one.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd CivicConnect
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Run the Frontend

Open a terminal inside the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

### 3. Run the Backend

Open another terminal inside the `backend` directory:

```bash
mvn spring-boot:run
```

Configure the required database connection and environment variables before starting the backend if your application requires them.

## 📌 How CivicConnect Works

1. A citizen opens the CivicConnect application.
2. The citizen navigates to the Report section.
3. An appropriate issue category is selected.
4. The issue title and description are entered.
5. The location is selected on the interactive map.
6. A supporting photograph is uploaded, if available.
7. The report is submitted.
8. The issue can be viewed or tracked according to the functionality implemented in the application.

## 🌍 Real-World Applications

- Reporting damaged roads and potholes.
- Reporting broken or non-functional streetlights.
- Highlighting uncollected garbage and sanitation problems.
- Reporting water leakage and public infrastructure damage.
- Helping local authorities identify and prioritize civic maintenance requirements.

## 🔮 Future Scope

- Citizen and administrator authentication.
- Role-based access control.
- Automated issue prioritization.
- Notifications when an issue's status changes.
- Dashboard analytics for reported, pending, and resolved issues.
- Duplicate issue detection.
- Improved mobile responsiveness.
- Deployment with a persistent production database and secure image storage.

## 🎯 Project Objective

The primary objective of CivicConnect is to encourage citizen participation, improve the visibility of local civic issues, and provide a structured digital approach to community problem reporting.

## 📚 Third-Party Technologies

- [React](https://react.dev/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Vite](https://vite.dev/)

Map data, external images, and other third-party assets remain subject to their respective licences and attribution requirements.

## 👩‍💻 Project Status

CivicConnect is a student project under development. Features such as persistent report storage, authentication, notifications, and administrative workflows should be considered available only when implemented and tested.

---

**CivicConnect — Report Local Issues. Improve Your Community.**


## 🚀 Deployment

CivicConnect uses **Vercel** for the React/Vite frontend and **Render** for the Spring Boot API.

- Deployment steps and required environment variables: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel SPA route fallback: [frontend/vercel.json](./frontend/vercel.json)
- Render API Blueprint: [render.yaml](./render.yaml)

The API requires a reachable MySQL database configured through `DB_URL`, `DB_USER`, and `DB_PASS`, plus a private `JWT_SECRET`. Set `VITE_API_URL` in Vercel and configure `CORS_ALLOWED_ORIGINS` in Render using the actual deployed origins. Do not commit credentials to this repository.
