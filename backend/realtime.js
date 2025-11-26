import r from './config/database.js';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 4001 });
console.log('🔌 WebSocket server started on port 4001');

wss.on('connection', () => {
  console.log('🔌 WebSocket client connected');
});

async function startPolling() {
  try {
    const conn = await r.getPoolMaster().getConnection();
    console.log("📡 Polling connected to RethinkDB");

    let lastProducts = [];
    let lastSales = [];

    setInterval(async () => {
      // --------- PRODUCTS POLLING ---------
      const products = await r.table('products').run(conn);
      if (JSON.stringify(products) !== JSON.stringify(lastProducts)) {
        lastProducts = products;

        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "products_update",
              data: products
            }));
          }
        });
      }

      // --------- SALES POLLING ---------
      const sales = await r.table('sales').run(conn);
      if (JSON.stringify(sales) !== JSON.stringify(lastSales)) {
        lastSales = sales;

        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "sales_update",
              data: sales
            }));
          }
        });
      }

    }, 3000); // 3000 ms = 3 seconds

  } catch (error) {
    console.error("Polling feed error:", error);
  }
}

startPolling();
