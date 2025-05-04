import './App.css'
import Login from './components/login/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sigin from './components/sigin/Sigin';
import HomePage from './components/homepage/HomePage';
import ChatPage from './components/Chat/ChatPage';
function App() {

  return (
   <Router>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signin" element={<Sigin />} />
      <Route path="/home" element={<HomePage />} />         {/* Shows list of chats */}
      <Route path="/chat/:chatId" element={<ChatPage />} /> {/* Shows a single chat + messages */}
      </Routes>
   </Router>
  )
}

export default App
