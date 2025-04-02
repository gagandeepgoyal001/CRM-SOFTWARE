// src/scripts/TelecallerDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import '../styles/telecallerDashboard.css';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQL2FFpsyRDa6Sv2rj8qjIlYBkxcXDJbV4nwdLxxIeegJj9KG8XTZdwAD7C4gr56uJhCvada8qoj-x7/pub?output=csv';

function TelecallerDashboard() {
  // States for CSV data and header mapping
  const [dataRows, setDataRows] = useState([]);
  const [allIdx, setAllIdx] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States for computed metrics
  const [telecallerCounts, setTelecallerCounts] = useState({});
  const [channelCounts, setChannelCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [propertyNeedsCounts, setPropertyNeedsCounts] = useState({});
  const [projectInterestsCounts, setProjectInterestsCounts] = useState({});
  const [positiveFeedbackCount, setPositiveFeedbackCount] = useState(0);
  const [negativeFeedbackCount, setNegativeFeedbackCount] = useState(0);
  const [satisfiedCount, setSatisfiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [visitDoneCount, setVisitDoneCount] = useState(0);
  const [plannedVisitCount, setPlannedVisitCount] = useState(0);
  const [visitDoneCombined, setVisitDoneCombined] = useState(0);

  // States for search and details toggling
  const [propertySearch, setPropertySearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [fullDetails, setFullDetails] = useState(null);

  // Refs for Chart.js instances
  const visitDoneTotalChartRef = useRef(null);
  const visitDoneScheduledChartRef = useRef(null);
  const feedbackChartRef = useRef(null);
  const leadTypesChartRef = useRef(null);

  // Fetch CSV data and update metrics
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      const rows = csvText.trim().split('\n').map((row) => row.split(','));
      const headerIndex = rows.findIndex((row) => row.includes('DATE/TIME'));
      if (headerIndex === -1) throw new Error('Header row not found.');

      const headers = rows[headerIndex].map((h) => h.trim());
      const data = rows.slice(headerIndex + 1);

      // Build header index mapping
      const idx = {
        dateTime: headers.indexOf('DATE/TIME'),
        name: headers.indexOf('NAME'),
        number: headers.indexOf('NUMBER'),
        email: headers.indexOf('EMAIL'),
        city: headers.indexOf('CITY'),
        occupation: headers.indexOf('OCCUPATION'),
        dealerInvestorEnduser: headers.indexOf('Dealer / Invester/ Enduser'),
        channel: headers.indexOf('Google add / facebook/ Instagram/ Flex'),
        telecaller: headers.indexOf('REACHED BY WHICH TELECALLER'),
        planningVisit: headers.indexOf('PLANNING FOR VISIT'),
        comment: headers.indexOf('Comment/feedback'),
        status: headers.indexOf('Status'),
        projectMap: headers.indexOf('PROJECT MAP/ PAYMENT PLAN SENT ?'),
        photoVideo: headers.indexOf('PHOTO/ VIDEO'),
        visitDate: headers.indexOf('Visit Date'),
        visitDone: headers.indexOf('Visit done'),
        postVisitFeedback: headers.indexOf('POST-VISIT FEEDBACK'),
        propertyNeed: headers.indexOf('NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi'),
        projectInterest: headers.indexOf('Virat Greens/ Virat Crown/ Both Projects'),
        plotSize: headers.indexOf('Plot Size Requirement'),
        propertyNumber: headers.indexOf('PROPERTY NUMBER'),
        firstVisitStatus: headers.indexOf('1st Visit Status'),
        secondVisitStatus: headers.indexOf('2nd Visit Status'),
        thirdVisitStatus: headers.indexOf('3rd Visit Status'),
        firstVisitDate: headers.indexOf('1st Visit Date'),
        secondVisitDate: headers.indexOf('2nd Visit Date'),
        thirdVisitDate: headers.indexOf('3rd Visit Date'),
      };
      setAllIdx(idx);
      setDataRows(data);

      // Reset counters
      let teleCount = {};
      let chanCount = {};
      let statCount = {};
      let propNeedCount = {};
      let projIntCount = {};
      let posCount = 0,
        negCount = 0,
        satCount = 0,
        penCount = 0;
      let doneCount1st = 0;
      let combinedDone = 0;
      let scheduledCount = 0;

      // For lead types (from Status)
      let leadTypeCounts = {
        'Good Lead': 0,
        'Hot Lead': 0,
        'Transferred to Sales Coordinator': 0,
        'Junk Lead': 0,
        'Transferred to Salesman': 0,
      };

      data.forEach((row) => {
        const tele = row[idx.telecaller]?.trim();
        if (tele) teleCount[tele] = (teleCount[tele] || 0) + 1;
        const ch = row[idx.channel]?.trim();
        if (ch) chanCount[ch] = (chanCount[ch] || 0) + 1;
        const st = row[idx.status]?.trim();
        if (st) {
          statCount[st] = (statCount[st] || 0) + 1;
          if (leadTypeCounts.hasOwnProperty(st)) {
            leadTypeCounts[st]++;
          }
        }
        const need = row[idx.propertyNeed]?.trim();
        if (need) propNeedCount[need] = (propNeedCount[need] || 0) + 1;
        const proj = row[idx.projectInterest]?.trim();
        if (proj) projIntCount[proj] = (projIntCount[proj] || 0) + 1;

        const feedback = row[idx.postVisitFeedback]?.trim().toLowerCase();
        if (feedback === 'positive') posCount++;
        if (feedback === 'negative') negCount++;
        if (feedback === 'satisfied') satCount++;
        if (feedback === 'pending') penCount++;

        if (
          row[idx.firstVisitStatus] &&
          row[idx.firstVisitStatus].trim().toLowerCase() === 'done'
        ) {
          doneCount1st++;
        }
        if (
          (row[idx.firstVisitStatus] &&
            row[idx.firstVisitStatus].trim().toLowerCase() === 'done') ||
          (row[idx.secondVisitStatus] &&
            row[idx.secondVisitStatus].trim().toLowerCase() === 'done') ||
          (row[idx.thirdVisitStatus] &&
            row[idx.thirdVisitStatus].trim().toLowerCase() === 'done')
        ) {
          combinedDone++;
        }
        if (
          (row[idx.firstVisitDate] && row[idx.firstVisitDate].trim() !== '') ||
          (row[idx.secondVisitDate] && row[idx.secondVisitDate].trim() !== '') ||
          (row[idx.thirdVisitDate] && row[idx.thirdVisitDate].trim() !== '')
        ) {
          scheduledCount++;
        }
      });

      setTelecallerCounts(teleCount);
      setChannelCounts(chanCount);
      setStatusCounts({ ...statCount, leadTypes: leadTypeCounts });
      setPropertyNeedsCounts(propNeedCount);
      setProjectInterestsCounts(projIntCount);
      setPositiveFeedbackCount(posCount);
      setNegativeFeedbackCount(negCount);
      setSatisfiedCount(satCount);
      setPendingCount(penCount);
      setVisitDoneCount(doneCount1st);
      setPlannedVisitCount(scheduledCount);
      setVisitDoneCombined(combinedDone);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      setErrorMsg('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount and refresh every 60 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Render charts using Chart.js
  useEffect(() => {
    // Chart 1: Visit Done / Total Customers (%)
    const totalCustomers = dataRows.length;
    const visitDonePercent =
      totalCustomers > 0 ? ((visitDoneCount / totalCustomers) * 100).toFixed(1) : 0;
    const ctx2 = document.getElementById('visitDoneTotalChart')?.getContext('2d');
    if (ctx2) {
      if (visitDoneTotalChartRef.current) visitDoneTotalChartRef.current.destroy();
      visitDoneTotalChartRef.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Visits Done', 'Pending'],
          datasets: [
            {
              data: [visitDoneCount, totalCustomers - visitDoneCount],
              backgroundColor: ['#2980b9', '#ecf0f1'],
              borderColor: ['#2980b9', '#bdc3c7'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `Visit Done / Total: ${visitDonePercent}%`,
            },
            legend: { display: false },
          },
        },
      });
    }

    // Chart 2: Visit Done / Scheduled (%)
    const visitScheduledPercent =
      plannedVisitCount > 0 ? ((visitDoneCombined / plannedVisitCount) * 100).toFixed(1) : 0;
    const ctx3 = document.getElementById('visitDoneScheduledChart')?.getContext('2d');
    if (ctx3) {
      if (visitDoneScheduledChartRef.current) visitDoneScheduledChartRef.current.destroy();
      visitDoneScheduledChartRef.current = new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Scheduled'],
          datasets: [
            {
              data: [visitDoneCombined, plannedVisitCount - visitDoneCombined],
              backgroundColor: ['#8e44ad', '#ecf0f1'],
              borderColor: ['#8e44ad', '#bdc3c7'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `Done vs. Scheduled: ${visitScheduledPercent}%`,
            },
            legend: { display: false },
          },
        },
      });
    }

    // Chart 3: Visit Feedback Breakdown
    const totalVisitFeedback = positiveFeedbackCount + negativeFeedbackCount + satisfiedCount + pendingCount;
    const ctxFeedback = document.getElementById('feedbackChart')?.getContext('2d');
    if (ctxFeedback) {
      if (feedbackChartRef.current) feedbackChartRef.current.destroy();
      feedbackChartRef.current = new Chart(ctxFeedback, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Negative', 'Satisfied', 'Pending'],
          datasets: [
            {
              data: [positiveFeedbackCount, negativeFeedbackCount, satisfiedCount, pendingCount],
              backgroundColor: ['#2ecc71', '#e74c3c', '#3498db', '#f1c40f'],
              borderColor: ['#27ae60', '#c0392b', '#2980b9', '#d35400'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Visit Feedback',
            },
            legend: { position: 'bottom' },
          },
        },
      });
    }

    // Chart 4: Lead Types Distribution
    const leadTypes = [
      'Good Lead',
      'Hot Lead',
      'Transferred to Sales Coordinator',
      'Junk Lead',
      'Transferred to Salesman',
    ];
    const leadCounts = leadTypes.map(
      (type) => (statusCounts.leadTypes && statusCounts.leadTypes[type]) || 0
    );
    const ctxLead = document.getElementById('leadTypesChart')?.getContext('2d');
    if (ctxLead) {
      if (leadTypesChartRef.current) leadTypesChartRef.current.destroy();
      leadTypesChartRef.current = new Chart(ctxLead, {
        type: 'doughnut',
        data: {
          labels: leadTypes,
          datasets: [
            {
              data: leadCounts,
              backgroundColor: ['#1abc9c', '#e67e22', '#9b59b6', '#e74c3c', '#f39c12'],
              borderColor: ['#16a085', '#d35400', '#8e44ad', '#c0392b', '#d68910'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Lead Types Distribution',
            },
            legend: { position: 'bottom' },
          },
        },
      });
    }
  }, [
    dataRows,
    positiveFeedbackCount,
    negativeFeedbackCount,
    satisfiedCount,
    pendingCount,
    visitDoneCount,
    plannedVisitCount,
    visitDoneCombined,
    statusCounts,
  ]);

  // Toggle details for a row
  const toggleRowDetails = useCallback(
    (index) => setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] })),
    []
  );

  // Handle phone search
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

  // Filter rows based on property search
  const filteredRows = propertySearch
    ? dataRows.filter((row) =>
        row[allIdx.propertyNumber]?.trim().includes(propertySearch.trim())
      )
    : [];

  // Helper components for better code organization
  const SummarySection = () => (
    <section className="summary">
      <div className="summary-item">
        <h2>Total Customers</h2>
        <p id="totalCustomers">{dataRows.length}</p>
      </div>
      <div className="summary-item">
        <h2>Telecaller Performance</h2>
        <ul id="telecallerPerformance">
          {Object.entries(telecallerCounts).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="summary-item">
        <h2>Channel Metrics</h2>
        <ul id="channelMetrics">
          {Object.entries(channelCounts).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="summary-item">
        <h2>Lead Status</h2>
        <ul id="leadStatus">
          {Object.entries(statusCounts)
            .filter(([key]) => key !== 'leadTypes')
            .map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
        </ul>
      </div>
      <div className="summary-item">
        <h2>Client Property Needs</h2>
        <ul id="propertyNeeds">
          {Object.entries(propertyNeedsCounts).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="summary-item">
        <h2>Project Interests</h2>
        <ul id="projectInterests">
          {Object.entries(projectInterestsCounts).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );

  const ChartsSection = () => (
    <section className="charts-grid">
      <div className="chart-container">
        <canvas id="visitDoneTotalChart" />
        <p className="chart-title">Visit Done / Total (%)</p>
      </div>
      <div className="chart-container">
        <canvas id="visitDoneScheduledChart" />
        <p className="chart-title">Done vs. Scheduled (%)</p>
      </div>
      <div className="chart-container">
        <canvas id="feedbackChart" />
        <p className="chart-title">Visit Feedback</p>
      </div>
      <div className="chart-container">
        <canvas id="leadTypesChart" />
        <p className="chart-title">Lead Types Distribution</p>
      </div>
    </section>
  );

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
        <button onClick={() => {}}>Search</button>
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

  const CustomerDetails = () => (
    <>
      {propertySearch && filteredRows.length > 0 && (
        <section className="customer-details">
          <h2>Customer Details</h2>
          <table id="customerTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>Email</th>
                <th>City</th>
                <th>Telecaller</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <React.Fragment key={i}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => toggleRowDetails(i)}
                      >
                        {row[allIdx.name]}
                      </button>
                    </td>
                    <td>{row[allIdx.number]}</td>
                    <td>{row[allIdx.email]}</td>
                    <td>{row[allIdx.city]}</td>
                    <td>{row[allIdx.telecaller]}</td>
                    <td>{row[allIdx.status]}</td>
                    <td>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => toggleRowDetails(i)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                  {expandedRows[i] && (
                    <tr className="details">
                      <td colSpan="7">
                        <strong>Full Details:</strong>
                        <br />
                        DATE/TIME: {row[allIdx.dateTime]}
                        <br />
                        NAME: {row[allIdx.name]}
                        <br />
                        NUMBER: {row[allIdx.number]}
                        <br />
                        EMAIL: {row[allIdx.email]}
                        <br />
                        CITY: {row[allIdx.city]}
                        <br />
                        OCCUPATION: {row[allIdx.occupation]}
                        <br />
                        Dealer/Investor/Enduser: {row[allIdx.dealerInvestorEnduser]}
                        <br />
                        Channel: {row[allIdx.channel]}
                        <br />
                        PLANNING FOR VISIT: {row[allIdx.planningVisit]}
                        <br />
                        Comment/feedback: {row[allIdx.comment]}
                        <br />
                        STATUS: {row[allIdx.status]}
                        <br />
                        PROJECT MAP/ PAYMENT PLAN SENT ?: {row[allIdx.projectMap]}
                        <br />
                        PHOTO/ VIDEO: {row[allIdx.photoVideo]}
                        <br />
                        Visit Date: {row[allIdx.visitDate]}
                        <br />
                        Visit done: {row[allIdx.visitDone]}
                        <br />
                        POST-VISIT FEEDBACK: {row[allIdx.postVisitFeedback]}
                        <br />
                        NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi: {row[allIdx.propertyNeed]}
                        <br />
                        Virat Greens/ Virat Crown/ Both Projects: {row[allIdx.projectInterest]}
                        <br />
                        Plot Size Requirement: {row[allIdx.plotSize]}
                        <br />
                        PROPERTY NUMBER: {row[allIdx.propertyNumber]}
                        <br />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {fullDetails && (
        <section className="customer-full-details">
          <h2>Customer Full Details</h2>
          <p>
            <strong>DATE/TIME:</strong> {fullDetails[allIdx.dateTime]}
          </p>
          <p>
            <strong>NAME:</strong> {fullDetails[allIdx.name]}
          </p>
          <p>
            <strong>NUMBER:</strong> {fullDetails[allIdx.number]}
          </p>
          <p>
            <strong>EMAIL:</strong> {fullDetails[allIdx.email]}
          </p>
          <p>
            <strong>CITY:</strong> {fullDetails[allIdx.city]}
          </p>
          <p>
            <strong>OCCUPATION:</strong> {fullDetails[allIdx.occupation]}
          </p>
          <p>
            <strong>Dealer/Investor/Enduser:</strong> {fullDetails[allIdx.dealerInvestorEnduser]}
          </p>
          <p>
            <strong>Channel:</strong> {fullDetails[allIdx.channel]}
          </p>
          <p>
            <strong>PLANNING FOR VISIT:</strong> {fullDetails[allIdx.planningVisit]}
          </p>
          <p>
            <strong>Comment/feedback:</strong> {fullDetails[allIdx.comment]}
          </p>
          <p>
            <strong>STATUS:</strong> {fullDetails[allIdx.status]}
          </p>
          <p>
            <strong>PROJECT MAP/ PAYMENT PLAN SENT ?:</strong> {fullDetails[allIdx.projectMap]}
          </p>
          <p>
            <strong>PHOTO/ VIDEO:</strong> {fullDetails[allIdx.photoVideo]}
          </p>
          <p>
            <strong>Visit Date:</strong> {fullDetails[allIdx.visitDate]}
          </p>
          <p>
            <strong>Visit done:</strong> {fullDetails[allIdx.visitDone]}
          </p>
          <p>
            <strong>POST-VISIT FEEDBACK:</strong> {fullDetails[allIdx.postVisitFeedback]}
          </p>
          <p>
            <strong>NewPlot/ Villa / Resale plots /Booth/ Flat/ kothi:</strong> {fullDetails[allIdx.propertyNeed]}
          </p>
          <p>
            <strong>Virat Greens/ Virat Crown/ Both Projects:</strong> {fullDetails[allIdx.projectInterest]}
          </p>
          <p>
            <strong>Plot Size Requirement:</strong> {fullDetails[allIdx.plotSize]}
          </p>
          <p>
            <strong>PROPERTY NUMBER:</strong> {fullDetails[allIdx.propertyNumber]}
          </p>
        </section>
      )}
    </>
  );

  return (
    <div className="telecaller-dashboard">
      <header>
        <h1>Telecaller Dashboard</h1>
        <button className="refresh-button" onClick={fetchData}>
          Refresh Data
        </button>
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

export default TelecallerDashboard;
