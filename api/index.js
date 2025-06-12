// This is our serverless function, our "receptionist".
// It runs on Vercel's servers.

export default async function handler(req, res) {
  // We only care about POST requests, which Farcaster sends.
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Get the Vercel URL, which will be our base URL.
    // Use localhost for local testing.
    const host = process.env.VERCEL_URL || 'http://localhost:3000';
    const body = req.body;

    // The Farcaster client sends a JSON payload.
    // The button clicked is in `untrustedData.buttonIndex`.
    const buttonIndex = body.untrustedData.buttonIndex;

    let currentPage = 1;
    // When button 1 ("Back") is clicked, we go back.
    // When button 2 ("Next") is clicked, we go forward.
    if (buttonIndex === 1) {
        // This logic gets the current page number from the previous frame's URL
        const url = new URL(body.untrustedData.url);
        currentPage = parseInt(url.searchParams.get('page') || '1', 10) - 1;
    } else if (buttonIndex === 2) {
        const url = new URL(body.untrustedData.url);
        currentPage = parseInt(url.searchParams.get('page') || '1', 10) + 1;
    }
    
    // Reset to the start if we go past the end or before the beginning.
    if (currentPage > 7) currentPage = 1;
    if (currentPage < 1) currentPage = 1;

    // Define the content for each page (image and buttons).
    const frameData = {
        1: {
            image: `https://${host}/images/1.png`,
            buttons: [{ label: 'Start Guide' }],
            post_page: 2
        },
        2: {
            image: `https://${host}/images/2.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            post_page: 2 // self-referencing to get next page from here
        },
        3: {
            image: `https://${host}/images/3.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            post_page: 3
        },
        4: {
            image: `https://${host}/images/4.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            post_page: 4
        },
        5: {
            image: `https://${host}/images/5.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            post_page: 5
        },
        6: {
            image: `https://${host}/images/6.png`,
            buttons: [{ label: '⬅️ Back' }, { label: 'Next ➡️' }],
            post_page: 6
        },
        7: {
            image: `https://v2.farcaster.frames.js.org/api/end-card?message=You%27ve+reached+the+end.+Jazakallahu+Khairan`, // A nice end card
            buttons: [{ label: 'Restart Guide' }],
            post_page: 1
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
        <meta property="fc:frame:post_url" content="https://${host}/api?page=${currentPage}">
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