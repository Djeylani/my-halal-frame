export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const host = process.env.VERCEL_URL || req.headers.host || 'localhost:3000';
    const protocol = process.env.VERCEL_URL ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const body = req.body;

    // Validate untrustedData
    if (!body.untrustedData || typeof body.untrustedData.buttonIndex !== 'number') {
      throw new Error('Invalid or missing buttonIndex');
    }
    const buttonIndex = body.untrustedData.buttonIndex;

    // Parse previous page from URL
    let prevPage = 1;
    try {
      const url = new URL(body.untrustedData.url);
      prevPage = parseInt(url.searchParams.get('page') || '1', 10);
      if (isNaN(prevPage)) throw new Error('Invalid page parameter');
    } catch {
      throw new Error('Invalid URL in untrustedData');
    }

    const frameData = {
      1: {
        image: `https://imgur.com/a/65BDz5Z`,
        buttons: [{ label: 'Start Guide ➡️', action: 'post' }],
        page: 1
      },
      2: {
        image: `${baseUrl}/images/2.png`,
        buttons: [{ label: '⬅️ Back', action: 'post' }, { label: 'Next ➡️', action: 'post' }],
        page: 2
      },
      3: {
        image: `${baseUrl}/images/3.png`,
        buttons: [{ label: '⬅️ Back', action: 'post' }, { label: 'Next ➡️', action: 'post' }],
        page: 3
      },
      4: {
        image: `${baseUrl}/images/4.png`,
        buttons: [{ label: '⬅️ Back', action: 'post' }, { label: 'Next ➡️', action: 'post' }],
        page: 4
      },
      5: {
        image: `${baseUrl}/images/5.png`,
        buttons: [{ label: '⬅️ Back', action: 'post' }, { label: 'Next ➡️', action: 'post' }],
        page: 5
      },
      6: {
        image: `${baseUrl}/images/6.png`,
        buttons: [{ label: '⬅️ Back', action: 'post' }, { label: 'Next ➡️', action: 'post' }],
        page: 6
      },
      7: {
        image: `${baseUrl}/images/7.png`,
        buttons: [{ label: 'Restart Guide', action: 'post' }],
        page: 7
      }
    };

    const totalPages = Object.keys(frameData).length;
    if (buttonIndex < 1 || buttonIndex > frameData[prevPage]?.buttons.length) {
      throw new Error('Invalid buttonIndex for current frame');
    }

    let currentPage;
    if (prevPage === totalPages && buttonIndex === 1) {
      currentPage = 1; // Restart
    } else if (buttonIndex === 1 && prevPage > 1) {
      currentPage = prevPage - 1; // Back
    } else {
      currentPage = prevPage + 1; // Next
    }
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const currentFrame = frameData[currentPage] || frameData[1];
    console.log(`Processing Frame: page=${prevPage}, buttonIndex=${buttonIndex}, currentPage=${currentPage}`);

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Halal Farcaster Mini-App Market</title>
        <meta property="og:title" content="Halal Farcaster Mini-App Market">
        <meta property="og:image" content="${currentFrame.image}">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${currentFrame.image}">
        <meta property="fc:frame:post_url" content="${baseUrl}/api?page=${currentFrame.page}">
    `;

    currentFrame.buttons.forEach((button, index) => {
      html += `<meta property="fc:frame:button:${index + 1}" content="${button.label}">`;
      html += `<meta property="fc:frame:button:${index + 1}:action" content="${button.action || 'post'}">`;
    });

    html += `</head><body><p>You can view the full infographic <a href="${baseUrl}/infographic.html">here</a>.</p></body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error:', error.message);
    const host = process.env.VERCEL_URL || req.headers.host || 'localhost:3000';
    const protocol = process.env.VERCEL_URL ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Halal Farcaster Mini-App Market</title>
        <meta property="og:title" content="Halal Farcaster Mini-App Market">
        <meta property="og:image" content="${baseUrl}/images/error.png">
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${baseUrl}/images/error.png">
        <meta property="fc:frame:button:1" content="Restart Guide">
        <meta property="fc:frame:button:1:action" content="post">
        <meta property="fc:frame:post_url" content="${baseUrl}/api?page=1">
      </head>
      <body><p>An error occurred. <a href="${baseUrl}/infographic.html">View the full infographic</a>.</p></body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
}
