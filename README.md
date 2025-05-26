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
## 🔄 MongoDB Aggregation Pipeline Usage
This backend makes extensive use of **MongoDB Aggregation Pipelines** to optimize data processing at the database level. Common usage includes:

- **Trending Videos:**
```js
Video.aggregate([
    { $lookup: { from: 'likes', localField: '_id', foreignField: 'video', as: 'likes' }},
    { $addFields: { likeCount: { $size: '$likes' }}},
    { $sort: { likeCount: -1 }}
  ])
```
- **📰 Subscription Feed**
  ```js
  User.aggregate([
  { $match: { _id: userId }},
  { $lookup: {
      from: 'videos',
      localField: 'subscribedTo',
      foreignField: 'owner',
      as: 'feedVideos'
  }},
  { $unwind: '$feedVideos' },
  { $sort: { 'feedVideos.createdAt': -1 }}
  ])

  ```
  - more...
  ---
## 🔐 Access Token & Refresh Token Authentication

This project uses **Access Tokens** and **Refresh Tokens** to manage secure and scalable user authentication.

### 🪪 Access Token
- Short-lived JWT (e.g., expires in 15 minutes).
- Sent via `Authorization: Bearer <token>` in headers for each protected API request.
- Used for verifying the user during actions like uploading a video, liking, commenting, etc.

### 🔄 Refresh Token
- Long-lived JWT (e.g., expires in 7 days).
- Stored securely in **HTTP-only cookies**.
- Sent to a dedicated refresh endpoint (e.g., `/api/v1/user/refresh-token`) to obtain a new access token once it expires.
- Automatically handled via cookies on the frontend.

### Token Flow:

1. **Login/Register**
   - Backend generates both `accessToken` and `refreshToken`.
   - `accessToken` is sent in the response body.
   - `refreshToken` is sent in an `HttpOnly` cookie.

2. **Authenticated Request**
   - Frontend includes `accessToken` in the `Authorization` header.

3. **Token Expiry**
   - If `accessToken` expires, the frontend automatically calls the refresh route.
   - Backend validates the `refreshToken` and returns a new `accessToken`.

4. **Logout**
   - Clears the `refreshToken` cookie on the client.

---

## 🆚 How This Project Stands Out

Unlike many beginner backend projects (e.g., simple to-do apps or blogs), this project simulates a **real-world content platform**, offering:

- **🎛️ Multi-feature design:**  
  Combines user authentication, media uploads, social interactions, playlists, and tweet-like messaging — all in one codebase.

- **📦 Modular architecture:**  
  Routes, controllers, models, and middlewares are cleanly separated, following industry best practices and keeping the codebase maintainable.

- **🔐 Advanced JWT token handling:**  
  Implements secure `accessToken` + `refreshToken` strategy with `HttpOnly` cookie storage to protect users from XSS attacks and improve token lifecycle management.

- **⚙️ MongoDB Aggregation Pipelines:**  
  Uses powerful MongoDB pipelines to perform complex data transformations and calculations directly in the database for better performance and scalability.

- **🔄 Practical use cases:**  
  Mimics YouTube/Twitter-like features that are highly relevant for modern web application developers and full-stack projects.

- **🚀 Scalability-ready:**  
  The structure supports easy integration with cloud storage (e.g., AWS S3), CDN for video streaming, and future expansion like real-time notifications or chat features.

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
