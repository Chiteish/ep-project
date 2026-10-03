import { useEffect, useState } from "react";
import axios from "axios";
import RecentActivity from "../components/RecentActivity";

const ASSETS_API = "http://localhost:5000/api/assets";
const SCANS_API = "http://localhost:5000/api/scans";

function Dashboard() {

  const [assets, setAssets] = useState([]);
  const [scans, setScans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Asset details modal
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // =====================================================
  // FETCH ASSETS
  // =====================================================

  const fetchAssets = async () => {

    try {

      const response = await axios.get(ASSETS_API);

      if (response.data.success) {

        setAssets(response.data.assets);

        setError("");

      }

    } catch (err) {

      console.error("Asset fetch error:", err);

      setError(
        "Unable to connect to backend server."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH SCANS
  // =====================================================

  const fetchScans = async () => {

    try {

      const response = await axios.get(SCANS_API);

      if (response.data.success) {

        setScans(response.data.scans);

      }

    } catch (err) {

      console.error(
        "Scan history fetch error:",
        err
      );

    }

  };


  // =====================================================
  // INITIAL LOAD + REAL TIME REFRESH
  // =====================================================

  useEffect(() => {

    fetchAssets();
    fetchScans();

    const interval = setInterval(() => {

      fetchAssets();
      fetchScans();

    }, 2000);

    return () => clearInterval(interval);

  }, []);


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalAssets = assets.length;

  const availableAssets = assets.filter(
    (asset) =>
      asset.status === "AVAILABLE"
  ).length;

  const checkedOutAssets = assets.filter(
    (asset) =>
      asset.status === "CHECKED_OUT"
  ).length;

  const deniedAttempts = scans.filter(
    (scan) =>
      scan.action === "ACCESS_DENIED"
  ).length;


  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    ...new Set(
      assets.map(
        (asset) => asset.category
      )
    )
  ];


  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredAssets = assets.filter(
    (asset) => {

      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        asset.name
          .toLowerCase()
          .includes(searchText) ||

        asset.uid
          .toLowerCase()
          .includes(searchText) ||

        asset.category
          .toLowerCase()
          .includes(searchText) ||

        asset.location
          .toLowerCase()
          .includes(searchText);


      const matchesStatus =
        statusFilter === "ALL" ||
        asset.status === statusFilter;


      const matchesCategory =
        categoryFilter === "ALL" ||
        asset.category === categoryFilter;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );

    }
  );


  // =====================================================
  // STATUS DISPLAY
  // =====================================================

  const getStatusClass = (status) => {

    if (status === "AVAILABLE") {
      return "status-available";
    }

    if (status === "CHECKED_OUT") {
      return "status-checked";
    }

    return "status-unknown";

  };


  const getStatusText = (status) => {

    if (status === "CHECKED_OUT") {
      return "CHECKED OUT";
    }

    return status;

  };


  // =====================================================
  // NAVIGATION
  // =====================================================

  const scrollToSection = (id) => {

    const element =
      document.getElementById(id);

    if (element) {

      element.scrollIntoView({
        behavior: "smooth"
      });

    }

    setSidebarOpen(false);

  };


  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  const closeDetails = () => {

    setSelectedAsset(null);

  };


  // =====================================================
  // ASSET DETAILS HISTORY
  // =====================================================

  const assetHistory = selectedAsset
    ? scans.filter(
        (scan) =>
          scan.uid === selectedAsset.uid
      )
    : [];


  return (

    <div className="app-layout">


      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="brand">

          <div className="brand-icon">
            RFID
          </div>

          <div>
            <h2>SmartTrack</h2>

            <span>
              Asset Management
            </span>
          </div>

        </div>


        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() =>
              scrollToSection("dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </button>


          <button
            className="nav-item"
            onClick={() =>
              scrollToSection("inventory")
            }
          >
            <span>▤</span>
            Asset Inventory
          </button>


          <button
            className="nav-item"
            onClick={() =>
              scrollToSection("activity")
            }
          >
            <span>◷</span>
            Recent Activity
          </button>


          <button
            className="nav-item"
            onClick={() =>
              scrollToSection("denied")
            }
          >
            <span>⚠</span>
            Access Denied

            {deniedAttempts > 0 && (
              <span className="nav-count">
                {deniedAttempts}
              </span>
            )}

          </button>

        </nav>


        <div className="sidebar-footer">

          <div className="connection-indicator">
            <span></span>
            Backend Connected
          </div>

          <small>
            Smart Asset Tracking System
          </small>

        </div>

      </aside>


      {/* =================================================
          MOBILE OVERLAY
          ================================================= */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <main
        className="main-content"
        id="dashboard"
      >


        {/* MOBILE HEADER */}

        <div className="mobile-header">

          <button
            className="menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <strong>
            SmartTrack
          </strong>

        </div>


        {/* =================================================
            PAGE HEADER
            ================================================= */}

        <header className="page-header">

          <div>

            <div className="eyebrow">
              LABORATORY ASSET MANAGEMENT
            </div>

            <h1>
              Smart Asset Tracking
            </h1>

            <p>
              Monitor and manage RFID-enabled
              laboratory assets in real time.
            </p>

          </div>


          <div className="system-online">

            <span className="online-dot"></span>

            <div>
              <strong>
                System Online
              </strong>

              <small>
                Live monitoring active
              </small>
            </div>

          </div>

        </header>


        {/* =================================================
            ERROR
            ================================================= */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="stats-grid">


          <div className="stat-card">

            <div className="stat-top">

              <span className="stat-label">
                TOTAL ASSETS
              </span>

              <div className="stat-icon blue">
                ▦
              </div>

            </div>

            <strong className="stat-number">
              {totalAssets}
            </strong>

            <span className="stat-description">
              Registered laboratory assets
            </span>

          </div>


          <div className="stat-card green-card">

            <div className="stat-top">

              <span className="stat-label">
                AVAILABLE
              </span>

              <div className="stat-icon green">
                ✓
              </div>

            </div>

            <strong className="stat-number">
              {availableAssets}
            </strong>

            <span className="stat-description">
              Ready for use
            </span>

          </div>


          <div className="stat-card yellow-card">

            <div className="stat-top">

              <span className="stat-label">
                CHECKED OUT
              </span>

              <div className="stat-icon yellow">
                ↗
              </div>

            </div>

            <strong className="stat-number">
              {checkedOutAssets}
            </strong>

            <span className="stat-description">
              Currently in use
            </span>

          </div>


          <div className="stat-card red-card">

            <div className="stat-top">

              <span className="stat-label">
                ACCESS DENIED
              </span>

              <div className="stat-icon red">
                !
              </div>

            </div>

            <strong className="stat-number">
              {deniedAttempts}
            </strong>

            <span className="stat-description">
              Unauthorized attempts
            </span>

          </div>

        </section>


        {/* =================================================
            ASSET INVENTORY
            ================================================= */}

        <section
          className="content-card"
          id="inventory"
        >

          <div className="card-header">

            <div>

              <span className="section-eyebrow">
                INVENTORY
              </span>

              <h2>
                Asset Inventory
              </h2>

              <p>
                Search and monitor all registered assets.
              </p>

            </div>

            <button
              className="refresh-button"
              onClick={() => {
                fetchAssets();
                fetchScans();
              }}
            >
              ↻ Refresh
            </button>

          </div>


          {/* SEARCH + FILTER */}

          <div className="filter-bar">


            <div className="search-box">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search asset, UID, category or location..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (

                <button
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>

              )}

            </div>


            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >

              <option value="ALL">
                All Categories
              </option>

              {categories.map(
                (category) => (

                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>

                )
              )}

            </select>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="AVAILABLE">
                Available
              </option>

              <option value="CHECKED_OUT">
                Checked Out
              </option>

            </select>

          </div>


          {/* RESULT COUNT */}

          <div className="result-count">

            Showing{" "}
            <strong>
              {filteredAssets.length}
            </strong>{" "}
            of{" "}
            <strong>
              {totalAssets}
            </strong>{" "}
            assets

          </div>


          {/* TABLE */}

          {loading ? (

            <div className="loading">
              Loading assets...
            </div>

          ) : filteredAssets.length === 0 ? (

            <div className="no-results">

              <div>
                🔍
              </div>

              <h3>
                No assets found
              </h3>

              <p>
                Try changing your search
                or filters.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="table-wrapper">

              <table className="asset-table">

                <thead>

                  <tr>

                    <th>
                      ASSET
                    </th>

                    <th>
                      RFID UID
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      LOCATION
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      LAST SCAN
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredAssets.map(
                    (asset) => (

                      <tr
                        key={asset._id}
                      >

                        <td>

                          <div className="asset-name">

                            <div className="asset-avatar">
                              {asset.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {asset.name}
                              </strong>

                              <small>
                                Asset ID:{" "}
                                {asset._id.slice(-6)}
                              </small>

                            </div>

                          </div>

                        </td>


                        <td>

                          <code>
                            {asset.uid}
                          </code>

                        </td>


                        <td>
                          {asset.category}
                        </td>


                        <td>

                          <span className="location-text">
                            📍 {asset.location}
                          </span>

                        </td>


                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              asset.status
                            )}`}
                          >

                            <span className="status-dot-small"></span>

                            {getStatusText(
                              asset.status
                            )}

                          </span>

                        </td>


                        <td>

                          <span className="scan-time">

                            {asset.lastScan
                              ? new Date(
                                  asset.lastScan
                                ).toLocaleString()
                              : "Never"}

                          </span>

                        </td>


                        <td>

                          <button
                            className="details-button"
                            onClick={() =>
                              setSelectedAsset(
                                asset
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =================================================
            ACTIVITY + ACCESS DENIED
            ================================================= */}

        <div className="dashboard-grid">


          {/* RECENT ACTIVITY */}

          <div
            id="activity"
            className="activity-wrapper"
          >

            <RecentActivity />

          </div>


          {/* ACCESS DENIED */}

          <section
            className="content-card denied-card"
            id="denied"
          >

            <div className="card-header compact">

              <div>

                <span className="section-eyebrow danger">
                  SECURITY
                </span>

                <h2>
                  Access Denied
                </h2>

                <p>
                  Unauthorized RFID attempts
                </p>

              </div>

              <div className="danger-counter">
                {deniedAttempts}
              </div>

            </div>


            {scans.filter(
              (scan) =>
                scan.action ===
                "ACCESS_DENIED"
            ).length === 0 ? (

              <div className="empty-security">

                <div className="security-icon">
                  ✓
                </div>

                <strong>
                  No unauthorized attempts
                </strong>

                <span>
                  Your system has not detected
                  any unknown RFID tags.
                </span>

              </div>

            ) : (

              <div className="denied-list">

                {scans
                  .filter(
                    (scan) =>
                      scan.action ===
                      "ACCESS_DENIED"
                  )
                  .slice(0, 8)
                  .map((scan) => (

                    <div
                      className="denied-item"
                      key={scan._id}
                    >

                      <div className="denied-icon">
                        !
                      </div>

                      <div className="denied-info">

                        <strong>
                          Unknown RFID
                        </strong>

                        <code>
                          {scan.uid}
                        </code>

                      </div>

                      <span className="denied-time">

                        {new Date(
                          scan.timestamp
                        ).toLocaleString()}

                      </span>

                    </div>

                  ))}

              </div>

            )}

          </section>

        </div>


        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="dashboard-footer">

          <span>
            Smart Asset Tracking System
          </span>

          <span>
            RFID • ESP32 • Node.js • MongoDB
          </span>

        </footer>


      </main>


      {/* =================================================
          ASSET DETAILS MODAL
          ================================================= */}

      {selectedAsset && (

        <div
          className="modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="asset-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span className="section-eyebrow">
                  ASSET DETAILS
                </span>

                <h2>
                  {selectedAsset.name}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>


            {/* STATUS */}

            <div className="modal-status">

              <span
                className={`status-badge ${getStatusClass(
                  selectedAsset.status
                )}`}
              >

                <span className="status-dot-small"></span>

                {getStatusText(
                  selectedAsset.status
                )}

              </span>

            </div>


            {/* DETAILS */}

            <div className="details-grid">

              <div className="detail-item">

                <span>
                  Asset Name
                </span>

                <strong>
                  {selectedAsset.name}
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  RFID UID
                </span>

                <code>
                  {selectedAsset.uid}
                </code>

              </div>


              <div className="detail-item">

                <span>
                  Category
                </span>

                <strong>
                  {selectedAsset.category}
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Location
                </span>

                <strong>
                  📍 {selectedAsset.location}
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Last Scan
                </span>

                <strong>

                  {selectedAsset.lastScan
                    ? new Date(
                        selectedAsset.lastScan
                      ).toLocaleString()
                    : "Never"}

                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Registered
                </span>

                <strong>

                  {selectedAsset.createdAt
                    ? new Date(
                        selectedAsset.createdAt
                      ).toLocaleDateString()
                    : "Unknown"}

                </strong>

              </div>

            </div>


            {/* ASSET HISTORY */}

            <div className="modal-history">

              <div className="history-header">

                <div>

                  <h3>
                    Scan History
                  </h3>

                  <span>
                    Activity for this RFID tag
                  </span>

                </div>

                <strong>
                  {assetHistory.length}
                </strong>

              </div>


              {assetHistory.length === 0 ? (

                <div className="history-empty">
                  No scan history available.
                </div>

              ) : (

                <div className="history-list">

                  {assetHistory
                    .slice(0, 10)
                    .map((scan) => (

                      <div
                        className="history-item"
                        key={scan._id}
                      >

                        <div
                          className={`history-dot ${
                            scan.action ===
                            "ACCESS_DENIED"
                              ? "history-red"
                              : scan.action ===
                                "RETURNED"
                              ? "history-green"
                              : "history-yellow"
                          }`}
                        />

                        <div className="history-info">

                          <strong>

                            {scan.action ===
                            "CHECKED_OUT"
                              ? "Checked Out"
                              : scan.action ===
                                "RETURNED"
                              ? "Returned"
                              : "Access Denied"}

                          </strong>

                          <span>
                            {new Date(
                              scan.timestamp
                            ).toLocaleString()}
                          </span>

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </div>


            <button
              className="modal-done"
              onClick={closeDetails}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );
}

export default Dashboard;