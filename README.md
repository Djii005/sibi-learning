# SIBI Learning Platform 🇮🇩🖐️

An interactive, modern web application designed to help users learn **SIBI** (*Sistem Isyarat Bahasa Indonesia* — Indonesia's official sign language). Utilizing real-time hand-tracking and machine learning models directly in the browser, the application provides instant feedback on sign correctness while ensuring complete user privacy.

---

## ✨ Key Features

- **Real-Time Hand Gesture Recognition**: Utilizes **MediaPipe Hands** and **TensorFlow.js** for immediate sign detection.
- **Privacy-First (On-Device Inference)**: All video frames are processed locally in the user's browser; camera feeds are never uploaded to any server.
- **Structured Curriculum**: Lessons categorized by **Alphabets** (static signs using CNN), **Numbers**, and **Greetings/Words** (dynamic signs using LSTM).
- **Interactive Practice Mode**: Built-in sandbox allowing users to practice gestures with visual cues and confidence scores.
- **Progress Tracking**: Secure user registration, authentication (JWT), and persistent progress tracking.
- **Hybrid Classifier Fallback**: Features a fallback keypoint-similarity classifier so the app remains fully functional even without pre-loaded custom neural networks.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 18+ (Vite, TypeScript)
- **Styling**: Tailwind CSS
- **Machine Learning**: TensorFlow.js & MediaPipe Hands
- **State Management**: Simple React hooks and context-based state

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (JSON Web Tokens) with secure password hashing (Passlib/Bcrypt)
- **Dependency Management**: Poetry

### Machine Learning Pipeline
- **Libraries**: TensorFlow, Keras, NumPy, OpenCV
- **Models**:
  - **CNN**: Trained on landmark keypoints for static letter recognition.
  - **LSTM**: Captures temporal hand movement sequences for dynamic greetings and words.
- **Dataset**: Kaggle SIBI Alphabets dataset.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.11 or higher)
- **Poetry** (Python package manager)

---

### Local Development Setup

#### 1. Backend Server
Navigate to the `backend/` directory, install dependencies, and spin up the server:
```bash
# Navigate to backend
cd backend

# Install dependencies using Poetry
poetry install

# Run the FastAPI development server
poetry run uvicorn app.main:app --reload --port 8000
```
The backend API will run on `http://localhost:8000`. API documentation is automatically generated and accessible at `http://localhost:8000/docs`.

#### 2. Frontend Application
Navigate to the `frontend/` directory, set up the environment variables, and start the Vite development server:
```bash
# Navigate to frontend
cd frontend

# Copy local environment template
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will be hosted on `http://localhost:5173`. Open it in your browser, register a new account, and begin practicing!

---

## 📦 Production Deployment

### Frontend (Vercel / Netlify)
1. Set the build command to `npm run build` and output directory to `dist`.
2. Configure the environment variable `VITE_API_URL` to point to your deployed FastAPI backend URL.

### Backend (Render / Fly.io / Railway)
1. Deploy using the included `backend/Procfile` or configure the startup command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Set up environment variables for:
   - `DATABASE_URL` (if migrating from SQLite to PostgreSQL/MySQL, or mount a persistent volume for SQLite).
   - `SECRET_KEY` (a secure random string for signing JWT tokens).

---

## 🧑‍💻 Machine Learning Workflow (Optional)
If you wish to retrain or customize the hand gesture models:
1. Navigate to the `ml/` directory.
2. Install dependencies via `pip install -r requirements.txt`.
3. Run `download_dataset.py` to fetch the SIBI dataset.
4. Process coordinates and train the models with `extract_landmarks.py` and `train_cnn_letters.py`/`train_lstm_words.py`.
5. Run `export_to_tfjs.py` to convert the trained `.h5` Keras models into web-friendly JSON format for the React frontend.

---

## 🔒 Security & Privacy
This application is designed with user security at its core:
- **Zero-Storage Camera Policy**: Video inputs are mapped to browser-level canvas buffers for keypoint extraction and immediately discarded.
- **Secure Token Authentication**: User passwords are encrypted using `bcrypt`. Authentication state is preserved securely via short-lived JWT tokens.

---

## 📄 License
This project is licensed under the **MIT License**.
