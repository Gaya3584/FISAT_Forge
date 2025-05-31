import React, { useState, useEffect } from "react";
import "./dashboard.css";
import logo from "./assets/logos.png";
import { FaSearch, FaBell, FaUser, FaCalendarAlt, FaBriefcase, FaNewspaper, FaPlus, FaEdit, FaCommentDots, FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [latestPosts, setLatestPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("studentId");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      console.log("Searching for:", searchQuery);
      const response = await axios.get(`https://fisat-forge-last.onrender.com/search?query=${searchQuery}`);
      console.log("Search results:", response.data);
      setSearchResults(Array.isArray(response.data) ? response.data : []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      alert("An error occurred while searching");
      setSearchResults([]);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log("Fetching events");
      const response = await axios.get("https://fisat-forge-last.onrender.com/events");
      console.log("Events response:", response.data);
      console.log("Is events array?", Array.isArray(response.data));
      
      // Ensure events is always an array
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const eventsArray = response.data.events || response.data.data || [];
        console.log("Extracted events array:", eventsArray);
        setEvents(Array.isArray(eventsArray) ? eventsArray : []);
      } else {
        console.error("Unexpected events response format:", response.data);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setEvents([]);
    }
  };

  const handleSearchResultClick = (userId) => {
    console.log("Navigating to profile:", userId);
    navigate(`/view-profile/${userId}`);
  };

  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile for ID:", loggedInUserId);
      const response = await axios.get(`https://fisat-forge-last.onrender.com/profile/${loggedInUserId}`);
      console.log("User profile response:", response.data);
      setUserRole(response.data.Role || "");
      setProfileImage(response.data.ProfileImage || "/default-avatar.png");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const fetchLatestPosts = async () => {
    try {
      console.log("Fetching posts for user:", loggedInUserId);
      const response = await axios.get(`https://fisat-forge-last.onrender.com/posts/following/${loggedInUserId}`);
      console.log("Posts response:", response.data);
      console.log("Response data type:", typeof response.data);
      console.log("Is posts array?", Array.isArray(response.data));
      
      // Enhanced error handling
      if (Array.isArray(response.data)) {
        console.log("Setting posts from array");
        setLatestPosts(response.data.slice(0, 3));
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with data inside
        console.log("Response is an object, looking for posts array");
        const postsArray = response.data.posts || response.data.data || [];
        console.log("Extracted posts array:", postsArray);
        console.log("Is extracted array?", Array.isArray(postsArray));
        setLatestPosts(Array.isArray(postsArray) ? postsArray.slice(0, 3) : []);
      } else {
        console.error("Unexpected posts response format:", response.data);
        setLatestPosts([]);
      }
    } catch (error) {
      console.error("Error fetching community posts:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setLatestPosts([]);
    }
  };

  const fetchJobs = async () => {
    try {
      console.log("Fetching jobs");
      const response = await axios.get("https://fisat-forge-last.onrender.com/jobs");
      console.log("Jobs response:", response.data);
      console.log("Is jobs array?", Array.isArray(response.data));
      
      // Ensure jobs is always an array
      if (Array.isArray(response.data)) {
        setJobs(response.data.slice(0, 3));
      } else if (response.data && typeof response.data === 'object') {
        const jobsArray = response.data.jobs || response.data.data || [];
        console.log("Extracted jobs array:", jobsArray);
        setJobs(Array.isArray(jobsArray) ? jobsArray.slice(0, 3) : []);
      } else {
        console.error("Expected array response for jobs but got:", typeof response.data);
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setJobs([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log("Fetching notifications for user:", loggedInUserId);
      const response = await axios.get("https://fisat-forge-last.onrender.com/api/notifications", {
        params: {
          userId: loggedInUserId
        }
      });
      console.log("Notifications response:", response.data);
      console.log("Is notifications array?", Array.isArray(response.data));
      
      // Ensure notifications is always an array
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const notificationsArray = response.data.notifications || response.data.data || [];
        console.log("Extracted notifications array:", notificationsArray);
        setNotifications(Array.isArray(notificationsArray) ? notificationsArray : []);
      } else {
        console.error("Unexpected notifications response format:", response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setNotifications([]);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`https://fisat-forge-last.onrender.com/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const handleAcceptFollowRequest = async (notificationId, senderId) => {
    try {
      console.log("Accepting follow request:", notificationId, "from sender:", senderId);
      const response = await axios.post("https://fisat-forge-last.onrender.com/accept-follow-request", {
        notificationId,
        receiverId: loggedInUserId,
        senderId
      });

      console.log("Accept follow response:", response.data);
      
      if (response.data.success) {
        // Update the notification in state
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { 
            ...n, 
            type: 'follow_accepted', 
            isRead: true,
            updatedAt: new Date().toISOString()
          } : n
        ));
        
        // Show success message
        console.log("Follow request accepted successfully");
      } else {
        // Show error message if success is false
        alert(response.data.message || "Failed to accept follow request");
      }
    } catch (error) {
      console.error("Error accepting follow request:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to accept follow request";
      alert(errorMessage);
    }
  };

  const handleRejectFollowRequest = async (notificationId) => {
    try {
      console.log("Rejecting follow request:", notificationId);
      await axios.post("https://fisat-forge-last.onrender.com/reject-follow-request", {
        notificationId,
      });
      // Update the notification locally by marking as read
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const goToProfile = () => {
    if (loggedInUserId) {
      console.log("Navigating to profile:", loggedInUserId);
      navigate(`/profile/${loggedInUserId}`);
    } else {
      alert("Student ID not found. Please log in again.");
      navigate("/login");
    }
  };

  const goToPostJob = () => {
    console.log("Navigating to post job page");
    navigate('/post-job');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow_request':
        return <FaUserPlus className="notification-type-icon" />;
      case 'follow_accepted':
        return <FaCheck className="notification-type-icon" />;
      case 'follow':
        return <FaUser className="notification-type-icon" />;
      default:
        return <FaBell className="notification-type-icon" />;
    }
  };

  // Get notification message based on type
  const getNotificationMessage = (notification) => {
    const senderName = notification.senderInfo?.name || notification.senderId || 'Someone';
    
    switch (notification.type) {
      case 'follow_request':
        return `${senderName} wants to follow you`;
      case 'follow_accepted':
        return `You accepted ${senderName}'s follow request`;
      case 'follow_accepted_confirmation':
        return `${senderName} accepted your follow request`;
      case 'follow':
        return `${senderName} started following you`;
      default:
        return notification.message || 'New notification';
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const studentId = localStorage.getItem("studentId");
    console.log("Dashboard - Student ID from localStorage:", studentId);
    
    if (!studentId) {
      console.log("No student ID found, redirecting to login");
      navigate("/login");
      return;
    }
    
    // Continue with other fetch operations
    console.log("Dashboard - Starting fetch operations");
    fetchUserProfile();
    fetchEvents();
    fetchLatestPosts();
    fetchJobs();
    fetchNotifications();
  }, []);

  return (
    <div className="home-page">
      <nav className="navbar2">
        <div className="navbar2-container">
          <div className="logo">
            <img src={logo} alt="FISAT Forge Logo" className="logo-image" />
            <div className="site-title">
              <h1>FISAT Forge</h1>
              <p className="subtitle">Together For Tomorrow</p>
            </div>
          </div>
          <div className="nav-actions">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <FaSearch />
                </button>
                {showSearchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
                  <div className="search-results-dropdown">
                    {searchResults.map((user) => (
                      <div
                        key={user['Student ID'] || `user-${Math.random()}`}
                        onClick={() => handleSearchResultClick(user['Student ID'])}
                        className="search-result-item"
                      >
                        <div>
                          <strong>{user.Name || "Unknown User"}</strong>
                          <p className="search-result-details">
                            {user['Student ID'] || "No ID"} | {user.Branch || "No Branch"} | {user.type || "No Type"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
            <div className="nav-icons">
              <div className="notification-container">
                <button className="icon-button notifications" onClick={toggleNotifications}>
                  <FaBell />
                  {Array.isArray(notifications) && notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="notification-badge">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notification-dropdown">
                    {Array.isArray(notifications) && notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification._id || `notification-${Math.random()}`} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                          <div className="notification-content">
                            <div className="notification-icon">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-message">
                              <p>{getNotificationMessage(notification)}</p>
                              <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {notification.type === 'follow_request' && !notification.isRead ? (
                            <div className="notification-actions">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptFollowRequest(notification._id, notification.senderId);
                                }}
                                className="accept-follow-btn"
                              >
                                <FaCheck /> Accept
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectFollowRequest(notification._id);
                                }}
                                className="reject-follow-btn"
                              >
                                <FaTimes /> Reject
                              </button>
                            </div>
                          ) : notification.type === 'follow_accepted' ? (
                            <div className="notification-status">
                              <FaCheck className="accepted-icon" /> Accepted
                            </div>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="no-notifications">No notifications</p>
                    )}
                  </div>
                )}
              </div>
              <button className="icon-button chat" onClick={() => navigate('/chatlist')}>
                <FaCommentDots />
              </button>
              <button className="icon-button profile" onClick={goToProfile}>
                {profileImage && profileImage.trim() ? (
                  <img
                    src={profileImage}
                    alt="User Profile"
                    className="profile-picture"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      setProfileImage(null);
                    }}
                  />
                ) : (
                  <FaUser className="default-avatar-icon" title="User Avatar" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="home-content">
        <div className="dashboard-container">
          <section className="welcome-section">
            <h1>Welcome to FISAT Forge</h1>
            <p>Your gateway to opportunities, events, and community connections</p>
          </section>

          <div className="dashboard-grid">
            <section className="dashboard-card events-card">
              <div className="card-header">
                <h2><FaCalendarAlt /> Upcoming Events</h2>
                <div className="card-header-actions">
                  <button onClick={() => {
                    console.log("Navigating to events");
                    navigate('/events');
                  }} className="view-allx">
                    View All
                  </button>
                </div>
              </div>
              <div className="card-content">
                {Array.isArray(events) && events.length > 0 ? (
                  events.slice(0, 3).map((event) => (
                    <div key={event._id || `event-${Math.random()}`} className="event-item">
                      <div className="event-date">
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        <span>-</span>
                        <span>{new Date(event.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="event-details">
                        <h3>{event.name || "Untitled Event"}</h3>
                        <p>{event.details || "No details available"}</p>
                        <p><strong>Conducted by:</strong> {event.conductedBy || "Unknown"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No upcoming events.</p>
                )}
              </div>
            </section>
            <section className="dashboard-card jobs-card">
              <div className="card-header">
                <h2><FaBriefcase /> Job Opportunities</h2>
                <div className="card-header-actions">
                  {userRole === "Alumni" && (
                    <button onClick={goToPostJob} className="post-job-button">
                      <FaPlus /> Post Job
                    </button>
                  )}
                  <button onClick={() => {
                    console.log("Navigating to jobs");
                    navigate('/jobs');
                  }} className="view-all">
                    View All
                  </button>
                </div>
              </div>
              <div className="card-content">
                {Array.isArray(jobs) && jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div key={job._id || `job-${Math.random()}`} className="job-item">
                      <h3 onClick={() => navigate("/jobs")}>{job.title || "Untitled Job"}</h3>
                      <p className="job-company">{job.company || "Unknown Company"}</p>
                      <p className="job-deadline">Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</p>
                    </div>
                  ))
                ) : (
                  <p>No recent job opportunities available.</p>
                )}
              </div>
            </section>

            <section className="dashboard-card community-card">
              <div className="card-header">
                <h2><FaNewspaper /> Community Posts</h2>
                <div className="card-header-actions">
                  <button onClick={() => {
                    console.log("Navigating to create post");
                    navigate('/create-post');
                  }} className="create-post-button">
                    <FaEdit /> Create Post
                  </button>
                  <button onClick={() => {
                    console.log("Navigating to community");
                    navigate('/community');
                  }} className="view-all">
                    View All Posts
                  </button>
                </div>
              </div>
              <div className="card-content">
                {Array.isArray(latestPosts) && latestPosts.length > 0 ? (
                  latestPosts.map((post) => (
                    <div key={post._id || `post-${Math.random()}`} className="community-post">
                      <div className="post-author-info">
                        <img 
                          src={post.authorProfileImage || "/default-avatar.png"} 
                          alt={post.authorName || "Author"} 
                          className="author-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <p className="community-post-author">{post.authorName || "Unknown Author"}</p>
                      </div>
                      <h3 className="community-post-title">{post.title || "Untitled Post"}</h3>
                      <p className="post-preview">
                        {post.content ? `${post.content.substring(0, 100)}...` : "No content available"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="no-posts-message">No posts from people you follow. Start following others to see their updates!</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;