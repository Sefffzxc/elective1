import { useState, useEffect } from 'react';
import { getMySales } from '../../services/api';

function History() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const ws = new WebSocket("ws://localhost:4001");

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "products_update") {
      loadData(); // Refresh products, low-stock, dashboard numbers
    }

    if (msg.type === "sales_update") {
      loadData(); // Refresh sales data, history, dashboard, charts
    }
  };

  return () => ws.close();
}, []);


  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await getMySales();
      setSales(response.data);
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content">Loading...</div>;
  }

  const todayTotal = sales
    .filter(sale => {
      const saleDate = new Date(sale.created_at).toDateString();
      const today = new Date().toDateString();
      return saleDate === today;
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const todayTransactions = sales.filter(sale => {
    const saleDate = new Date(sale.created_at).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }).length;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>My Sales History</h1>
        <p>Your transaction records</p>
      </div>

      <div className="dashboard-cards" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Today's Sales</h3>
          <div className="stat-value">₱{todayTotal.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <h3>Today's Transactions</h3>
          <div className="stat-value">{todayTransactions}</div>
        </div>

        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{sales.length}</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Recent Transactions</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{new Date(sale.created_at).toLocaleString()}</td>
                <td>{sale.customer_name || 'N/A'}</td>
                <td>
                  {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                </td>
                <td style={{ textTransform: 'capitalize' }}>{sale.payment_method}</td>
                <td>₱{sale.total.toFixed(2)}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  No sales yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;