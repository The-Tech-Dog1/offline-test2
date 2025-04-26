// Service Worker script (e.g., sw.js)

// Function to establish and maintain WebSocket connection
let ws;
function connectWebSocket() {
  ws = new WebSocket('ws://132.145.65.212:8080');
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed, attempting to reconnect...');
    setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Initialize WebSocket connection when Service Worker starts
connectWebSocket();

// Handle fetch events
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if the request is for our proxy endpoint
  if (url.pathname.startsWith('/proxy/132.145.65.212')) {
    event.respondWith(handleRequest(event.request));
  }
  // Otherwise, let the request proceed normally
});

// Handle the intercepted request
async function handleRequest(request) {
  try {
    // Wait for WebSocket to be open
    if (ws.readyState !== WebSocket.OPEN) {
      await new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100); // Check every 100ms
      });
    }

    // Parse the request URL
    const url = new URL(request.url);
    const path = url.pathname.slice('/proxy/132.145.65.212'.length) || '/';
    const fullPath = path + url.search;

    // Construct the raw HTTP request string
    let httpRequest = `${request.method} ${fullPath} HTTP/1.1\r\n`;
    httpRequest += `Host: 132.145.65.212\r\n`;
    for (const [key, value] of request.headers.entries()) {
      httpRequest += `${key}: ${value}\r\n`;
    }
    httpRequest += '\r\n';

    // Append the body if it exists (e.g., for POST or PUT requests)
    let bodyBuffer = new ArrayBuffer(0);
    if (request.method === 'POST' || request.method === 'PUT') {
      bodyBuffer = await request.arrayBuffer();
    }

    // Combine headers and body into a single binary message
    const headersBuffer = new TextEncoder().encode(httpRequest);
    const fullRequest = new Uint8Array(headersBuffer.byteLength + bodyBuffer.byteLength);
    fullRequest.set(headersBuffer, 0);
    if (bodyBuffer.byteLength > 0) {
      fullRequest.set(new Uint8Array(bodyBuffer), headersBuffer.byteLength);
    }

    // Send the request over WebSocket as a binary message
    ws.send(fullRequest);

    // Wait for the server's response
    return new Promise((resolve, reject) => {
      ws.onmessage = (message) => {
        const responseBuffer = message.data; // Expecting binary response
        const responseText = new TextDecoder().decode(responseBuffer);
        
        // Parse the HTTP response
        const [headerSection, ...bodyParts] = responseText.split('\r\n\r\n');
        const headerLines = headerSection.split('\r\n');
        const statusLine = headerLines[0];
        const status = parseInt(statusLine.split(' ')[1], 10);
        const headers = {};
        for (let i = 1; i < headerLines.length; i++) {
          const [key, value] = headerLines[i].split(': ');
          headers[key] = value;
        }
        const body = bodyParts.join('\r\n\r\n');

        // Create and return the Response object
        resolve(new Response(body, { status, headers }));
      };

      ws.onerror = () => {
        reject(new Response('WebSocket error occurred', { status: 500 }));
      };
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

// Handle Service Worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Take control immediately
});