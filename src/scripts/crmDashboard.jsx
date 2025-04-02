// scripts/crmDashboard.jsx
import React from 'react';
import '../styles/crmDashboard.css';

const CrmDashboard = () => {
  return (
    <div className="crm-dashboard">
      <header>
        <h1>CRM Dashboard</h1>
      </header>
      <section className="customer-analytics">
        <h2>Customer Analytics</h2>
        <div className="analytics-item">
          <span>Active Customers:</span>
          <span>80</span>
        </div>
        <div className="analytics-item">
          <span>New Registrations:</span>
          <span>15</span>
        </div>
      </section>
      <section className="crm-tasks">
        <h2>CRM Tasks</h2>
        <ul>
          <li>Update customer data records.</li>
          <li>Segment customers based on interests.</li>
          <li>Analyze recent trends and feedback.</li>
        </ul>
      </section>
    </div>
  );
};

export default CrmDashboard;
