import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ChatPage.module.css';
import {  isTokenExpired } from '../../utils/auth';  // Adjust path as needed
import { BASE_URL } from '../../api';  // Adjust path as needed
export default function ChatPage() {
  const { chatId } = useParams();
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
          localStorage.removeItem("token");
          navigate('/');
          return;
        }
        const res = await axios.get(`${BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserEmail(res.data.email);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        localStorage.removeItem("token");
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch all messages for this chat
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
       
        const chatIdNum = parseInt(chatId, 10);
        const res = await axios.get(`${BASE_URL}/chats/${chatIdNum}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
     
        const formatted = res.data.map(msg => ({
          sender: msg.sender === 'user' ? 'User' : 'Bot',
          text: msg.content
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate('/');
        }
      }
    };
    fetchMessages();
  }, [chatId, navigate]);

  // Send a message
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'User', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/messages/`, {
        chat_id: parseInt(chatId),
        user_message: userMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

        
      const botMsg = res.data.find(msg => msg.sender === 'bot');
      if (botMsg) {
        setMessages(prev => [...prev, { sender: 'Bot', text: botMsg.content }]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.chatContainer} ${sidebarOpen ? styles.containerOpen : ''}`}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>&times;</button>
        <h2>User Info</h2>
        <p><strong>Email:</strong> {userEmail}</p>
      </div>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.burgerBtn} onClick={() => setSidebarOpen(true)}>&#9776;</button>
        <h1 className={styles.title}><Link to="/home">ChatBot Pro</Link></h1>
      </header>

      {/* Chat window */}
      <main className={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageItem} ${msg.sender === 'User' ? styles.messageItemUser : styles.messageItemBot}`}>
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

      {/* Input field */}
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <button className={styles.sendButton} onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
