// This is our serverless function, our "receptionist".
// It runs on Vercel's servers.

export default async function handler(req, res) {
  // We only care about POST requests, which Farcaster sends.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    // Get the Vercel URL, which will be our base URL.
    const host = process.env.VERCEL_URL || 'http://localhost:3000';
    const body = req.body;

    // The Farcaster client sends a JSON payload.
    // The button clicked is in `untrustedData.buttonIndex`.
    const buttonIndex = body.untrustedData.buttonIndex;

    // Get the previous page number from the URL in the POST data
    const url = new URL(body.untrustedData.url);
    const prevPage = parseInt(url.searchParams.get('page') || '1', 10);
    
    let currentPage;

    // If the last frame's button was "Restart", go to page 1
    if (prevPage === 7 && buttonIndex === 1) {
        currentPage = 1;
    } else if (buttonIndex === 1) {
        // "Back" button was clicked
        currentPage = prevPage - 1;
    } else {
        // "Next" or "Start" button was clicked
        currentPage = prevPage + 1;
    }

    // Reset to the start if we go past the end or before the beginning.
    if (currentPage > 7) currentPage = 7; // Go to the last frame
    if (currentPage < 1) currentPage = 1; // Stay on the first frame

    // Define the content for each page (image and buttons).
    const frameData = {
        1: {
            image: `https://${host}/images/1.png`,
            buttons: [{ label: 'Start Guide ➡️' }],
            page: 1
        },
        2: {
            image: `https://${host}/images/2.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            page: 2
        },
        3: {
            image: `https://${host}/images/3.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            page: 3
        },
        4: {
            image: `https://${host}/images/4.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            page: 4
        },
        5: {
            image: `https://${host}/images/5.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            page: 5
        },
        6: {
            image: `https://${host}/images/6.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            page: 6
        },
        7: {
            image: `https://${host}/images/7.png`,
            buttons: [{ label: 'Restart Guide' }],
            page: 7
        }
    };
    
    const currentFrame = frameData[currentPage] || frameData[1];
    
    // Now, we construct the HTML response with the correct meta tags.
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Halal Farcaster Mini-App Market</title>
        <meta property="og:title" content="Halal Farcaster Mini-App Market">
        <meta property="og:image" content="${currentFrame.image}">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${currentFrame.image}">
        <meta property="fc:frame:post_url" content="https://${host}/api?page=${currentFrame.page}">
    `;

    currentFrame.buttons.forEach((button, index) => {
        html += `<meta property="fc:frame:button:${index + 1}" content="${button.label}">`;
    });

    html += `</head><body><p>You can view the full infographic <a href="https://${host}/infographic.html">here</a>.</p></body></html>`;

    // Send the HTML back to the Farcaster client.
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}