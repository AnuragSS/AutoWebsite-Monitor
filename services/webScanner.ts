import { ScanMetrics } from '../types';

export const scanWebsite = async (rawUrl: string): Promise<ScanMetrics> => {
  // 1. Normalize URL: Remove whitespace and add https:// if protocol is missing
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  const startTime = performance.now();
  const controller = new AbortController();
  
  // 2. Safety Timeout: Abort fetch after 4 seconds to prevent hanging
  const id = setTimeout(() => controller.abort(), 4000); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors', // We attempt CORS. Most big sites block this, which is expected.
      signal: controller.signal,
    });
    
    const endTime = performance.now();
    const text = await response.text();
    
    // Extract headers
    const headers: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headers[key] = val;
    });

    // Extract HTML snippet (Head + start of Body)
    const headMatch = text.match(/<head>([\s\S]*?)<\/head>/i);
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    
    let snippet = "";
    if (headMatch) snippet += headMatch[0];
    if (bodyMatch) snippet += bodyMatch[1].substring(0, 1500); 
    if (!snippet) snippet = text.substring(0, 2000); // Fallback if structure is weird

    return {
      url,
      statusCode: response.status,
      responseTimeMs: Math.round(endTime - startTime),
      headers,
      htmlSnippet: snippet
    };

  } catch (error: any) {
    // 3. Graceful Error Handling: Return partial data so AI can still work on the URL/Logs
    const isAbort = error.name === 'AbortError';
    return {
      url,
      statusCode: null,
      responseTimeMs: null,
      headers: {},
      htmlSnippet: null,
      fetchError: isAbort ? 'Connection Timeout' : (error.message || 'Network/CORS Error')
    };
  } finally {
    // 4. Cleanup: Ensure timeout is cleared to prevent memory leaks or late aborts
    clearTimeout(id);
  }
};