import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../axios/api";
import SubmitConfirmationModal from "./models/SubmitConfirmationModal";
import LoadingScreen from "./loadingPage/QuizLoadingScreen";

const difficultyColors = {
  easy: "bg-green-200 text-green-800",
  medium: "bg-yellow-200 text-yellow-800",
  hard: "bg-red-200 text-red-800",
};

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = location.state || {};
  const [questions, setQuestions] = useState(location.state?.questions || null);
  const [showSubmitModal, setShowSubmitModal] = useState(false); //  State for modal
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [startTime, setStartTime] = useState(Date.now());
  const [unanswered, setUnanswered] = useState([]);
  const [timer, setTimer] = useState(2700); // 45 minutes timer
  const [speaking, setSpeaking] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!quizId) {
      console.warn("Quiz ID is missing. Redirecting...");
      navigate("/mcq-home");
    } else if (!questions) {
      fetchQuizData();
    }
  }, [quizId, questions, navigate]);

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const hasUnverified = questions.some((q) => q.is_verified === false);
    setShowVerificationNotice(hasUnverified);

    // Auto-hide after 6 seconds
    if (hasUnverified) {
      const timeout = setTimeout(() => {
        setShowVerificationNotice(false);
      }, 6000);
      return () => clearTimeout(timeout); // clean up
    }
  }, [questions]);

  const fetchQuizData = async () => {
    try {
      const response = await api.get(`/responses/get_quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setQuestions(response.data.questions);
      } else {
        console.error("Quiz not found.");
        navigate("/mcq-home");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      navigate("/mcq-home");
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech.");
    }
  };

  const handleSpeak = () => {
    const questionText = currentQuestion.question_text;
    const optionsText = filteredOptions
      .map((option, idx) => `Option ${optionsMap[idx]}: ${option}`)
      .join(". ");
    const textToRead = `Question ${
      currentQuestionIndex + 1
    }. ${questionText}. ${optionsText}`;
    speakText(textToRead);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center text-white">
        <p>⚠️ No quiz data available. Redirecting...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const optionsMap = ["A", "B", "C", "D", "E"];

  const filteredOptions = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4,
    currentQuestion.option5,
  ].filter((option) => option !== "N/A");

  //  Update time spent on a question
  const updateTimeSpent = (index) => {
    return new Promise((resolve) => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;

      setTimeSpent((prev) => {
        const updatedTime = {
          ...prev,
          [index]: (prev[index] || 0) + timeTaken,
        };
        console.log(
          `⏳ Time Updated for Question ${index + 1}:`,
          updatedTime[index]
        ); // Debugging log
        resolve(updatedTime); // Ensure we resolve with the new state
        return updatedTime;
      });

      setStartTime(Date.now());
    });
  };

  //  Handle Answer Selection
  const handleAnswerSelect = (letter) => {
    setAnswers({ ...answers, [currentQuestionIndex]: letter });
  };

  //  Handle Next & Previous Button Clicks
  const handleNext = () => {
    updateTimeSpent(currentQuestionIndex);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handlePrevious = () => {
    updateTimeSpent(currentQuestionIndex);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleQuestionSelect = (index) => {
    updateTimeSpent(currentQuestionIndex); // Update time before switching
    setCurrentQuestionIndex(index);
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  //  Handle quiz submission
  const handleSubmit = async () => {
    console.log("Ensuring last question time is recorded before submitting...");
    await updateTimeSpent(currentQuestionIndex);

    // Check for unanswered questions
    const unansweredIndexes = questions
      .map((_, index) => (!answers.hasOwnProperty(index) ? index + 1 : null))
      .filter((index) => index !== null);

    setUnanswered(unansweredIndexes);

    if (unansweredIndexes.length > 0) {
      if (
        !window.confirm(
          `⚠️ You have unanswered questions: ${unansweredIndexes.join(
            ", "
          )}. Submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitting(true); // ✅ Show loading screen

    const quizResults = questions.map((q, index) => ({
      question_text: q.question_text,
      selected_answer: answers[index] || "No Answer",
      time_taken: timeSpent[index] || 0,
    }));

    console.log("📤 Sending Quiz Data:", {
      user_id: user.user_id,
      quiz_id: quizId,
      responses: quizResults,
    });
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await api.post(
        "responses/submit_quiz/",
        {
          user_id: user.user_id,
          quiz_id: quizId,
          responses: quizResults,
        },
        { headers }
      );

      navigate("/quiz-results", {
        state: {
          userId: response.data.user_id,
          quizId: response.data.quiz_id,
          attemptNumber: response.data.attempt_number,
        },
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setSubmitting(false); // ❌ Hide loading if it fails
    }
  };

  useEffect(() => {
    if (timer <= 0) {
      handleSubmit(); // Auto-submit when time runs out
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); //  Cleanup to avoid memory leaks
  }, [timer]);

  if (submitting) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row justify-center items-start sm:items-center bg-gradient-to-br from-gray-100 to-gray-50 text-gray-900 p-5">
      <motion.div
        className="w-full sm:w-3/4 bg-white p-8 rounded-2xl shadow-xl border border-gray-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-xl font-bold text-red-600 flex justify-center items-center gap-2">
          <Clock className="w-5 h-5" /> Time Left: {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, "0")}
        </div>

        {/*  Question Progress */}
        <div className="w-full bg-gray-300 h-2 rounded-full my-4">
          <motion.div
            className="bg-[#140342] h-2 rounded-full"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="relative w-full">
          {/* Difficulty Tag */}
          <div className="flex justify-end mt-2 sm:mt-0 sm:absolute sm:top-2 sm:right-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                difficultyColors[currentQuestion?.difficulty] ||
                "bg-gray-200 text-gray-800"
              }`}
            >
              {currentQuestion?.difficulty || "Unknown"}
            </span>
          </div>

          {/* Question Number */}
          <h2 className="text-3xl font-extrabold mb-4 text-center tracking-wider text-[#140342]">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
        </div>
        {showVerificationNotice && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-500 text-center mt-[-10px] mb-4 italic"
          >
            ⚠ Some answers are still being verified.
          </motion.p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <p className="text-lg font-semibold text-center text-gray-700 w-full sm:text-center sm:flex-1">
            {currentQuestion.question_text}
          </p>
          <div className="mt-3 sm:mt-0 sm:ml-4 flex justify-center sm:justify-end w-full sm:w-auto whitespace-nowrap">
            {speaking ? (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-md font-semibold"
              >
                🛑 Stop
              </button>
            ) : (
              <button
                onClick={handleSpeak}
                className="flex items-center gap-2 bg-[#140342] text-white px-4 py-2 rounded-md font-semibold"
              >
                🔊 Speak
              </button>
            )}
          </div>
        </div>

        {/*  Answer Choices */}
        <div className="mt-4 space-y-3">
          {filteredOptions.map((option, index) => {
            const letter = optionsMap[index];
            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(letter)}
                whileTap={{ scale: 0.95 }}
                className={`w-full px-5 py-3 rounded-lg border transition-all duration-300 text-lg font-semibold 
                  ${
                    answers[currentQuestionIndex] === letter
                      ? "bg-[#140342] border-blue-900 text-white shadow-lg"
                      : "bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-[#140342]"
                  }`}
              >
                {letter}. {option}
              </motion.button>
            );
          })}
        </div>

        {/*  Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-lg flex gap-2 items-center justify-center ${
              currentQuestionIndex === 0
                ? "bg-gray-400 opacity-50 cursor-not-allowed"
                : "bg-indigo-200 hover:bg-indigo-300 text-blue-900"
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#140342] hover:bg-[#140342] font-semibold text-lg shadow-lg text-white flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-semibold text-lg shadow-lg text-white flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Submit Quiz
            </button>
          )}
        </div>
      </motion.div>
      <div className="w-full sm:w-1/4 bg-white p-6 rounded-lg shadow-lg sm:ml-6 sm:mt-[-400px]">
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
          Questions
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-4 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionSelect(index)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold ${
                currentQuestionIndex === index
                  ? "bg-[#140342] text-white"
                  : answers[index]
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit} //  Call handleSubmit when confirmed
      />
    </div>
  );
};

export default QuizPage;
