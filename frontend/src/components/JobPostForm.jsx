import { useState, useEffect } from 'react';
import axios from 'axios';
import './JobPostForm.css';
import { useNavigate } from "react-router-dom";
import logo from "./assets/logos.png";

export default function JobPostForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary_range: '',
    deadline: '',
    job_type: 'fulltime',
    experience_level: 'entry'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem("studentId")); // Get logged-in alumni ID
  const [jobs, setJobs] = useState([]); // Store jobs
  const [editingJob, setEditingJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary_range: job.salary_range || '',
      deadline: job.deadline.split("T")[0], // Format date correctly
      job_type: job.job_type,
      experience_level: job.experience_level,
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get("https://fisat-forge-last.onrender.com/jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingJob) {
        // Editing existing job
        await axios.put(`https://fisat-forge-last.onrender.com/jobs/${editingJob._id}`, {
          ...formData,
          studentId: userId, // Ensure only the job poster can edit
        });
      } else {
        // Creating a new job
        await axios.post('https://fisat-forge-last.onrender.com/jobs', {
          ...formData,
          posted_by: userId,
          status: 'active'
        });
      }

      setSuccess(true);
      fetchJobs(); // Refresh job list
      setTimeout(() => {
        onSuccess();
        setFormData({
          title: '',
          company: '',
          description: '',
          requirements: '',
          location: '',
          salary_range: '',
          deadline: '',
          job_type: 'fulltime',
          experience_level: 'entry'
        });
        setEditingJob(null); // Reset editing state
      }, 2000);
    } catch (error) {
      console.error('Error posting/updating job:', error);
      setError('Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await axios.delete(`https://fisat-forge-last.onrender.com/jobs/${id}`, {
        data: { studentId: userId }, // Ensure only the job poster can delete
      });
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Try again.");
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
        const response = await axios.get(`https://fisat-forge-last.onrender.com/jobs/${jobId}/applications`);
        console.log("Applicants data:", response.data); // Verify the data
        setApplicants(response.data);
        setSelectedJob(jobId);
        setShowApplicants(true);
    } catch (error) {
        console.error("Error fetching applicants:", error);
        alert("Failed to fetch applicants. Try again.");
    }
};
  const handleViewResume = (resume) => {
    setSelectedResume(resume);
    setShowResumeModal(true);
  };

  const downloadResume = (resume, applicantName) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = resume;
    link.download = `${applicantName}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await axios.put(`https://fisat-forge-last.onrender.com/applications/${applicationId}/status`, {
        status: newStatus,
        alumniId: userId
      });
      
      // Refresh the applicants list
      fetchApplicants(selectedJob);
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status. Try again.");
    }
  };

  return (
    <div className="job-post-container">
      <nav className="navbar1x">
        <div className="navbar1-containerx">
          <div className="logox">
            <img 
              src={logo} 
              alt="FISAT Forge Logo" 
              className="logo-imagex" 
              style={{ cursor: "pointer" }} 
              onClick={() => navigate("/dashboard")} 
            />
            <div className="site-titlex">
              <h1>FISAT Forge</h1>
              <p className="subtitlex">Together For Tomorrow</p>
            </div>
          </div>
        </div>
      </nav>
      {!showApplicants ? (
        <>
          <div className="job-post-header">
            <h1>{editingJob ? 'Edit Job' : 'Post a New Job'}</h1>
            <p>Share an opportunity with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="job-post-form">
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                Job {editingJob ? 'updated' : 'posted'} successfully! Redirecting...
              </div>
            )}

            <div className="form-section">
              <div className="form-group">
                <label className="form-label required-field">Job Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="form-group">
                <label className="form-label required-field">Company</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Tech Solutions Inc."
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required-field">Job Type</label>
                  <select
                    className="form-input"
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  >
                    <option value="fulltime">Full-time</option>
                    <option value="parttime">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required-field">Experience Level</label>
                  <select
                    className="form-input"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label className="form-label required-field">Job Description</label>
                <textarea
                  required
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                />
              </div>

              <div className="form-group">
                <label className="form-label required-field">Requirements</label>
                <textarea
                  required
                  className="form-textarea"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the required skills, qualifications, and experience..."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required-field">Location</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="e.g., $50,000 - $70,000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required-field">Application Deadline</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
            </button>
          </form>

          <div className="jobs-grid">
            {jobs.map((job) => {
              const isJobOwner = job.posted_by === userId; // Check if current user is the job owner

              return (
                <div key={job._id} className="job-card">
                  <h2 className="job-title">{job.title}</h2>
                  <p className="company-name">{job.company}</p>
                  <p className="job-location">{job.location}</p>
                  <p className="job-deadline">
                    <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                  </p>

                  <div className="job-actions">
                    {/* Show Applicants button only for job owners */}
                    {isJobOwner && (
                      <button className="applicants-button" onClick={() => fetchApplicants(job._id)}>
                        Applicants
                      </button>
                    )}
                    {/* <button className="save-button">Save Job</button> */}

                    {/* Show Edit & Delete buttons ONLY for job poster */}
                    {isJobOwner && (
                      <>
                        <button className="edit-button" onClick={() => handleEdit(job)}>Edit</button>
                        <button className="delete-button" onClick={() => handleDelete(job._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // Applicants view
        <div className="applicants-container">
          <div className="applicants-header">
            <h2>Applicants</h2>
            <button className="back-button2" onClick={() => setShowApplicants(false)}>
              Back to Jobs
            </button>
          </div>

          {applicants.length === 0 ? (
            <div className="no-applicants">
              <p>No applications received yet.</p>
            </div>
          ) : (
            <div className="applicants-list">
              {applicants.map((applicant) => (
                <div className="applicant-card">
                <div className="applicant-info">
                  <h3>{applicant.student_name || "Unknown Applicant"}</h3>
                  <p>{applicant.student_email || "No email provided"}</p>
                  <p>{applicant.student_phone || "No phone no provided"}</p>
                  <p>Applied: {new Date(applicant.applied_at).toLocaleDateString()}</p>
                  <p className={`status-badge ${applicant.status}`}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </p>
                </div>
                {/* Rest of your code */}
              
                  <div className="applicant-actions">
                    <button 
                      className="view-resume-button"
                      onClick={() => handleViewResume(applicant.resume)}
                    >
                      View Resume
                    </button>
                    <button 
                      className="download-resume-button"
                      onClick={() => downloadResume(applicant.resume, applicant.student_name)}
                    >
                      Download Resume
                    </button>
                    <div className="status-actions">
                      <button 
                        className="accept-button"
                        onClick={() => updateApplicationStatus(applicant._id, 'accepted')}
                        disabled={applicant.status === 'accepted'}
                      >
                        Accept
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => updateApplicationStatus(applicant._id, 'rejected')}
                        disabled={applicant.status === 'rejected'}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resume Modal */}
      {showResumeModal && selectedResume && (
        <div className="resume-modal-overlay">
          <div className="resume-modal">
            <div className="resume-modal-header">
              <h2>Resume Preview</h2>
              <button className="close-button" onClick={() => setShowResumeModal(false)}>×</button>
            </div>
            <div className="resume-content">
              <iframe 
                src={selectedResume} 
                title="Resume Preview" 
                width="100%" 
                height="600px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}