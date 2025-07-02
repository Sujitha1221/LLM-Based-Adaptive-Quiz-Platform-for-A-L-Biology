import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Hide footer on the "/" route
  if (location.pathname === "/" || location.pathname === "/signup") {
    return null;
  }

  return (
    <footer className="bottom-0 left-0 z-20 w-full bg-[#140342] py-4">
      <div className="mx-auto w-full max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 py-4">
          {/* Description - Left Side */}
          <div className="text-white">
            <h2 className="text-lg font-bold mb-2">Master Biology with Adaptive Quizzes</h2>
            <p className="text-gray-400 text-sm">
              Bio Mentor is an e-learning platform focused on helping A/L Biology students in Sri Lanka master complex concepts
              through adaptive quizzes. Our quizzes dynamically adjust to your learning progress, ensuring you get the right
              level of challenge and real-time feedback to improve retention and academic performance.
            </p>
          </div>

          {/* Links - Right Side */}
          <div className="text-center md:text-right">
            <h2 className="mb-4 text-sm font-semibold uppercase text-white">Quick Links</h2>
            <ul className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              <li className="mb-2">
                <Link to="/MCQ-home" className="hover:underline">MCQ Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/quiz-history" className="hover:underline">Quiz History</Link>
              </li>
              <li className="mb-2">
                <Link to="/performance-dashboard" className="hover:underline">Performance Dashboard</Link>
              </li>
              <li className="mb-2">
                <Link to="/topic-quizzes" className="hover:underline">Topic-Based Quizzes</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright - Center aligned on mobile, left on desktop */}
        <div className="px-4 py-3 flex flex-col items-center md:flex-row md:justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-300 text-center md:text-left">
            © 2024 <Link to="/">Bio Mentor</Link>. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
