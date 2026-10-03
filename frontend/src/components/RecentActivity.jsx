import { useEffect, useState } from "react";
import axios from "axios";

function RecentActivity() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchScans = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/scans"
      );

      if (response.data.success) {
        setScans(response.data.scans);
        setError("");
      }
    } catch (err) {
      console.error("Failed to fetch scan history:", err);
      setError("Unable to load scan activity.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load + refresh every 2 seconds
  useEffect(() => {
    fetchScans();

    const interval = setInterval(() => {
      fetchScans();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------
  // Action class
  // --------------------------------

  const getActionClass = (action) => {
    switch (action) {
      case "CHECKED_OUT":
        return "activity-checkout";

      case "RETURNED":
        return "activity-returned";

      case "ACCESS_DENIED":
        return "activity-denied";

      default:
        return "activity-unknown";
    }
  };

  // --------------------------------
  // Action text
  // --------------------------------

  const getActionText = (action) => {
    switch (action) {
      case "CHECKED_OUT":
        return "CHECKED OUT";

      case "RETURNED":
        return "RETURNED";

      case "ACCESS_DENIED":
        return "ACCESS DENIED";

      default:
        return action;
    }
  };

  // --------------------------------
  // Action icon
  // --------------------------------

  const getActionIcon = (action) => {
    switch (action) {
      case "CHECKED_OUT":
        return "🟡";

      case "RETURNED":
        return "🟢";

      case "ACCESS_DENIED":
        return "🔴";

      default:
        return "⚪";
    }
  };

  return (
    <section className="activity-section">

      {/* HEADER */}

      <div className="section-header">

        <div>
          <h2>Recent Activity</h2>

          <p>
            Latest RFID scan events
          </p>
        </div>

        <button onClick={fetchScans}>
          Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* LOADING */}

      {loading ? (

        <div className="loading">
          Loading scan activity...
        </div>

      ) : scans.length === 0 ? (

        <div className="empty">
          No scan activity yet.
        </div>

      ) : (

        <div className="activity-list">

          {scans.map((scan) => (

            <div
              className="activity-item"
              key={scan._id}
            >

              {/* LEFT SIDE */}

              <div className="activity-info">

                <div className="activity-title">

                  <span className="activity-icon">
                    {getActionIcon(scan.action)}
                  </span>

                  <strong>
                    {scan.assetName}
                  </strong>

                </div>

                <span className="activity-uid">
                  UID: {scan.uid}
                </span>

              </div>


              {/* RIGHT SIDE */}

              <div className="activity-action">

                <span
                  className={`activity-badge ${getActionClass(
                    scan.action
                  )}`}
                >
                  {getActionText(scan.action)}
                </span>

                <span className="activity-time">

                  {scan.timestamp
                    ? new Date(
                        scan.timestamp
                      ).toLocaleString()
                    : "Unknown time"}

                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

export default RecentActivity;