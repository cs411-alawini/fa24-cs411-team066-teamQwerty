import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  return (
    <div className="user-profile-page">
      <Header />
      <main className="user-profile-main">
        <h2>User Profile</h2>
        <p>View and edit your personal information here!</p>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;