import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "./chatlist.css";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`https://fisat-forge-last.onrender.com/chats/${userId}`);
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chat list:", error);
      }
    };

    if (userId) fetchChats();
  }, [userId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="chatlist-container">
      <div className="chatlist-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate("/dashboard")} aria-label="Back to Dashboard">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Your Chats</h2>
        </div>
      </div>
      <div className="chatlist-box">
        {chats.length === 0 ? (
          <p className="no-messages">No recent chats.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.userId}
              className="chat-item"
              onClick={() => navigate(`/chat/${userId}/${chat.userId}`)}
            >
              <img src={chat.profileImage || "/default-avatar.png"} alt={chat.name} className="chat-avatar" />
              <div className="chat-details2">
                <div className="chat-header2">
                  <h3>{chat.name}</h3>
                  <span className="chat-timestamp">{formatTime(chat.lastMessageTime)}</span>
                </div>
                <p className="chat-preview">{chat.lastMessage}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;