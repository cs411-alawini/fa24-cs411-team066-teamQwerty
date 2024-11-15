import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-page">
      <Header />
      <main className="login-main">
        <h2>Login</h2>
        <form className="login-form">
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
          <label>
            Password:
            <input type="password" name="password" required />
          </label>
          <button type="submit">Login</button>
        </form>
        <div className="login-options">
          <Link to="/register" className="option-link">Sign Up</Link>
          <Link to="/" className="option-link">Continue as Guest</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;