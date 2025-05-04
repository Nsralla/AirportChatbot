import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';  // Assuming you're using CSS Modules
import { BASE_URL } from '../../api';

export default function HomePage() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  function handleLogOut() {
    localStorage.removeItem("token");
    navigate('/');
  }

  // Fetch chats on load
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/chats/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(res.data);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        if (err.response && err.response.status === 401) {
          // Redirect to login if unauthorized
          navigate('/');
        }
      }
    };

    fetchChats();
  }, [navigate]);

  // Handle new chat creation
  const handleNewChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/chats/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newChatId = res.data.id;
      navigate(`/chat/${newChatId}`);
    } catch (err) {
      console.error("Failed to create new chat:", err);
      if (err.response && err.response.status === 401) {
        // Redirect to login if unauthorized
        navigate('/');
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/'); // Redirect to login page
  };

  return (
    <div className={styles.homepage}>
      <h1>Welcome to the Chatbot Home Page</h1>
      <div className={styles.header}>
        <button onClick={handleNewChat} className={styles.newChatButton}>+ New Chat</button>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </div>

      <h2>Your Chats</h2>
      <ul className={styles.chatList}>
        {chats.map((chat) => (
          <li key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className={styles.chatItem}>
            Chat #{chat.id} - {new Date(chat.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
