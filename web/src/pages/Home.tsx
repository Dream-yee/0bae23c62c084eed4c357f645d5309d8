import { motion } from 'framer-motion';
import Background3D from '../components/Background3D';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const words = ["Decentralized", "Transparent", "Secure", "Automated", "Free"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const typingSpeed = 100; // 打字速度
    const deletingSpeed = 50; // 刪除速度
    const wordPause = 1500; // 單詞顯示時間
    
    const type = () => {
      const currentWord = words[currentWordIndex];
      
      if (isDeleting) {
        // 刪除文字
        setCurrentText(prev => prev.slice(0, -1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      } else {
        // 添加文字
        if (currentText === currentWord) {
          // 完整顯示後暫停
          setTimeout(() => {
            setIsDeleting(true);
          }, wordPause);
        } else {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }
      }
    };

    const timer = setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <>
      <Background3D />
      <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto py-16 text-center relative z-10"
        >
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-['Space_Grotesk'] text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
              DeGrid
            </h1>
            <p className="text-2xl sm:text-3xl font-light text-white font-['Space_Grotesk']">
              <span className="inline-block min-w-[240px] text-purple-400">
                {currentText}
                <span className="text-white"> grid trading solution</span>
              </span>
            </p>
          </motion.div>
          


          <motion.div
            className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-[1px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 animate-shine"></div>
                <Link
                  to="/vault"
                  className="relative block bg-gray-900 px-8 py-4 rounded-lg text-white font-semibold hover:bg-gray-800/80 transition-colors"
                >
                  Launch App
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <Link
                to="/about"
                className="block px-8 py-4 rounded-lg text-white font-semibold border border-gray-700 hover:border-purple-500 transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="backdrop-blur-lg bg-gray-900/30 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-purple-400 mb-2">24/7</h3>
              <p className="text-gray-300">Automated Trading</p>
            </div>
            <div className="backdrop-blur-lg bg-gray-900/30 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">100%</h3>
              <p className="text-gray-300">Decentralized</p>
            </div>
            <div className="backdrop-blur-lg bg-gray-900/30 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-purple-400 mb-2">ERC4626</h3>
              <p className="text-gray-300">Standard Vault</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Home; 