import { useEffect, useState } from 'react';
import axios from 'axios';
import './JobListings.css';
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaFileUpload, FaCheckCircle } from "react-icons/fa";
import logo from "./assets/logos.png"; // Adjust path as needed
import { io } from "socket.io-client";

// Initialize Socket.IO client outside the component
const socket = io("https://fisat-forge-last.onrender.com");

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    experience: "",
    postedBy: "",
    status: ""
  });
  const [posters, setPosters] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    name:"",
    email:"",
    phone:"",
    coverLetter: "",
    resume: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Fetch jobs from the server
  const fetchJobs = async () => {
    try {
      const response = await axios.get('https://fisat-forge-last.onrender.com/jobs');
      setJobs(response.data || []);
      setFilteredJobs(response.data || []);
      const uniquePosters = [...new Set(response.data.map(job => job.posted_by_name))].filter(Boolean);
      setPosters(uniquePosters);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's applications
  const fetchUserApplications = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`https://fisat-forge-last.onrender.com/student/${userId}/applications`);
      const statusMap = {};
      response.data.forEach(app => {
        statusMap[app.job_id] = app.status; // Map job_id to status
      });
      setApplicationStatus(statusMap);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Apply filters to job list
  const applyFilters = () => {
    let result = [...jobs];
    if (filters.location) {
      result = result.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.jobType) {
      result = result.filter(job => 
        job.job_type.toLowerCase() === filters.jobType.toLowerCase()
      );
    }
    if (filters.experience) {
      result = result.filter(job => 
        job.experience_level.toLowerCase() === filters.experience.toLowerCase()
      );
    }
    if (filters.postedBy) {
      result = result.filter(job => 
        job.posted_by_name === filters.postedBy
      );
    }
    if (filters.status) {
      result = result.filter(job => 
        job.status === filters.status
      );
    }
    setFilteredJobs(result);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      location: "",
      jobType: "",
      experience: "",
      postedBy: "",
      status: ""
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Open apply modal
  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  // Close apply modal
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplicationData({name:"",email:"",phone:"",coverLetter: "", resume: null });
  };

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file change for resume
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplicationData(prev => ({ ...prev, resume: file }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle application submission
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applicationData.resume) {
      alert("Please upload your resume");
      return;
    }
  
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("studentId", userId);
      formData.append("name", applicationData.name); // Changed from studentname
      formData.append("email", applicationData.email); // Changed from studentemail
      formData.append("phone", applicationData.phone); // Changed from studentphone
      formData.append("coverLetter", applicationData.coverLetter);
      formData.append("resume", applicationData.resume);
  
      await axios.post(
        `https://fisat-forge-last.onrender.com/jobs/${selectedJob._id}/apply`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      setApplicationStatus(prev => ({
        ...prev,
        [selectedJob._id]: "pending"
      }));
  
      await fetchUserApplications();
      alert("Application submitted successfully!");
      closeApplyModal();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };
  // Refresh applications manually
  const refreshApplications = () => {
    fetchUserApplications();
  };

  // Single useEffect for initialization and Socket.IO setup
  useEffect(() => {
    fetchJobs();
    fetchUserApplications();

    socket.emit("joinRoom", userId);

    socket.on("applicationStatusUpdate", ({ job_id, status }) => {
      setApplicationStatus(prev => ({
        ...prev,
        [job_id]: status
      }));
      fetchUserApplications(); // Re-fetch to ensure consistency with backend
    });

    return () => {
      socket.off("applicationStatusUpdate");
    };
  }, [userId]);

  // Apply filters whenever filters or jobs change
  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  return (
    <div className="job-listings-container">
      <nav className="navbar44">
        <div className="navbar44-container">
          <div className="logo">
            <Link to="/dashboard">
              <img src={logo} alt="Logo" />
            </Link>
            <div className="site-title">
              <h1>FISAT Forge</h1>
              <p className="subtitle">Together For Tomorrow</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
      <div className="job-listings-header">
        <h1>Available Job Opportunities</h1>
        <p>Find your next career opportunity</p>
      </div>

      <div className="job-filters">
        <div className="job-filters-grid">
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select 
              id="location" 
              name="location" 
              value={filters.location} 
              onChange={handleFilterChange}
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="jobType">Job Type</label>
            <select 
              id="jobType" 
              name="jobType" 
              value={filters.jobType} 
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="experience">Experience Level</label>
            <select 
              id="experience" 
              name="experience" 
              value={filters.experience} 
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="postedBy">Posted By</label>
            <select 
              id="postedBy" 
              name="postedBy" 
              value={filters.postedBy} 
              onChange={handleFilterChange}
            >
              <option value="">All Posters</option>
              {posters.map((poster, index) => (
                <option key={index} value={poster}>{poster}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select 
              id="status" 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="reset-button" onClick={resetFilters}>Reset Filters</button>
          <span className="results-count">{filteredJobs.length} jobs found</span>
          <button className="refresh-button" onClick={refreshApplications}>Refresh Applications</button>
        </div>
      </div>
      
      <div className="jobs-grid">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isClosed = job.status === "closed";
            const hasApplied = !!applicationStatus[job._id]; // Check if status exists
            
            return (
              <div key={job._id} className={`job-card ${isClosed ? "closed-job" : ""}`}>
                <div className="job-card-header">
                  <div>
                    <h2 className="job-title">{job.title}</h2>
                    <p className="company-name">{job.company}</p>
                    <p className="posted-by">Posted by: {job.posted_by_name || "Unknown"}</p>
                  </div>
                  <div className="job-card-meta">
                    <span className="post-date">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    {isClosed && <span className="status-indicator closed">Closed</span>}
                    {!isClosed && <span className="status-indicator active">Active</span>}
                  </div>
                </div>

                <div className="job-details">
                  <p className="job-description">{job.description}</p>
                  <div className="job-meta">
                    <div className="meta-item">
                      <span className="meta-label">Location</span>
                      <span className="meta-value">{job.location}</span>
                    </div>
                    {job.salary_range && (
                      <div className="meta-item">
                        <span className="meta-label">Salary Range</span>
                        <span className="meta-value">{job.salary_range}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-label">Application Deadline</span>
                      <span className="meta-value">
                        {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Job Type</span>
                      <span className="meta-value">{job.job_type}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Experience</span>
                      <span className="meta-value">{job.experience_level}</span>
                    </div>
                  </div>
                  <div className="requirements">
                    <h3>Requirements</h3>
                    <p>{job.requirements}</p>
                  </div>
                </div>

                <div className="job-actions">
                  {isClosed ? (
                    <span className="closed-label">Job Closed</span>
                  ) : hasApplied ? (
                    <button className="applied-button" disabled>
                      <FaCheckCircle /> Application {applicationStatus[job._id].charAt(0).toUpperCase() + applicationStatus[job._id].slice(1)}
                    </button>
                  ) : (
                    <button className="apply-button" onClick={() => openApplyModal(job)}>
                      <FaFileUpload /> Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-jobs-message">
            <p>No jobs match your filter criteria. Try adjusting your filters.</p>
            <button className="reset-button" onClick={resetFilters}>Reset Filters</button>
          </div>
        )}
      </div>

      {showApplyModal && selectedJob && (
        <div className="modal-overlay">
          <div className="application-modal">
            <div className="modal-header">
              <h2>Apply for {selectedJob.title}</h2>
              <button className="close-button" onClick={closeApplyModal}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitApplication}>
              <div className="form-group">
  <label htmlFor="studentname">Name</label>
  <input
  type="text"
  id="studentname"
  name="name"  // Change this from "studentname" to "name"
  value={applicationData.name}
  onChange={handleInputChange}
  placeholder="Name"
/>
</div>

<div className="form-group">
  <label htmlFor="studentemail">Email</label>
  <input
  type="email"
  id="studentemail"
  name="email"  // Change this from "studentemail" to "email"
  value={applicationData.email}
  onChange={handleInputChange}
  placeholder="Email"
/>
</div>

<div className="form-group">
  <label htmlFor="studentphone">Phone No</label>
  
<input
  type="tel"
  id="studentphone"
  name="phone"  // Change this from "studentphone" to "phone"
  value={applicationData.phone}
  onChange={handleInputChange}
  placeholder="Phone No"
/>
</div>

<div className="form-group">
  <label htmlFor="resume">Resume (PDF, DOC, DOCX)</label>
  <input
    type="file"
    id="resume"
    accept=".pdf,.doc,.docx"
    onChange={handleFileChange}
    required
  />
  <p className="file-help">Upload your most recent resume</p>
</div>

<div className="form-group">
  <label htmlFor="coverLetter">Cover Letter (Optional)</label>
  <textarea
    id="coverLetter"
    name="coverLetter"
    value={applicationData.coverLetter}
    onChange={handleInputChange}
    rows="3"
    placeholder="Tell us why you're a good fit for this position..."
  />
</div>
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={closeApplyModal}>Cancel</button>
                  <button type="submit" className="submit-button" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}