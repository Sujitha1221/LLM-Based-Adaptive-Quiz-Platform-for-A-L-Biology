# 🧠 LLM-Based Adaptive Quiz Platform for A/L Biology

This project is a full-stack AI-powered system designed to generate, adapt, and evaluate Biology MCQs for A/L students. It integrates **Large Language Models (LLMs)**, **Item Response Theory (IRT)**, **Retrieval-Augmented Generation (RAG)**, and **semantic search (FAISS)** to deliver personalized and curriculum-aligned assessments that evolve based on student performance.

---

## 🚀 Key Features

- **Adaptive MCQ Generation**: Questions dynamically adapt to the learner's ability using IRT-based heuristics.
- **Unit-Based Quizzes**: Practice specific units or chapters from the A/L Biology curriculum.
- **Answer Explanation & Verification**: AI-generated justifications and correctness checks enhance learning.
- **Performance Dashboard**: Tracks accuracy, speed, trends, consistency, and topic strengths.
- **Quiz History & Retry**: Access past attempts with the option to retry quizzes for improvement.
- **Duplicate Prevention**: FAISS + cosine similarity ensures unique, semantically diverse questions.

---

## 📂 Project Structure

```
├── backend/
│ ├── routes/
│ │ ├── adaptive_quiz_routes.py
│ │ ├── mcq_routes.py
│ │ ├── response_routes.py
│ │ ├── topic_based_quiz_routes.py
│ │ └── explanation_routes.py
│ ├── utils/
│ │ ├── generate_question.py
│ │ ├── quiz_generation_methods.py
│ │ ├── model_loader.py
│ │ ├── text_extraction.py
│ │ └── user_mgmt_methods.py
│ ├── main.py
│ └── database/
│ └── (MongoDB connection scripts)
│
├── frontend/
│ ├── pages/
│ │ ├── MCQHomePage.jsx
│ │ ├── QuizPage.jsx
│ │ ├── QuizResults.jsx
│ │ ├── QuizHistory.jsx
│ │ ├── PerformanceDashboard.jsx
│ │ ├── TopicBasedQuizzes.jsx
│ │ ├── TopicBasedQuizPage.jsx
│ │ └── TopicBasedQuizResults.jsx
│ ├── components/
│ │ ├── QuizIntroductionModal.jsx
│ │ ├── SubmitConfirmationModal.jsx
│ │ ├── MCQExplanationModal.jsx
│ │ ├── ExplanationModel.jsx
│ │ └── RetryQuizModel.jsx
│ └── App.js
```

---

## 🛠️ Technologies Used

### 🧠 Machine Learning & NLP
- LLaMA 2 (7B Chat) — fine-tuned using QLoRA
- Sentence Transformers (MiniLM-L6-v2)
- FAISS — for semantic similarity search
- IRT (2PL model) for adaptive difficulty control

### 💻 Backend
- FastAPI
- MongoDB (quizzes, users, responses)
- systemd + Nginx + Azure VM deployment
- JWT-based authentication
- GitHub Actions for CI/CD

### 🌐 Frontend
- React.js
- Framer Motion for animations
- Chart.js for visualizing performance
- Responsive UI with modular component design

---

## ⚙️ How It Works

1. **User Registration & Login**  
   Secure JWT authentication for protected quiz routes.

2. **First Quiz Initialization**  
   User receives an even distribution of easy, medium, and hard questions.

3. **Adaptive Quiz Flow**  
   - User’s ability (θ) is estimated from past accuracy and response time.
   - Difficulty distribution adapts using the 2PL IRT model.
   - RAG retrieves semantically relevant MCQs to guide generation.
   - Duplicate filtering via cosine similarity and FAISS.

4. **Answer Submission & Evaluation**  
   - Accuracy, total time, per-question time, and correctness tracked.
   - Performance trends and consistency are updated in the dashboard.

5. **Explanation & Verification**  
   Users can get justifications and correctness validation post-submission.

6. **Topic-Based Practice Mode**  
   Target quizzes by specific biology units.

---

## 📊 Performance Dashboard

- **Quiz accuracy trends**
- **Time efficiency**
- **Strongest/weakest areas**
- **Engagement and consistency score**
- **Leaderboard with top-performing users**

---

## 💾 Deployment

### 🔧 Backend (FastAPI on Azure VM)

- Quantized `.gguf` LLaMA model deployed via `llama.cpp`
- Hosted behind Nginx as reverse proxy
- Running via `systemd` for persistent serving

### 🔧 Frontend

- Built using React, deployed via any static host (Vercel, Netlify, etc.)

---

## 🧪 Example API Endpoints

| Method | Endpoint                                      | Description                        |
|--------|-----------------------------------------------|------------------------------------|
| GET    | `/mcqs/generate_mcqs/{user_id}`               | Generate first-level quiz          |
| GET    | `/quiz/generate_adaptive_mcqs/{user_id}/{n}`  | Adaptive quiz based on performance |
| POST   | `/responses/submit_quiz/`                     | Submit quiz attempt                |
| GET    | `/responses/user_quiz_history/{user_id}`      | Get quiz history                   |
| POST   | `/explanations/mcq/verify_and_explain`        | Get explanation + verify answer    |

---

## 📌 Future Enhancements

- Add image-based questions (e.g., diagrams, labels)
- Integrate spaced repetition for weak topics
- Export full analytics PDF for each student
- Admin panel for curriculum control

---

## 📜 License

This project is for academic and research use. Contact the repository owner for deployment or commercial inquiries.

---

## 🙌 Acknowledgments

- Biology Teacher at Saiva Mangaiyar Vidyalayam for dataset labeling
- LLaMA and Hugging Face communities

---

## 📫 Contact

**Author**: Sujitha  
**Email**: *[sujithasrikanthan@gmail.com]*  

