import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./PlanPage.css";

const PlanPage = () => {
  return (
    <div className="plan-page">
      <Header />
      <main className="plan-main">
        <h2>Fitness Plan</h2>
        <p>Create and track your personalized fitness plan here!</p>
      </main>
      <Footer />
    </div>
  );
};

export default PlanPage;