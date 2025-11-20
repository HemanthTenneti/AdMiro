# 🎯 AdMiro - Digital Advertisement Management System

A modern, full-stack web application for managing digital advertisements and display systems. AdMiro allows businesses to create, organize, and distribute advertisements across multiple display devices with real-time synchronization.

---

## Features

### Display Management

- Create and manage multiple display devices
- Real-time connection status monitoring (online/offline)
- Unique connection tokens for secure display pairing
- Display details with creation and update timestamps
- Full CRUD operations for displays

### Advertisement System

- **Flexible Media Input**:
  - Upload media files (images & videos)
  - Direct URL/link support for external media
  - Automatic base64 encoding for serverless compatibility
- **Media Support**: JPG, PNG, GIF, WebP (images) & MP4, MOV, AVI (videos)
- **Auto-Active Status**: All advertisements immediately active on creation
- **File Size Limits**: 100MB for media, 5MB for profile pictures
- **Direct Database Storage**: All media stored as base64 in MongoDB (no disk dependencies)

### Display Loop System

- Group advertisements into custom playlists/loops
- Multiple rotation types: sequential, random, weighted
- Drag-and-drop ad ordering within loops
- Loop assignment to specific displays
- Auto-populate ad durations for total loop time calculation

### Dashboard UI/UX

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Dark/Light Theme Support**: Built-in theme switching
- **Real-time Updates**: 30-second polling for loop synchronization
- **Smooth Animations**: GSAP-powered transitions
- **Responsive Layout**: Mobile-first design approach
- **Consistent Dialogs**: Toast notifications + confirmation modals instead of browser alerts

### Security & Auth

- JWT-based authentication
- Google OAuth 2.0 integration
- Password hashing with bcryptjs
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for HTTP security headers
- CORS protection

### Logging System

- Comprehensive activity logging
- Track create, update, and delete operations
- Filter logs by action type and entity
- Search and pagination support
- Full audit trail for compliance

### User Management

- User profile management
- Base64-encoded profile pictures stored in MongoDB
- Account settings and customization
- Multi-user support with role-based access

---

## Project Structure

### Backend (`AdMiroBackend/`)

```
src/
├── controllers/          # Business logic for each feature
├── models/              # MongoDB schemas
├── routes/              # API endpoints
├── middleware/          # Auth, CORS, logging, upload
├── services/            # Reusable services (logging)
├── config/              # Database and configuration
├── utils/               # Helper functions
└── server.js            # Express server entry point
```

**Key Technologies:**

- **Runtime**: Node.js with ES modules
- **Server**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js (Google OAuth)
- **File Handling**: Multer with in-memory storage
- **Validation**: Express-validator
- **Logging**: Morgan + custom logging service
- **Security**: Helmet, CORS, Rate limiting

### Frontend (`AdMiroFrontend/`)

```
src/
├── app/                 # Next.js app router pages
│   ├── dashboard/       # Admin interface
│   ├── display/         # Display playback screen
│   └── auth-callback/   # OAuth redirect
├── components/          # Reusable React components
├── context/             # Zustand store for state
├── hooks/               # Custom React hooks
├── lib/                 # API client & utilities
└── constants/           # App constants
```

**Key Technologies:**

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **API Client**: Axios with custom config
- **Icons**: Phosphor React
- **Animations**: GSAP
- **Notifications**: Sonner toast library
- **Build**: Webpack-based bundler

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB instance (local or cloud)
- Google OAuth credentials (optional, for auth)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd AdMiroBackend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file:**

   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/admiro
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd AdMiroFrontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env.local` file:**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

App runs on `http://localhost:3000`

---

## Usage Workflows

### Creating & Displaying Ads

1. **Create Advertisement**:

   - Go to Dashboard → Advertisements → Create New
   - Choose media input: Upload file OR paste URL
   - Set duration (1-300 seconds)
   - Publish (auto-active)

