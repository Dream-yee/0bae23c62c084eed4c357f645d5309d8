import { useWeb3 } from '../contexts/Web3Context';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { account, connect, disconnect } = useWeb3();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-lg bg-gray-900/50 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/DeGrid.png" 
                  alt="DeGrid" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    console.error('Error loading logo');
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Link>
              <div className="ml-10 flex items-center space-x-1">
                <Link 
                  to="/about" 
                  className={`relative px-4 py-2 rounded-lg transition-colors ${
                    isActive('/about') 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isActive('/about') && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gray-800/50 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">About</span>
                </Link>
                <Link 
                  to="/vault" 
                  className={`relative px-4 py-2 rounded-lg transition-colors ${
                    isActive('/vault') 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isActive('/vault') && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gray-800/50 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">Vault</span>
                </Link>
              </div>
            </div>
            <div>
              {account ? (
                <button
                  onClick={disconnect}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-green-500/25 border border-green-500/20"
                >
                  {account.slice(0, 6)}...{account.slice(-4)}
                </button>
              ) : (
                <button
                  onClick={connect}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 border border-purple-500/20"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 