import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FollowersModal.css";

const FollowersModal = ({ show, onClose, followers }) => {
  const [followerProfiles, setFollowerProfiles] = useState([]);

  useEffect(() => {
    if (!show || followers.length === 0) {
      setFollowerProfiles([]);
      return;
    }

    const fetchFollowerProfiles = async () => {
      try {
        const profilePromises = followers.map((followerId) =>
          axios.get(`https://fisat-forge-last.onrender.com/profile/${followerId}`)
        );
        const profileResponses = await Promise.all(profilePromises);
        setFollowerProfiles(profileResponses.map((res) => res.data));
      } catch (error) {
        console.error("Error fetching follower profiles:", error);
      }
    };

    fetchFollowerProfiles();
  }, [show, followers]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Followers</h2>
        {followerProfiles.length > 0 ? (
          <ul>
            {followerProfiles.map((profile) => (
              <li key={profile._id}>
                {profile.Name} (
                @{profile.Email ? profile.Email.split("@")[0] : "Unknown"})
              </li>
            ))}
          </ul>
        ) : (
          <p>No followers to display.</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default FollowersModal;
