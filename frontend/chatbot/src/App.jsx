import './App.css'
import Login from './components/login/login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sigin from './components/sigin/Sigin';
function App() {

  return (
   <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/signin" element={<Sigin/>}/>
      </Routes>
   </Router>
  )
}

export default App
