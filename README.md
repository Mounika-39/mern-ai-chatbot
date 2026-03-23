# 🤖 AI Chatbot - MERN Stack Application

A full-featured AI chatbot built using the **MERN stack** with authentication, file analysis, and intelligent conversations.

---

## 🚀 Features

* 🔐 User Registration & Login (Authentication)
* 🤖 AI-powered conversations (OpenRouter API)
* 📂 File upload & analysis (`.txt`, `.md`)
* 🧠 Chat history with pin & tag functionality
* 🌙 Dark / Light theme toggle
* 🎤 Voice input support
* 📱 Fully responsive design

---

## 🛠 Tech Stack

### Frontend

* React 18
* React Router
* Axios
* Lucide Icons
* Vite

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* OpenRouter API

---

## ⚙️ Setup Instructions

### 📌 Prerequisites

* Node.js (v18 or higher)
* MongoDB Atlas account
* OpenRouter API key

---

## 📥 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mounika-39/mern-ai-chatbot.git
cd mern-ai-chatbot
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

👉 Add the following in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-chatbot
OPENROUTER_API_KEY=your_openrouter_api_key
```

▶️ Start backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

👉 Open in browser:

```
http://localhost:5173
```

---

## 🔗 API Endpoints

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | /api/auth/register | Register user      |
| POST   | /api/auth/login    | Login user         |
| GET    | /api/user/profile  | Get profile        |
| PUT    | /api/user/profile  | Update profile     |
| POST   | /api/chat          | Send message to AI |

---

## 📄 Environment Variables

### Backend (`.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
OPENROUTER_API_KEY=your_api_key
```


