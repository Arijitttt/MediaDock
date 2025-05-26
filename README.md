# 🎥 Video Sharing Platform Backend

This repository contains the **backend** of a full-stack video-sharing platform built using Node.js and MongoDB. It powers features such as video uploads, user authentication, likes/dislikes, comments, playlists, subscriptions, and tweet-like short messages.

---

## 🚀 Features

- ✅ User authentication with secure cookie handling
- 📹 Video upload, update, delete, and retrieval
- 👍 Like/Dislike functionality for videos
- 💬 Comment system with support for replies
- 📁 Playlist creation and management
- 🔔 Subscription system (subscribe/unsubscribe to users)
- 🐦 Tweet-like short message sharing
- 🩺 Health check API endpoint
- 🔐 CORS and secure frontend integration

---

## 🧩 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Middleware:** cookie-parser, CORS, body-parser
- **Other:** File handling, environment configuration, modular route architecture

---

## 🗂️ Project Structure
```bash
video-backend/
│
├── routes/              # All route files (user, video, like, comment, etc.)
├── controllers/         # Business logic for each route
├── models/              # Mongoose schema definitions (User, Video, Comment, etc.)
├── middlewares/         # Custom error handlers, authentication, async wrappers
├── utils/               # Utility functions (e.g., async handler, email, validation)
├── public/              # Static assets like thumbnails, default profile pictures
├── app.js               # Main Express app setup with routes and middlewares
├── index.js            # Server entry point
└── .env                 # Environment variables
```
---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/video-backend.git
cd video-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

### 4. Run the server
```bash
# Start server
npm start

# Or for development (with auto-restart using nodemon)
npm run dev
```
