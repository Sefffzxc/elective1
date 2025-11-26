import { useState, useEffect } from 'react';
import { getSales } from '../../services/api';

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await getSales({ limit: 100 });
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

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Sales History</h1>
        <p>View all sales transactions</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Recent Sales</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Cashier</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{new Date(sale.created_at).toLocaleString()}</td>
                <td>{sale.cashier_name}</td>
                <td>
                  {sale.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </td>
                <td>₱{sale.total.toFixed(2)}</td>
                <td style={{ textTransform: 'capitalize' }}>{sale.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sales;