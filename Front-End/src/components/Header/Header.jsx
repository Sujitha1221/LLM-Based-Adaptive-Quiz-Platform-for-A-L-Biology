import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ActiveLink from "../ActiveLink/ActiveLink";
import { FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import logo from "../../../src/assets/Logo.png";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); //  Logout modal state

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    //  Remove all stored authentication details
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setShowLogoutModal(false);
    navigate("/"); // Redirect to Home page after logout
  };

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hide header on the "/" route
  if (location.pathname === "/" || location.pathname === "/signup") {
    return null;
  }

  return (
    <>
      <nav className="navbar relative w-full bg-[#140342] z-20">
        <div className="w-4/5 flex items-center justify-between mx-auto py-4">
          {/* Logo - Left Aligned */}
          <Link to="/MCQ-home" className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-16" />
            <motion.h1 className="text-3xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00FF84] to-[rgb(100,181,246)] drop-shadow-lg px-4 sm:px-0">
              Bio Mentor
            </motion.h1>
          </Link>

          {/* Center Navigation Menu (optional if needed) */}
          <div className={`hidden md:flex md:justify-center md:flex-1`}>
            {/* Navigation Links */}
            <ul className="font-medium text-white flex gap-8 items-center">
              {/* Add your <ActiveLink> components here if needed */}
            </ul>
          </div>

          {/* Right-aligned User Icon & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleToggleDropdown}
              className={`flex items-center space-x-2 transition duration-200`}
            >
              <FaUserCircle className="w-8 h-8" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#00FF84] focus:outline-none"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/*  Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Are you sure you want to log out?
            </h2>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
