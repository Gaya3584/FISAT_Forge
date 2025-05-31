import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const socket = io("https://fisat-forge-last.onrender.com:5000");

const Chat = () => {
  const { userId, recipientId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchRecipientDetails = async () => {
      try {
        const response = await axios.get(`https://fisat-forge-last.onrender.com/profile/${recipientId}`);
        setRecipientDetails(response.data);
      } catch (err) {
        console.error("Error fetching recipient details:", err);
        setError("Could not load recipient details");
      }
    };

    fetchRecipientDetails();
  }, [recipientId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://fisat-forge-last.onrender.com/messages/${userId}/${recipientId}`);
        setMessages(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        setIsLoading(false);
      }
    };

    fetchMessages();

    const chatRoom = [userId, recipientId].sort().join("-");
    socket.emit("joinRoom", chatRoom);

    socket.on("receiveMessage", (message) => {
      if (
        (message.senderId === userId && message.recipientId === recipientId) ||
        (message.senderId === recipientId && message.recipientId === userId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === recipientId) setIsTyping(true);
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === recipientId) setIsTyping(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [userId, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", { senderId: userId, recipientId });
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { senderId: userId, recipientId });
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      // Create message object with local timestamp
      const messageObj = {
        senderId: userId,
        recipientId,
        message: newMessage,
        createdAt: new Date()
      };
      
      // Update local state immediately (add this line)
      setMessages(prevMessages => [...prevMessages, messageObj]);
      
      // Then emit to socket
      socket.emit("sendMessage", {
        senderId: userId,
        recipientId,
        message: newMessage,
      });
      
      setNewMessage("");
      socket.emit("stopTyping", { senderId: userId, recipientId });
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    }
  };
  // Add to useEffect in Chat.jsx where other socket listeners are defined
socket.on("messageReadUpdate", ({ messageId }) => {
  setMessages(prevMessages => 
    prevMessages.map(msg => 
      msg._id === messageId ? { ...msg, isRead: true } : msg
    )
  );
});

// Add this useEffect to mark messages as read when they appear in view
useEffect(() => {
  // Mark received messages as read
  messages.forEach(msg => {
    if (msg.senderId === recipientId && !msg.isRead) {
      socket.emit("messageRead", { messageId: msg._id, readerId: userId });
    }
  });
}, [messages, recipientId, userId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) return <div className="loading">Loading messages...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        
<button className="back-button" onClick={() => navigate("/chatlist")}>
  <FontAwesomeIcon icon={faArrowLeft} />
</button>
        <div className="recipient-info">
          <h2>{recipientDetails?.Name || "Chat"}</h2>
          <p>{recipientDetails?.Email || ""}</p>
        </div>
      </div>

      <div className="chat-box">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.senderId === userId ? "sent" : "received"}`}
            >
              <p>{msg.message}</p>
              <span className="timestamp">{formatTime(msg.createdAt)}</span>
            </div>
          ))
        )}
        {isTyping && <div className="typing-indicator">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;