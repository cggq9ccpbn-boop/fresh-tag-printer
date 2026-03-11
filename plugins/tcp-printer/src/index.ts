import { registerPlugin } from '@capacitor/core';

export interface TcpPrinterPlugin {
  print(options: { ip: string; port: number; data: string }): Promise<{ success: boolean }>;
  testConnection(options: { ip: string; port: number }): Promise<{ connected: boolean }>;
}

const TcpPrinter = registerPlugin<TcpPrinterPlugin>('TcpPrinter');

export { TcpPrinter };
