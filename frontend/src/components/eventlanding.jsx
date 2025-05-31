import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css"; // Use dashboard styles

const Event = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("https://fisat-forge-last.onrender.com/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div className="home-page">
      {/* Page Heading */}
      <main className="home-content">
        <div className="dashboard-container">
          <section className="welcome-section">
            <h1>📅 Event Listings</h1>
          </section>

          {/* Event Cards */}
          <section className="dashboard-card">
            <div className="card-header">
              <h2>Upcoming Events</h2>
            </div>
            <div className="card-content">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event._id} className="event-item">
                    <div className="event-date">
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      <span>-</span>
                      <span>{new Date(event.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="event-details">
                      <h3>{event.name}</h3>
                      <p>{event.details}</p>
                      <p><strong>Conducted by:</strong> {event.conductedBy}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No upcoming events.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Event;
