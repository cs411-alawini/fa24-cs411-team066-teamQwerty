import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./RegisterPage.css";

const RegisterPage = () => {
  return (
    <div className="register-page">
      <Header />
      <main className="register-main">
        <h2>Register</h2>
        <form className="register-form">
          <label>
            Name:
            <input type="text" name="name" required />
          </label>
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
          <label>
            Password:
            <input type="password" name="password" required />
          </label>
          <button type="submit">Register</button>
        </form>
        <div className="register-options">
          <Link to="/login" className="option-link">Already a Member?</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;