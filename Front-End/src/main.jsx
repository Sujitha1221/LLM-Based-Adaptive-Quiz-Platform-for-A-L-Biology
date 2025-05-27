import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Main from "./components/Layout/Main.jsx";
import Login from "./components/Login/Login.jsx";
import SignUp from "./components/SignUp/SignUp.jsx";
import MCQHomePage from "./components/MCQ/MCQHomePage.jsx";
import QuizPage from "./components/MCQ/QuizPage.jsx";
import QuizResults from "./components/MCQ/QuizResults.jsx";
import QuizHistory from "./components/MCQ/QuizHistory.jsx";
import PerformanceDashboard from "./components/MCQ/PerformanceDashboard.jsx";
import UnitBasedQuizzes from "./components/MCQ/TopicBasedQuiz/TopicBasedQuizzes.jsx";
import UnitQuizPage from "./components/MCQ/TopicBasedQuiz/TopicBasedQuizPage.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import UnitQuizResults from "./components/MCQ/TopicBasedQuiz/TopicBasedQuizResults.jsx";

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token"); // Check if logged in
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: "/", // Login Page (Public)
    element: <Login />,
  },
  {
    path: "/signup", // Signup Page (Public)
    element: <SignUp />,
  },
  {
    path: "/", // Parent route for authenticated pages
    element: (
      <>
        <ScrollToTop /> {/*Ensures page scrolls to top on route change */}
        <ProtectedRoute element={<Main />} />
      </>
    ),
    children: [
      {
        index: true,
        path: "MCQ-home",
        element: <ProtectedRoute element={<MCQHomePage />} />,
      },
      {
        path: "quiz-page",
        element: <ProtectedRoute element={<QuizPage />} />,
      },
      {
        path: "quiz-results",
        element: <ProtectedRoute element={<QuizResults />} />,
      },
      {
        path: "quiz-history",
        element: <ProtectedRoute element={<QuizHistory />} />,
      },
      {
        path: "performance-dashboard",
        element: <ProtectedRoute element={<PerformanceDashboard />} />,
      },
      {
        path: "topic-quizzes",
        element: <ProtectedRoute element={<UnitBasedQuizzes />} />,
      },
      {
        path: "unit_quiz",
        element: <ProtectedRoute element={<UnitQuizPage />} />,
      },
      {
        path: "unit_quiz/results",
        element: <ProtectedRoute element={<UnitQuizResults />} />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
