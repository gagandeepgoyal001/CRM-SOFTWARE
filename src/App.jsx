// src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import './styles/style.css';

// Lazy load the page components
const Home = React.lazy(() => import('./scripts/home'));
const TelecallerDashboard = React.lazy(() => import('./scripts/telecallerDashboard'));
const SalesCoordinatorDashboard = React.lazy(() => import('./scripts/salesCoordinatorDashboard'));
const SalesmanDashboard = React.lazy(() => import('./scripts/salesmanDashboard'));
const CrmDashboard = React.lazy(() => import('./scripts/crmDashboard'));

// Map page keys to components and their CSS files
const pageComponents = {
  home: Home,
  telecaller: TelecallerDashboard,
  salesCoordinator: SalesCoordinatorDashboard,
  salesman: SalesmanDashboard,
  crm: CrmDashboard,
};

const pageCSS = {
  home: 'styles/home.css',
  telecaller: 'styles/telecallerDashboard.css',
  salesCoordinator: 'styles/salesCoordinatorDashboard.css',
  salesman: 'styles/salesmanDashboard.css',
  crm: 'styles/crmDashboard.css',
};

function App() {
  // Active page state (default to 'telecaller' or 'home' as desired)
  const [activePage, setActivePage] = useState('telecaller');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dynamically load page-specific CSS when activePage changes
  useEffect(() => {
    // Remove previously loaded CSS with the 'page-specific' class
    document.querySelectorAll('link.page-specific').forEach((link) => link.remove());
    const href = pageCSS[activePage];
    if (href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.classList.add('page-specific');
      document.head.appendChild(link);
    }
  }, [activePage]);

  // Toggle sidebar collapse
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Get the active component (default to Home if key is not found)
  const ActiveComponent = pageComponents[activePage] || Home;

  return (
    <div id="appContainer" style={{ display: 'flex' }}>
      {/* Sidebar Navigation */}
      <nav id="sidebar" className={sidebarCollapsed ? 'collapsed' : ''}>
        <button id="toggleSidebar" onClick={toggleSidebar}>
          ☰
        </button>
        <ul id="navMenu">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage('telecaller');
              }}
            >
              Telecaller Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage('salesCoordinator');
              }}
            >
              Sales Coordinator Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage('salesman');
              }}
            >
              Salesman Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage('crm');
              }}
            >
              CRM Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage('home');
              }}
            >
              Home
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <div
        id="content"
        style={{ flexGrow: 1, padding: '20px', background: '#f4f6f8' }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
}

export default App;
