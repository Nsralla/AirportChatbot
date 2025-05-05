import './App.css'
import Login from './components/login/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sigin from './components/sigin/Sigin';
import HomePage from './components/homepage/HomePage';
import ChatPage from './components/Chat/ChatPage';
import NotFound from '../NotFound';
function App() {

  return (
   <Router>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signin" element={<Sigin />} />
      <Route path="/home" element={<HomePage />} />         {/* Shows list of chats */}
      <Route path="/chat/:chatId" element={<ChatPage />} /> {/* Shows a single chat + messages */}

      <Route path="*" element={<NotFound/> } /> {/* 404 page */}
      </Routes>
   </Router>
  )
}

export default App
