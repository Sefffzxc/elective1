import { useState, useEffect } from 'react';
import { getSalesByCategory, getLowStock } from '../../services/api';

function Reports() {
  const [categorySales, setCategorySales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [categoryRes, lowStockRes] = await Promise.all([
        getSalesByCategory(),
        getLowStock(20)
      ]);

      setCategorySales(categoryRes.data);
      setLowStockProducts(lowStockRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
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
        <h1>Reports</h1>
        <p>Detailed insights and analytics</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Sales by Category</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Items Sold</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {categorySales.map((category, index) => (
              <tr key={index}>
                <td>{category.category}</td>
                <td>{category.total_items}</td>
                <td>₱{category.total_sales.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Low Stock Alert</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td style={{ color: product.stock < 10 ? '#e74c3c' : '#f39c12' }}>
                  {product.stock}
                </td>
                <td>₱{product.price.toFixed(2)}</td>
                <td>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px',
                    backgroundColor: product.stock < 10 ? '#fee' : '#fef3e5',
                    color: product.stock < 10 ? '#c33' : '#d68910',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {product.stock < 10 ? 'Critical' : 'Low'}
                  </span>
                </td>
              </tr>
            ))}
            {lowStockProducts.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  No low stock products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;