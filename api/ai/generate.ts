import type { IncomingMessage, ServerResponse } from 'http';
import { handleAiGenerate, getAllowedOrigin } from '../../src/server/geminiApiHandler';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const allowedOrigin = getAllowedOrigin(req);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Vary': 'Origin',
    });
    res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  await handleAiGenerate(req, res);
}
