import React, { useState } from 'react';
import styles from './HomePage.module.css';
import axios from 'axios';
import { useEffect } from 'react';
import { BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../../utils/auth';


export default function HomePage() {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'Bot', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'User ', text: input }]);
    setInput('');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if(!token || isTokenExpired(token)){
          localStorage.removeItem("token"); // Remove token if expired
          navigate('/'); // Redirect to login page
          return;
        }
        const response = await axios.get(`${BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserEmail(response.data.email); 
        console.log("User data fetched successfully:", response.data.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if(error.response && error.response.status === 401){
          localStorage.removeItem("token"); // Remove token if unauthorized
          navigate('/');
        }
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means this runs once when the component mounts


  return (
    <div className={`${styles.homeContainer} ${sidebarOpen ? styles.containerOpen : ''}`} id="homeContainer">
      
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} id="sidebar">
        <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>&times;</button>
        <h2>User Info</h2>
        <p><strong>Email:</strong> {userEmail}</p>
        <h3>Old Chats</h3>
        <ul className={styles.chatList}>
          {messages.filter(m => m.sender === 'User').map((m, i) => (
            <li key={i}>{m.text}</li>
          ))}
        </ul>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}

      {/* Header */}
      <header className={styles.header} id="header">
        <button className={styles.burgerBtn} onClick={() => setSidebarOpen(true)}>&#9776;</button>
        <h1 className={styles.title} id="title">ChatBot Pro</h1>
      </header>

      {/* Chat Window */}
      <main className={styles.chatWindow} id="chatWindow">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.messageItem} ${msg.sender === 'User' ? styles.messageItemUser : styles.messageItemBot}`}
          >
            <div className={styles.messageBubble}>
              <span className={styles.messageSender}>{msg.sender}</span>
              <p className={styles.messageText}>{msg.text}</p>
            </div>
          </div>
        ))}
      </main>

      {/* Input Section */}
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