2. **Create Playlist/Loop**:

   - Go to Dashboard → Playlists
   - Create new loop with name & description
   - Add advertisements with drag-drop ordering
   - Set rotation type (sequential, random, weighted)

3. **Assign to Display**:

   - Go to Display → Manage Loops
   - Click "Assign to Display" on desired loop
   - Display will automatically load ads on next refresh

4. **View on Display**:
   - Navigate to display page with connection token
   - Ads appear in full-screen mode
   - Auto-rotates based on duration
   - Use menu to refresh, switch displays, or logout

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google` - Google OAuth callback

### Advertisements

- `GET /api/ads` - List all ads (paginated)
- `POST /api/ads` - Create new ad (file or link)
- `GET /api/ads/:id` - Get ad details
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad

### Displays

- `GET /api/displays` - List all displays
- `POST /api/displays` - Create new display
- `GET /api/displays/:id` - Get display details
- `PUT /api/displays/:id` - Update display
- `DELETE /api/displays/:id` - Delete display
- `PUT /api/displays/:displayId/assign-loop` - Assign loop to display
- `GET /api/displays/loop/:token` - Get assigned loop (public endpoint)
- `POST /api/displays/login-display` - Login as display
- `POST /api/displays/report-status` - Report display status

### Display Loops

- `GET /api/loops` - List all loops
- `POST /api/loops` - Create new loop
- `GET /api/loops/:id` - Get loop details
- `PUT /api/loops/:id` - Update loop
- `DELETE /api/loops/:id` - Delete loop
- `POST /api/loops/:loopId/add-ad` - Add ad to loop

### Logs

- `GET /api/logs` - List activity logs
- `DELETE /api/logs/:id` - Delete log entry

### User Profile

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/upload-picture` - Upload profile picture

---

## Database Schema

### User Model

- Email, password (hashed), profile picture
- Display ownership references
- Timestamps

### Advertisement Model

- Ad name, description, media URL
- Media type (image/video), duration
- Status (active/draft)
- File size tracking
- Creator reference

### Display Model

- Display ID, name, location
- Resolution (width, height)
- Connection token (unique)
- Current loop assignment
- Admin reference
- Status tracking

### DisplayLoop Model

- Loop name, description
- Rotation type setting
- Advertisements array with order
- Total duration calculation
- Owner reference

### SystemLog Model

- Action (create, update, delete)
- Entity type and ID
- Changes tracking
- User reference
- Timestamp

---

## Deployment

### Environment Setup

- Set environment variables for production
- Use MongoDB Atlas for cloud database
- Configure Google OAuth for production domain
- Set secure JWT secrets

### Building for Production

**Backend:**

```bash
npm run build  # If applicable
npm start
```

**Frontend:**

```bash
npm run build
npm start
```

### Deployment Platforms

- **Backend**: Heroku, Railway, Render, AWS Lambda
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Storage**: MongoDB (base64), AWS S3 (optional)

---

## Security Features

- JWT authentication with secure tokens
- Password hashing with bcryptjs
- CORS protection
- Rate limiting on API endpoints
- Helmet.js security headers
- Input validation with express-validator
- Secure session management
- Base64 encoding for media (no file system exposure)

---

## Performance Optimizations

- **Next.js Image Optimization**: Remote pattern configuration
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Client-side state management with Zustand
- **Code Splitting**: Next.js automatic chunking
- **Polling Strategy**: Efficient 30-second loop sync
- **Lazy Loading**: Component-level code splitting

---

## Development Tools

- **Code Quality**: ESLint + Prettier
- **Hot Reload**: Nodemon (backend), Next.js Fast Refresh
- **Database**: MongoDB Compass, Mongo Shell
- **API Testing**: Postman, cURL
- **Version Control**: Git with conventional commits

---

## Environment Variables

### Backend `.env`

```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/admiro
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=client-id
GOOGLE_CLIENT_SECRET=client-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=client-id
```

---

## License

This project is licensed under the MIT License.

---

**AdMiro** - Making digital advertisement management simple, efficient, and beautiful.
