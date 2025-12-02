Project Title
AdMiro – Smart Advertising Display Management System (PaaS)

**Problem Statement**

Managing digital advertisements across multiple urban display units is often fragmented, requiring manual updates and local control. AdMiro provides a centralized cloud platform that allows administrators to remotely manage, schedule, and monitor advertisements across connected web-based displays in real time, ensuring consistency, efficiency, and scalability.

**System Architecture**
Frontend → Backend (API) → Database → Web Display Clients
**Stack:**

- **Frontend:** Next.js 15 with App Router for seamless navigation
- **Backend:** Express.js with MongoDB
- **Database:** MongoDB (non-relational)
- **Authentication:** JWT-based login/signup with Google OAuth
  **Hosting:**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas
- Display Clients → Web-based displays connected via secure REST APIs for content sync

**Key Features**

- **Authentication & Authorization:** Secure login/signup with JWT
- **Ad Management (CRUD):** Create, view, update, and delete ad campaigns with media links
- **Display Network Management:** Add, remove, and monitor display units citywide
- **Searching, Sorting, & Filtering:** Ability to search through ad campaigns on the dashboard & through different displays by ID.
- **Pagination:** Pagination of displays that are attached to the dashboard (after searching, sorting, & filtering)
- **Dashboard & Analytics:** Real-time dashboard for display status, uptime, and ad playback metrics
- **Remote Configuration:** Instantly update or refresh content on displays remotely
- **Hosting:** Cloud-deployed backend and frontend with accessible public endpoints

**Tech Stack**

- **Frontend:** Next.js, Axios, TailwindCSS
- **Backend:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT, Google OAuth
- **Hosting:** Vercel, Render, MongoDB Atlas
- **Client Devices:** Website that can be fullscreened for more accessibility.

**API Overview**

- **POST /api/auth/signup** - Register new user (Public)
- **POST /api/auth/login** - Authenticate user (Public)
- **GET /api/ads** - Get all advertisements with pagination, sorting, and filtering (Authenticated)
- **POST /api/ads** - Create new advertisement (Authenticated)
- **PUT /api/ads/:id** - Update existing advertisement (Authenticated)
- **DELETE /api/ads/:id** - Delete advertisement (Authenticated)
- **GET /api/displays** - Get all connected display units with pagination and sorting (Authenticated)
- **POST /api/displays** - Create new display (Authenticated)
- **GET /api/displays/:id** - Get display details (Authenticated)
- **PUT /api/displays/:id** - Update display (Authenticated)
- **DELETE /api/displays/:id** - Delete display (Authenticated)
- **POST /api/displays/register** - Register display device (Public)
- **POST /api/displays/login** - Display device login (Public)
