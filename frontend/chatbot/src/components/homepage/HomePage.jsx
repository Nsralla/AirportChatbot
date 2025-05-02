import React, { useState } from 'react';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [messages, setMessages] = useState([
    { sender: 'Bot', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'User', text: input }]);
    setInput('');
    // TODO: send to backend and append bot response
  };

  return (
    <div className={styles.homeContainer} id="homeContainer">
      <header className={styles.header} id="header">
        <h1 className={styles.title} id="title">ChatBot Pro</h1>
      </header>

      <main className={styles.chatWindow} id="chatWindow">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.messageItem} ${msg.sender === 'User' ? styles.messageItemUser : styles.messageItemBot}`}
            id={`messageItem-${idx}`}
          >
            <div className={styles.messageBubble} id={`messageBubble-${idx}`}>
              <span className={styles.messageSender} id={`messageSender-${idx}`}>{msg.sender}</span>
              <p className={styles.messageText} id={`messageText-${idx}`}>{msg.text}</p>
            </div>
          </div>
        ))}
      </main>

      <div className={styles.inputContainer} id="inputContainer">
        <input
          type="text"
          className={styles.inputField}
          id="inputField"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <button
          className={styles.sendButton}
          id="sendButton"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
