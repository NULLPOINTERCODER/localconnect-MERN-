// utils/notification.js – Simple Server‑Sent Events manager
// Maintains list of client responses to push notifications
let clients = [];

function addClient(req, res) {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n'); // initial newline to establish stream
  const clientId = Date.now();
  const client = { id: clientId, req, res };
  clients.push(client);
  // Remove client when connection closes
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
  return clientId;
}

function broadcast(event, data) {
  const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(c => c.res.write(payload));
}

module.exports = { addClient, broadcast };
