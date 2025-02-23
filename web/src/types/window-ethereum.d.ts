import { ExternalProvider } from '@ethersproject/providers';

interface EthereumEvent {
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on(event: 'chainChanged', handler: (chainId: string) => void): void;
  on(event: 'connect', handler: (connectInfo: { chainId: string }) => void): void;
  on(event: 'disconnect', handler: (error: { code: number; message: string }) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  request(args: { method: string; params?: any[] }): Promise<any>;
}

declare global {
  interface Window {
    ethereum?: ExternalProvider & EthereumEvent & {
      isMetaMask?: boolean;
      autoRefreshOnNetworkChange?: boolean;
    };
  }
} 