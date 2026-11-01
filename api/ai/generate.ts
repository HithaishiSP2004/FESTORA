import type { IncomingMessage, ServerResponse } from 'http';
import { handleAiGenerate } from '../../src/server/geminiApiHandler';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }
  await handleAiGenerate(req, res);
}
