/// <reference types="vite/client" />

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "@vercel/node" {
  import type { IncomingMessage, ServerResponse } from 'http';
  export interface VercelRequest extends IncomingMessage {
    body: any;
    query: { [key: string]: string | string[] };
    cookies: { [key: string]: string };
  }
  export interface VercelResponse extends ServerResponse {
    send: (body: any) => VercelResponse;
    json: (body: any) => VercelResponse;
    status: (code: number) => VercelResponse;
    redirect: (url: string) => VercelResponse;
  }
}
