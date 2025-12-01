import express from 'express';
import r from '../config/database.js'; // ✅ Use your configured instance

const router = express.Router();

// SSE endpoint for product changes
router.get('/products', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // ✅ No need to connect - rethinkdbdash handles connection pooling
    const cursor = await r.table('products').changes().run();

    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    cursor.each((err, change) => {
      if (err) {
        console.error('Changefeed error:', err);
        return;
      }

      res.write(`data: ${JSON.stringify({
        type: 'change',
        change: change
      })}\n\n`);
    });

    req.on('close', () => {
      console.log('Client disconnected from product changefeed');
      cursor.close();
    });

  } catch (error) {
    console.error('Failed to setup changefeed:', error);
    res.status(500).json({ error: 'Failed to setup real-time connection' });
  }
});

export default router;