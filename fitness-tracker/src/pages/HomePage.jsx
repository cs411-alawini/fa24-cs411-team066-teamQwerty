import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <main className="home-main">
        <p>Welcome to your personalized fitness journey!</p>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;