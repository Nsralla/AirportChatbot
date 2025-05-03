import React, { useState } from 'react';
import styles from './HomePage.module.css';
import axios from 'axios';
import { useEffect } from 'react';
import { BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../../utils/auth';


export default function HomePage() {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'Bot', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);





  //function to get all old interactions  
  useEffect(() => {
    const fetchAllInteractions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || isTokenExpired(token)) {
          localStorage.removeItem("token"); // Remove token if expired
          navigate('/'); // Redirect to login page
          return;
        }
        const response = await axios.get(`${BASE_URL}/interactions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && response.data.length > 0) {
          const oldMessages = response.data.flatMap(interaction => ([
            { sender: 'User', text: interaction.userMessage },
            { sender: 'Bot', text: interaction.botMessage }
          ]));
          setMessages(prev => [...prev, ...oldMessages]);
        }

      } catch (error) {
        console.error("Error fetching interactions:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token"); // Remove token if unauthorized
          navigate('/');
        }
      }
    };
    fetchAllInteractions();
  }, [navigate]);


  // Function to handle sending messages
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input;


    setMessages(prev => [...prev, { sender: 'User', text: userMessage }]); // show user message immediately
    setInput('');
    setLoading(true); // Set loading state to true
    const sendInteraction = async () => {
      try {
        const response = await axios.post(`${BASE_URL}/interactions/`, {
          userMessage,
          botMessage: '', // initially empty; backend generates bot response
          timestamp: new Date().toISOString()
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const botMessage = response.data.botMessage;
        setMessages(prev => [...prev, { sender: 'Bot', text: botMessage }]); // update with bot response
      } catch (error) {
        console.error("Error sending message:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate('/');
        }
      } finally {
        setLoading(false); // Set loading state to false after sending
      }
    };


    sendInteraction();

  };
  // function to get user email
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || isTokenExpired(token)) {
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
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token"); // Remove token if unauthorized
          navigate('/');
        }
      }
    };

    fetchUserData();
  }, [navigate]); // Empty dependency array means this runs once when the component mounts


  return (
    <div className={`${styles.homeContainer} ${sidebarOpen ? styles.containerOpen : ''}`} id="homeContainer">

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} id="sidebar">
        <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>&times;</button>
        <h2>User Info</h2>
        <p><strong>Email:</strong> {userEmail}</p>

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

          {loading && (
                    <div className={`${styles.messageItem} ${styles.messageItemBot}`}>
                      <div className={styles.messageBubble}>
                        <span className={styles.messageSender}>Bot</span>
                        <p className={styles.messageText}>Typing...</p>
                      </div>
                    </div>
                  )}
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
