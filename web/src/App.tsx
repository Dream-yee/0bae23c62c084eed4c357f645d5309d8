import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Vault from './pages/Vault';
import { Web3Provider } from './contexts/Web3Context';
import Background3D from './components/Background3D';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen">
          <Background3D />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/vault" element={<Vault />} />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App; 