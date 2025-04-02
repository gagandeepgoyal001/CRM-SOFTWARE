// scripts/home.jsx
import React from 'react';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-page">
      <header>
        <h1>Welcome to CRM Software</h1>
        <p>Your central hub for managing customer relationships and sales data.</p>
      </header>
      <section className="overview">
        <div className="overview-item">
          <h2>Total Customers</h2>
          <p>100</p>
        </div>
        <div className="overview-item">
          <h2>Active Leads</h2>
          <p>45</p>
        </div>
        <div className="overview-item">
          <h2>Pending Visits</h2>
          <p>12</p>
        </div>
      </section>
      <section className="announcements">
        <h2>Announcements</h2>
        <ul>
          <li>New sales target updated for Q2.</li>
          <li>Upcoming team meeting on Friday.</li>
          <li>CRM software update scheduled for next week.</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
