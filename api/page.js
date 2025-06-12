export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  // Serve the infographic HTML for the root path
  res.setHeader('Content-Type', 'text/html');
  res.redirect(307, '/infographic.html');
}
