import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios/api";
import { FaRedo, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import moment from "moment";
import RetryQuizModal from "./models/RetryQuizModel";
import QuizLoadingScreen from "./loadingPage/QuizLoadingScreen";

const QuizHistory = () => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const userId = user?.user_id;
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    if (!userId || !token) {
      navigate("/");
    } else {
      fetchQuizHistory();
    }
  }, [userId, token, navigate]); //  Now it only runs when userId or token changes

  const fetchQuizHistory = async () => {
    try {
      const response = await api.get(
        `/responses/user_quiz_history/${user.user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.quiz_history) {
        const sortedHistory = response.data.quiz_history.sort((a, b) => {
          const firstAttemptA = a.attempts[0]?.submitted_at || 0;
          const firstAttemptB = b.attempts[0]?.submitted_at || 0;
          return firstAttemptA - firstAttemptB;
        });
        setQuizHistory(sortedHistory);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      setLoading(false);
    }
  };

  const viewAttempt = (userId, quizId, attemptNumber) => {
    navigate("/quiz-results", { state: { userId, quizId, attemptNumber } });
  };

  const openRetryModal = (quizId) => {
    setSelectedQuizId(quizId);
    setModalOpen(true);
  };

  const handleRetryQuiz = async (quizId) => {
    setModalOpen(false);
    try {
      const response = await api.get(`/mcqs/get_quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        navigate("/quiz-page", {
          state: { quizId, questions: response.data.questions },
        });
      } else {
        console.error("Quiz not found.");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)} sec`; // Show seconds for values < 60
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} min ${remainingSeconds} sec`; // Show MM:SS for values >= 60
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5 sm:p-10">
      <motion.h1
        className="text-3xl sm:text-5xl font-extrabold text-gray-800 text-center mb-6 sm:mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <p className="text-center text-gray-600 text-lg">
            📜 Loading your quiz history...
          </p>
        ) : (
          <h1 className="text-3xl sm:text-5xl font-extrabold text-indigo-800 text-center mb-6 sm:mb-10">
            📜 Your Quiz History
          </h1>
        )}
      </motion.h1>
      <p className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-8">
        Here you can review all your past quiz attempts. Click{" "}
        <span className="font-semibold">"View Results"</span> to check your
        answers and learn from your mistakes. You can also{" "}
        <span className="font-semibold">retry any quiz</span> to practice,
        though it won't affect your overall performance score.
      </p>

      {loading ? (
        <QuizLoadingScreen />
      ) : quizHistory.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No quiz attempts found.
        </p>
      ) : (
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-8 bg-white p-5 sm:p-8 rounded-2xl shadow-lg">
          {quizHistory.map((quiz, index) => (
            <motion.div
              key={quiz.quiz_id}
              className="mb-6 sm:mb-10 border-b pb-4 sm:pb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-1 sm:mb-2">
                🏆 Quiz {index + 1}
              </h2>
              <p className="text-gray-500 text-lg mb-3">
                🔁 Attempts: {quiz.attempts.length} | 🏅 Best Score:{" "}
                {Math.max(...quiz.attempts.map((a) => a.summary.accuracy))}%
              </p>

              <p className="text-gray-500 mb-2 sm:mb-4 text-lg">Attempts:</p>
              <ul className="list-none space-y-3 sm:space-y-4">
                {quiz.attempts
                  .sort((a, b) => a.submitted_at - b.submitted_at)
                  .map((attempt) => (
                    <motion.li
                      key={attempt.response_id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-200 p-3 sm:p-4 rounded-lg shadow-md hover:bg-gray-300 transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <span className="font-semibold text-lg">
                          Attempt {attempt.attempt_number}:
                        </span>
                        <span className="ml-2 sm:ml-3 text-gray-700 text-lg">
                          📅{" "}
                          {moment(attempt.submitted_at * 1000).format(
                            "MMMM D, YYYY"
                          )}{" "}
                          - 🕒{" "}
                          {moment(attempt.submitted_at * 1000).format(
                            "hh:mm A"
                          )}
                        </span>
                        <span
                          className={`mt-2 sm:mt-0 ml-0 sm:ml-3 block sm:inline text-lg px-3 py-1 rounded-lg ${
                            attempt.summary.accuracy >= 70
                              ? "bg-green-200 text-green-800"
                              : attempt.summary.accuracy >= 40
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          Score: {attempt.summary.accuracy}%
                        </span>
                        <span className="block sm:inline mt-2 sm:mt-0 text-gray-700 text-lg">
                          {" "}
                          ⏳ Total Time:{" "}
                          {formatTime(attempt.summary.total_time)}s
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          viewAttempt(
                            userId,
                            quiz.quiz_id,
                            attempt.attempt_number
                          )
                        }
                        className="mt-3 sm:mt-0 px-4 py-2 bg-[#140342] text-white rounded-lg hover:bg-[#140342] transition-all"
                      >
                        <FaEye className="mr-2" /> View Results
                      </button>
                    </motion.li>
                  ))}
              </ul>
              <div className="mt-4 sm:mt-6 w-full sm:w-auto">
                <motion.button
                  onClick={() => openRetryModal(quiz.quiz_id)}
                  className={`px-5 py-3 flex items-center justify-center text-white text-lg font-bold rounded-lg w-full sm:w-auto transition-all ${
                    quiz.attempts.length >= MAX_ATTEMPTS
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                  whileHover={{
                    scale: quiz.attempts.length < MAX_ATTEMPTS ? 1.05 : 1,
                  }}
                  disabled={quiz.attempts.length >= MAX_ATTEMPTS}
                >
                  <FaRedo className="mr-2" />
                  Retry Quiz
                </motion.button>
                {quiz.attempts.length >= MAX_ATTEMPTS && (
                  <p className="mt-2 text-red-600 font-medium">
                    ❌ Retry limit reached (max {MAX_ATTEMPTS} attempts)
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <RetryQuizModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => handleRetryQuiz(selectedQuizId)} //  Wrap in a function
      />
    </div>
  );
};

export default QuizHistory;
