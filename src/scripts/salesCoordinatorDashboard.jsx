// src/scripts/SalesCoordinatorDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import '../styles/salesCoordinatorDashboard.css';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzL_R75V1wX-XnGwzoU6h627ErY-tFuCSP3OBclfee2FuZXYEt1TbI37goL_1_ez4Dzt6Wc2M0gMh9/pub?output=csv';

function SalesCoordinatorDashboard() {
  // States for CSV data and header mapping
  const [dataRows, setDataRows] = useState([]);
  const [allIdx, setAllIdx] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States for computed metrics
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0); // "DEAL DONE"
  const [notInterestedCount, setNotInterestedCount] = useState(0);
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  // Using leadTypeCounts to hold the three statuses: NOT INTERESTED, AWAITING, DEAL DONE
  const [leadTypeCounts, setLeadTypeCounts] = useState({});

  // Additional metrics
  const [clientPropertyNeedsCounts, setClientPropertyNeedsCounts] = useState({});
  const [leadProvidedByCounts, setLeadProvidedByCounts] = useState({});
  const [salesCoordinatorPerformanceCounts, setSalesCoordinatorPerformanceCounts] = useState({});
  const [projectInterestsCounts, setProjectInterestsCounts] = useState({});

  // Refs for Chart.js instances
  const conversionChartRef = useRef(null);
  const successChartRef = useRef(null);
  const salesChartRef = useRef(null);
  const breakdownChartRef = useRef(null);

  // States for search and details toggling
  const [propertySearch, setPropertySearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [fullDetails, setFullDetails] = useState(null);

  // Fetch CSV data and compute metrics
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      const rows = csvText.trim().split('\n').map((row) => row.split(','));
      const headerIndex = rows.findIndex((row) => row.includes('DATE/TIME'));
      if (headerIndex === -1) throw new Error('Header row not found.');

      // Trim headers and slice data rows
      const headers = rows[headerIndex].map((h) => h.trim());
      const data = rows.slice(headerIndex + 1);
      setTotalCustomers(data.length);

      // Build header index mapping (adjust header names as per your sheet)
      const idx = {
        dateTime: headers.indexOf('DATE/TIME'),
        name: headers.indexOf('NAME'),
        number: headers.indexOf('NUMBER'),
        email: headers.indexOf('EMAIL'),
        city: headers.indexOf('CITY'),
        occupation: headers.indexOf('OCCUPATION'),
        dealerInvestorEnduser: headers.indexOf('Dealer / Invester/ Enduser'),
        source: headers.indexOf('Google ad/ facebook/ Instagram/ Flex'),
        leadProvider: headers.indexOf('LEAD PROVIDER'),
        reachedBy: headers.indexOf('REACHED BY'),
        planningVisit: headers.indexOf('PLANNING FOR VISIT'),
        comment: headers.indexOf('Comment/feedback'),
        status: headers.indexOf('Status'),
        projectMap: headers.indexOf('PROJECT MAP/ PAYMENT PLAN'),
        photoVideo: headers.indexOf('PHOTO/ VIDEO'),
        firstVisitDate: headers.indexOf('1st Visit Date'),
        firstVisitStatus: headers.indexOf('Visit Status'),
        postVisitFeedback: headers.indexOf('POST-VISIT FEEDBACK'),
        propertyRequirement: headers.indexOf('NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi'),
        projectInterest: headers.indexOf('Virat Greens/ Virat Crown/ Both Projects'),
        plotSize: headers.indexOf('Plot Size Requirement'),
        propertyNumber: headers.indexOf('PROPERTY NUMBER'),
      };
      setAllIdx(idx);
      setDataRows(data);

      // Reset counters
      let convCount = 0,
          notIntCount = 0,
          awaitCount = 0,
          visitCnt = 0;
      // For lead types distribution, we count only the three statuses
      let leadTypes = {
        'NOT INTERESTED': 0,
        'AWAITING': 0,
        'DEAL DONE': 0,
      };

      // Additional metrics from other columns
      let propNeeds = {};
      let leadProv = {};
      let salesCoordPerf = {};
      let projInterests = {};

      data.forEach((row) => {
        const statusVal = row[idx.status]?.trim().toUpperCase();
        if (statusVal === 'DEAL DONE') convCount++;
        else if (statusVal === 'NOT INTERESTED') notIntCount++;
        else if (statusVal === 'AWAITING') awaitCount++;

        if (leadTypes.hasOwnProperty(statusVal)) {
          leadTypes[statusVal]++;
        }

        // Count Client Property Needs (normalize values as needed)
        const propVal = row[idx.propertyRequirement]?.trim();
        if (propVal) {
          const normalized = propVal.replace(/NewPlot/i, 'New Plot');
          propNeeds[normalized] = (propNeeds[normalized] || 0) + 1;
        }

        // Count Lead Provided By
        const lpVal = row[idx.leadProvider]?.trim();
        if (lpVal) {
          leadProv[lpVal] = (leadProv[lpVal] || 0) + 1;
        }

        // Count Sales Coordinator Performance (from REACHED BY)
        const reachedVal = row[idx.reachedBy]?.trim();
        if (reachedVal) {
          salesCoordPerf[reachedVal] = (salesCoordPerf[reachedVal] || 0) + 1;
        }

        // Count Project Interests
        const projVal = row[idx.projectInterest]?.trim();
        if (projVal) {
          projInterests[projVal] = (projInterests[projVal] || 0) + 1;
        }

        // Count a visit if the 1st Visit Date is provided (non-empty)
        if (row[idx.firstVisitDate] && row[idx.firstVisitDate].trim() !== '') {
          visitCnt++;
        }
      });

      setConvertedCount(convCount);
      setNotInterestedCount(notIntCount);
      setAwaitingCount(awaitCount);
      setVisitCount(visitCnt);
      setLeadTypeCounts(leadTypes);
      setClientPropertyNeedsCounts(propNeeds);
      setLeadProvidedByCounts(leadProv);
      setSalesCoordinatorPerformanceCounts(salesCoordPerf);
      setProjectInterestsCounts(projInterests);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      setErrorMsg('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Render charts using Chart.js
  useEffect(() => {
    // Chart 1: Leads to Visits Conversion (Doughnut)
    const visitConversionPercent =
      totalCustomers > 0 ? ((visitCount / totalCustomers) * 100).toFixed(1) : 0;
    const ctx1 = document.getElementById('conversionChart')?.getContext('2d');
    if (ctx1) {
      if (conversionChartRef.current) conversionChartRef.current.destroy();
      conversionChartRef.current = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Visited', 'Not Visited'],
          datasets: [{
            data: [visitCount, totalCustomers - visitCount],
            backgroundColor: ['#2980b9', '#ecf0f1'],
            borderColor: ['#2980b9', '#bdc3c7'],
            borderWidth: 1,
          }],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `Leads to Visits: ${visitConversionPercent}%`,
            },
            legend: { display: false },
          },
        },
      });
    }

    // Chart 2: Leads to Conversions (using DEAL DONE)
    const conversionPercent =
      totalCustomers > 0 ? ((convertedCount / totalCustomers) * 100).toFixed(1) : 0;
    const ctx2 = document.getElementById('successChart')?.getContext('2d');
    if (ctx2) {
      if (successChartRef.current) successChartRef.current.destroy();
      successChartRef.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['DEAL DONE', 'Others'],
          datasets: [{
            data: [convertedCount, totalCustomers - convertedCount],
            backgroundColor: ['#2ecc71', '#ecf0f1'],
            borderColor: ['#27ae60', '#bdc3c7'],
            borderWidth: 1,
          }],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `Leads to Conversions: ${conversionPercent}%`,
            },
            legend: { display: false },
          },
        },
      });
    }

    // Chart 3: Sales Achieved (Horizontal Bar Chart)
    const ctx3 = document.getElementById('salesChart')?.getContext('2d');
    if (ctx3) {
      if (salesChartRef.current) salesChartRef.current.destroy();
      salesChartRef.current = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['Sales Achieved'],
          datasets: [{
            label: 'DEAL DONE',
            data: [convertedCount],
            backgroundColor: '#2ecc71',
            borderColor: '#27ae60',
            borderWidth: 1,
          }],
        },
        options: {
          indexAxis: 'y',
          plugins: {
            title: {
              display: true,
              text: 'Number of Sales Achieved',
            },
            legend: { display: false },
          },
          scales: {
            x: {
              beginAtZero: true,
              max: totalCustomers,
            },
          },
        },
      });
    }

    // Chart 4: Conversion Status Breakdown (using leadTypeCounts)
    const breakdownLabels = ['DEAL DONE', 'NOT INTERESTED', 'AWAITING'];
    const breakdownData = breakdownLabels.map(label => leadTypeCounts[label] || 0);
    const ctx4 = document.getElementById('leadTypesChart')?.getContext('2d');
    if (ctx4) {
      if (breakdownChartRef.current) breakdownChartRef.current.destroy();
      breakdownChartRef.current = new Chart(ctx4, {
        type: 'doughnut',
        data: {
          labels: breakdownLabels,
          datasets: [{
            data: breakdownData,
            backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f'],
            borderColor: ['#27ae60', '#c0392b', '#d35400'],
            borderWidth: 1,
          }],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Conversion Status Breakdown',
            },
            legend: { position: 'bottom' },
          },
        },
      });
    }
  }, [totalCustomers, visitCount, convertedCount, leadTypeCounts]);

  // Helper: Toggle details for a row
  const toggleRowDetails = useCallback(
    (index) => setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] })),
    []
  );

  // Helper: Handle phone search
  const handlePhoneSearch = useCallback(() => {
    const match = dataRows.find(
      (row) => row[allIdx.number]?.trim() === phoneSearch.trim()
    );
    if (match) {
      setFullDetails(match);
    } else {
      alert('No customer found with the entered phone number.');
      setFullDetails(null);
    }
  }, [dataRows, allIdx, phoneSearch]);

  // Filter rows based on property search; table displays only when a search term exists
  const filteredRows = propertySearch
    ? dataRows.filter((row) =>
        row[allIdx.propertyNumber]?.trim().includes(propertySearch.trim())
      )
    : [];

  // Updated SummarySection: Combined summary metrics with additional details
  const SummarySection = () => (
    <div className="summary-section">
      <div className="summary-block">
        <h2>Lead Status</h2>
        <p>
          Total Leads: {totalCustomers} | DEAL DONE: {convertedCount} (
          {totalCustomers > 0 ? ((convertedCount / totalCustomers) * 100).toFixed(1) : 0}%)
          | Not Interested: {notInterestedCount} | Awaiting: {awaitingCount} | Visits: {visitCount}
        </p>
      </div>
      <div className="summary-block">
        <h2>Client Property Needs</h2>
        <p>
          {Object.entries(clientPropertyNeedsCounts)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ')}
        </p>
      </div>
      <div className="summary-block">
        <h2>Lead Provided By</h2>
        <p>
          {Object.entries(leadProvidedByCounts)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ')}
        </p>
      </div>
      <div className="summary-block">
        <h2>Sales Coordinator Performance</h2>
        <p>
          {Object.entries(salesCoordinatorPerformanceCounts)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ')}
        </p>
      </div>
      <div className="summary-block">
        <h2>Project Interests</h2>
        <p>
          {Object.entries(projectInterestsCounts)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ')}
        </p>
      </div>
    </div>
  );

  // Helper Component: Charts Section
  const ChartsSection = () => (
    <section className="charts-grid">
      <div className="chart-container">
        <canvas id="conversionChart" />
        <p className="chart-title">Leads to Visits Conversion</p>
      </div>
      <div className="chart-container">
        <canvas id="successChart" />
        <p className="chart-title">Leads to Conversions</p>
      </div>
      <div className="chart-container">
        <canvas id="salesChart" />
        <p className="chart-title">Sales Achieved</p>
      </div>
      <div className="chart-container">
        <canvas id="leadTypesChart" />
        <p className="chart-title">Conversion Status Breakdown</p>
      </div>
    </section>
  );

  // Helper Component: Search Section
  const SearchSection = () => (
    <section className="search-section">
      <div className="search-item">
        <label htmlFor="propertySearch">Search by Property Number:</label>
        <input
          type="text"
          id="propertySearch"
          placeholder="Enter property number"
          value={propertySearch}
          onChange={(e) => setPropertySearch(e.target.value)}
        />
        <button>Search</button>
        <button onClick={() => setPropertySearch('')}>Clear</button>
      </div>
      <div className="search-item">
        <label htmlFor="phoneSearch">Search by Phone Number:</label>
        <input
          type="text"
          id="phoneSearch"
          placeholder="Enter phone number"
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
        />
        <button onClick={handlePhoneSearch}>Search</button>
        <button onClick={() => setPhoneSearch('')}>Clear</button>
      </div>
    </section>
  );

  // Helper Component: Customer Details
  const CustomerDetails = () => (
    <>
      {propertySearch && filteredRows.length > 0 && (
        <section className="customer-details">
          <h2>Customer Details</h2>
          <table className="customer-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Name</th>
                <th>Number</th>
                <th>Email</th>
                <th>City</th>
                <th>Occupation</th>
                <th>Dealer/Investor/Enduser</th>
                <th>Source</th>
                <th>Lead Provider</th>
                <th>Reached By</th>
                <th>Planning Visit</th>
                <th>Comment/Feedback</th>
                <th>Status</th>
                <th>Project Map/Payment Plan</th>
                <th>Photo/Video</th>
                <th>1st Visit Date</th>
                <th>1st Visit Status</th>
                <th>Post-Visit Feedback</th>
                <th>Property Requirement</th>
                <th>Project Interest</th>
                <th>Plot Size</th>
                <th>Property Number</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={i}>
                  <td>{row[allIdx.dateTime]}</td>
                  <td>{row[allIdx.name]}</td>
                  <td>{row[allIdx.number]}</td>
                  <td>{row[allIdx.email]}</td>
                  <td>{row[allIdx.city]}</td>
                  <td>{row[allIdx.occupation]}</td>
                  <td>{row[allIdx.dealerInvestorEnduser]}</td>
                  <td>{row[allIdx.source]}</td>
                  <td>{row[allIdx.leadProvider]}</td>
                  <td>{row[allIdx.reachedBy]}</td>
                  <td>{row[allIdx.planningVisit]}</td>
                  <td>{row[allIdx.comment]}</td>
                  <td>{row[allIdx.status]}</td>
                  <td>{row[allIdx.projectMap]}</td>
                  <td>{row[allIdx.photoVideo]}</td>
                  <td>{row[allIdx.firstVisitDate]}</td>
                  <td>{row[allIdx.firstVisitStatus]}</td>
                  <td>{row[allIdx.postVisitFeedback]}</td>
                  <td>{row[allIdx.propertyRequirement]}</td>
                  <td>{row[allIdx.projectInterest]}</td>
                  <td>{row[allIdx.plotSize]}</td>
                  <td>{row[allIdx.propertyNumber]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {fullDetails && (
        <section className="customer-full-details">
          <h2>Customer Full Details</h2>
          <p><strong>Date/Time:</strong> {fullDetails[allIdx.dateTime]}</p>
          <p><strong>Name:</strong> {fullDetails[allIdx.name]}</p>
          <p><strong>Number:</strong> {fullDetails[allIdx.number]}</p>
          <p><strong>Email:</strong> {fullDetails[allIdx.email]}</p>
          <p><strong>City:</strong> {fullDetails[allIdx.city]}</p>
          <p><strong>Occupation:</strong> {fullDetails[allIdx.occupation]}</p>
          <p><strong>Dealer/Investor/Enduser:</strong> {fullDetails[allIdx.dealerInvestorEnduser]}</p>
          <p><strong>Source:</strong> {fullDetails[allIdx.source]}</p>
          <p><strong>Lead Provider:</strong> {fullDetails[allIdx.leadProvider]}</p>
          <p><strong>Reached By:</strong> {fullDetails[allIdx.reachedBy]}</p>
          <p><strong>Planning Visit:</strong> {fullDetails[allIdx.planningVisit]}</p>
          <p><strong>Comment/Feedback:</strong> {fullDetails[allIdx.comment]}</p>
          <p><strong>Status:</strong> {fullDetails[allIdx.status]}</p>
          <p><strong>Project Map/Payment Plan:</strong> {fullDetails[allIdx.projectMap]}</p>
          <p><strong>Photo/Video:</strong> {fullDetails[allIdx.photoVideo]}</p>
          <p><strong>1st Visit Date:</strong> {fullDetails[allIdx.firstVisitDate]}</p>
          <p><strong>1st Visit Status:</strong> {fullDetails[allIdx.firstVisitStatus]}</p>
          <p><strong>Post-Visit Feedback:</strong> {fullDetails[allIdx.postVisitFeedback]}</p>
          <p><strong>Property Requirement:</strong> {fullDetails[allIdx.propertyRequirement]}</p>
          <p><strong>Project Interest:</strong> {fullDetails[allIdx.projectInterest]}</p>
          <p><strong>Plot Size:</strong> {fullDetails[allIdx.plotSize]}</p>
          <p><strong>Property Number:</strong> {fullDetails[allIdx.propertyNumber]}</p>
        </section>
      )}
    </>
  );

  return (
    <div className="sales-coordinator-dashboard">
      <header>
        <h1>Sales Coordinator Dashboard</h1>
        <button className="refresh-button" onClick={fetchData}>Refresh Data</button>
      </header>

      {loading && <div className="loading">Loading data...</div>}
      {errorMsg && <div className="error">{errorMsg}</div>}

      <SummarySection />
      <ChartsSection />
      <SearchSection />
      <CustomerDetails />
    </div>
  );
}

export default SalesCoordinatorDashboard;
