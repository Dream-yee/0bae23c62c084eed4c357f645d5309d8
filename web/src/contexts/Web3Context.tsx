import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';

// Arbitrum One 網絡配置
const ARBITRUM_CHAIN_ID = '0xa4b1'; // 42161 in hex
const ARBITRUM_CONFIG = {
  chainId: ARBITRUM_CHAIN_ID,
  chainName: 'Arbitrum One',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://arbiscan.io/']
};

interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: string | null;
  switchToArbitrum: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  connect: async () => {},
  disconnect: () => {},
  chainId: null,
  switchToArbitrum: async () => {},
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const switchToArbitrum = async () => {
    if (!window.ethereum) return;

    try {
      // 嘗試切換到 Arbitrum
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // 如果網絡不存在，則添加網絡
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARBITRUM_CONFIG],
          });
        } catch (addError) {
          console.error('Error adding Arbitrum network:', addError);
        }
      } else {
        console.error('Error switching to Arbitrum:', switchError);
      }
    }
  };

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);
          const network = await provider.getNetwork();
          setChainId('0x' + network.chainId.toString(16));
          setAccount(accounts[0]);
          setProvider(provider);

          // 如果不是 Arbitrum 網絡，提示切換
          if (network.chainId.toString(16) !== ARBITRUM_CHAIN_ID.slice(2)) {
            await switchToArbitrum();
          }
        }
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
        alert('Failed to connect to MetaMask. Please try again.');
      }
    } else {
      alert('Please install MetaMask!');
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum?.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts?.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum as ExternalProvider);
            setAccount(accounts[0]);
            setProvider(provider);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        setProvider(null);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider value={{ 
      account, 
      provider, 
      connect, 
      disconnect, 
      chainId,
      switchToArbitrum 
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context); 