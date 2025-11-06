declare module 'http';
declare module 'dotenv';

declare const console: Console;
declare const process: NodeJS.Process;
declare const Buffer: BufferConstructor;

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearTimeout(id: number): void;
declare function clearInterval(id: number): void;

interface Console {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
}

declare namespace NodeJS {
  interface Process {
    env: ProcessEnv;
    exit(code?: number): never;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  interface ProcessEnv {
    [key: string]: string | undefined;
    PORT?: string;
    UPDATE_INTERVAL?: string;
    OBJECTS_COUNT?: string;
    VALID_API_KEYS?: string;
  }
}

