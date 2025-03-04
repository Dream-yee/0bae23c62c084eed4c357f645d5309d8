import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

// 假設這些是實際的合約地址
const VAULT_ADDRESS = "0x73F601aF1293Db93d6297F099FaFC124266275E9"; // 替換為實際的 Vault 合約地址
const USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

// 更新 Vault ABI 以包含所需的函數
const VAULT_ABI = [
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function convertToShares(uint256 assets) view returns (uint256)"
  "function previousLevel() view returns (uint256)",
  "function getTokenLevel() view returns (uint256)",
  "function makeTransaction() returns ()"
];

// ERC20 ABI 只包含我們需要的函數
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const Vault = () => {
  const { account, provider, chainId, switchToArbitrum } = useWeb3();
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxBalance, setMaxBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [vaultShares, setVaultShares] = useState('0');
  const [vaultAssetsValue, setVaultAssetsValue] = useState('0');

  useEffect(() => {
    const fetchBalances = async () => {
      if (provider && account) {
        try {
          setIsLoading(true);
          
          const network = await provider.getNetwork();
          if (network.chainId.toString(16) !== '0xa4b1'.slice(2)) {
            await switchToArbitrum();
            return;
          }

          const signer = provider.getSigner();
          const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
          const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

          const decimals = await usdtContract.decimals();
          const balance = await usdtContract.balanceOf(account);
          const shares = await vaultContract.balanceOf(account);
          const assets = await vaultContract.convertToAssets(shares);
          const previousLevel = await vaultContract.previousLevel();
          const currentLevel = await vaultContract.getTokenLevel();

          // 設置最大餘額：存款時使用 USDT 餘額，提款時使用 vault shares
          setMaxBalance(isDepositing 
            ? ethers.utils.formatUnits(balance, decimals)
            : ethers.utils.formatUnits(shares, decimals)
          );
          setVaultShares(ethers.utils.formatUnits(shares, decimals));
          setVaultAssetsValue(ethers.utils.formatUnits(assets, decimals));

        } catch (error) {
          console.error('Error fetching balances:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBalances();
  }, [provider, account, chainId, isDepositing]);

  // 處理滑桿變化
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(parseFloat(e.target.value).toFixed(1));
    setSliderValue(value);
    const calculatedAmount = (parseFloat(maxBalance) * value / 100).toFixed(1);
    setAmount(calculatedAmount);
  };

  // 處理輸入框變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    const percentage = parseFloat((parseFloat(value) / parseFloat(maxBalance) * 100).toFixed(1)) || 0;
    setSliderValue(Math.min(percentage, 100));
  };

  // 設置最大金額
  const handleSetMax = () => {
    setAmount(maxBalance);
    setSliderValue(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account || !amount) return;

    try {
      const signer = provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
      const decimals = await usdtContract.decimals();
      const parsedAmount = ethers.utils.parseUnits(amount, decimals);

      if (isDepositing) {
        // 檢查和設置授權
        const allowance = await usdtContract.allowance(account, VAULT_ADDRESS);
        if (allowance.lt(parsedAmount)) {
          const tx = await usdtContract.approve(VAULT_ADDRESS, ethers.constants.MaxUint256);
          await tx.wait();
        }
        
        // 存款
        const tx = await vaultContract.deposit(parsedAmount, account);
        await tx.wait();
      } else {
        // 提款：使用 redeem 而不是 withdraw
        const tx = await vaultContract.redeem(parsedAmount, account, account);
        await tx.wait();
      }

      // 重新獲取餘額
      const balance = await usdtContract.balanceOf(account);
      const shares = await vaultContract.balanceOf(account);
      const assets = await vaultContract.convertToAssets(shares);

      // 根據當前模式設置最大餘額
      setMaxBalance(isDepositing 
        ? ethers.utils.formatUnits(balance, decimals)
        : ethers.utils.formatUnits(shares, decimals)
      );
      setVaultShares(ethers.utils.formatUnits(shares, decimals));
      setVaultAssetsValue(ethers.utils.formatUnits(assets, decimals));
      setAmount('');
      setSliderValue(0);

    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-16 flex items-center justify-center relative z-10"
      >
        <div className="backdrop-blur-lg bg-gray-900/50 p-8 rounded-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
          <p className="text-gray-400">Connect your wallet to access the vault features</p>
          <p className="text-gray-400">We currently support MetaMask wallet</p>
          <p className="text-gray-400">:)</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="max-w-4xl mx-auto py-16">
        <div className="backdrop-blur-lg bg-gray-900/50 p-8 rounded-lg">
          {/* Vault Title and Description */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">USDT-wBTC Grid Trading Vault</h1>
            <p className="text-gray-300 mb-4">
              This vault accepts USDT deposits and performs automated grid trading between USDT and wBTC 
              to generate yields through market volatility. The strategy creates a grid of buy and sell 
              orders across a price range, profiting from price movements in either direction.
            </p>
            
            {/* Token Information */}
            <div className="flex flex-col space-y-4 mb-6 bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/usdt-logo.png" 
                    alt="USDT" 
                    className="w-6 h-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://cryptologos.cc/logos/tether-usdt-logo.png';
                    }}
                  />
                  <span className="text-white">USDT</span>
                </div>
                <a 
                  href={`https://etherscan.io/token/${USDT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  {`${USDT_ADDRESS.slice(0, 6)}...${USDT_ADDRESS.slice(-4)}`}
                </a>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/wbtc-logo.png" 
                    alt="wBTC" 
                    className="w-6 h-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png';
                    }}
                  />
                  <span className="text-white">wBTC</span>
                </div>
                <a 
                  href={`https://etherscan.io/token/${WBTC_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  {`${WBTC_ADDRESS.slice(0, 6)}...${WBTC_ADDRESS.slice(-4)}`}
                </a>
              </div>
            </div>

            {/* Vault Contract Address */}
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Vault Contract:</span>
                <a 
                  href={`https://etherscan.io/address/${VAULT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  {`${VAULT_ADDRESS.slice(0, 6)}...${VAULT_ADDRESS.slice(-4)}`}
                </a>
              </div>
            </div>

            {/* Vault Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-1">Total Value Locked</h3>
                <p className="text-white text-2xl font-bold">$1,234,567.89</p>
                <p className="text-gray-400 text-sm">1,234,567.89 USDT</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-1">Current APY</h3>
                <p className="text-white text-2xl font-bold">12.34%</p>
                <p className="text-gray-400 text-sm">7-day average</p>
              </div>
            </div>
          </div>

          {/* Existing Deposit/Withdraw UI */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setIsDepositing(true)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  isDepositing
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setIsDepositing(false)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  !isDepositing
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Withdraw
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                  {isDepositing ? 'Deposit Amount (USDT)' : 'Withdraw Amount (vUSDT)'}
                </label>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <span className="text-sm text-gray-400">Loading balance...</span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Balance: {parseFloat(maxBalance).toFixed(6)} {isDepositing ? 'USDT' : 'vUSDT'}
                    </span>
                  )}
                </div>
              </div>

              {/* 金額輸入區域 */}
              <div className="relative mt-1 flex items-center bg-gray-700/50 rounded-lg p-3 focus-within:ring-2 focus-within:ring-purple-500">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none text-white text-lg font-medium focus:outline-none focus:ring-0"
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleSetMax}
                    disabled={isLoading}
                    className={`px-2 py-1 text-sm font-medium ${
                      isLoading 
                        ? 'text-gray-500 bg-gray-700/50 cursor-not-allowed' 
                        : 'text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20'
                    } rounded transition-colors flex-shrink-0`}
                  >
                    MAX
                  </button>
                  <div className="flex items-center gap-1 bg-gray-600/50 px-2 py-1 rounded-lg flex-shrink-0">
                    <img 
                      src="/usdt-logo.png" 
                      alt="USDT" 
                      className="w-4 h-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://cryptologos.cc/logos/tether-usdt-logo.png';
                      }}
                    />
                    <span className="text-white text-sm font-medium">USDT</span>
                  </div>
                </div>
              </div>

              {/* 滑桿區域 */}
              <div className="pt-2 px-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-purple-500
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:duration-150
                    [&::-webkit-slider-thumb]:hover:bg-purple-400
                    [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-gray-500">{sliderValue.toFixed(1)}%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              {isDepositing ? 'Deposit USDT' : 'Withdraw USDT'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-sm text-gray-300">Your Vault Shares:</span>
              <span className="text-sm font-medium text-white">{parseFloat(vaultShares).toFixed(6)} vUSDT</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg">
              <span className="text-sm text-gray-300">Shares Value:</span>
              <span className="text-sm font-medium text-white">{parseFloat(vaultAssetsValue).toFixed(6)} USDT</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Vault; 
