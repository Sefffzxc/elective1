import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getLowStock, getPurchaseOrders, getSales, getSuppliers } from '../../services/api';
import {
  FaUserCircle,
  FaExclamationTriangle,
  FaBox,
  FaClipboardList,
  FaChartBar,
  FaChartLine,
  FaBolt,
  FaTruckLoading,
  FaStore,
  FaTimesCircle,
  FaEnvelope,
  FaPhone,
  FaSyncAlt,
  FaHourglassHalf,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, lowStockRes, ordersRes, salesRes, suppliersRes] = await Promise.all([
        getDashboard(),
        getLowStock(10),
        getPurchaseOrders({ status: 'pending' }),
        getSales({ limit: 5 }),
        getSuppliers()
      ]);

      setStats(dashboardRes.data);
      setLowStockProducts(lowStockRes.data);
      setPendingOrders(ordersRes.data);
      setRecentSales(salesRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      alert('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content">Loading dashboard...</div>;
  }

  const criticalStock = lowStockProducts.filter(p => p.stock <= 5).length;
  const lowStock = lowStockProducts.filter(p => p.stock > 5 && p.stock <= 10).length;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1><FaUserCircle style={{ marginRight: "8px" }} /> Welcome Back, Manager!</h1>
        <p style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {(criticalStock > 0 || pendingOrders.length > 0) && (
        <div style={{ marginBottom: '30px' }}>
          {criticalStock > 0 && (
            <div style={{
              padding: '15px 20px',
              background: '#fee',
              border: '2px solid #e74c3c',
              borderRadius: '8px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong><FaExclamationTriangle style={{ marginRight: "6px" }} /> Critical Stock Alert!</strong>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>
                  {criticalStock} product{criticalStock > 1 ? 's' : ''} critically low (≤5 units)
                </p>
              </div>
              <button 
                className="btn btn-danger"
                onClick={() => navigate('/manager/reports')}
              >
                View & Reorder
              </button>
            </div>
          )}

          {pendingOrders.length > 0 && (
            <div style={{
              padding: '15px 20px',
              background: '#fef3e5',
              border: '2px solid #f39c12',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong><FaBox style={{ marginRight: "6px" }} /> Pending Orders</strong>
                <p style={{ margin: '5px 0 0 0', color: '#555' }}>
                  {pendingOrders.length} purchase order{pendingOrders.length > 1 ? 's' : ''} awaiting delivery
                </p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/manager/purchase-orders')}
              >
                Manage Orders
              </button>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-cards">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/manager/sales')}>
          <h3>Today's Revenue</h3>
          <div className="stat-value" style={{ color: '#27ae60' }}>
            ₱{stats?.totalSalesToday?.toFixed(2) || '0.00'}
          </div>
          <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
            {stats?.transactionsToday || 0} transactions
          </small>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/manager/products')}>
          <h3>Total Products</h3>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
            In inventory
          </small>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/manager/reports')}>
          <h3>Stock Alerts</h3>
          <div className="stat-value" style={{ color: criticalStock > 0 ? '#e74c3c' : '#f39c12' }}>
            {stats?.lowStockCount || 0}
          </div>
          <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
            {criticalStock} critical, {lowStock} low
          </small>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/manager/analytics')}>
          <h3>Total Revenue</h3>
          <div className="stat-value" style={{ fontSize: '24px' }}>
            ₱{stats?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
          <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
            All-time sales
          </small>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }}>
          <h3>Active Suppliers</h3>
          <div className="stat-value" style={{ color: '#3498db' }}>
            {suppliers.length}
          </div>
          <small style={{ color: '#7f8c8d', fontSize: '12px' }}>
            Registered vendors
          </small>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2><FaBolt style={{ marginRight: "6px" }} /> Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/manager/products')}
            style={{ padding: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
          <FaBox /> Add Product
          </button>
          <button
            className="btn btn-success"
            onClick={() => navigate('/manager/purchase-orders')}
            style={{ padding: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
          <FaClipboardList /> View Orders
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/manager/analytics')}
            style={{ padding: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
          <FaChartBar /> Analytics
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/manager/reports')}
            style={{ padding: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
          <FaChartLine /> Reports
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="table-container">
          <div className="table-header">
            <h2><FaChartBar style={{ marginRight: "6px" }} /> Recent Sales</h2>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/manager/sales')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              View All
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Cashier</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.slice(0, 5).map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.created_at).toLocaleTimeString()}</td>
                  <td>{sale.cashier_name}</td>
                  <td style={{ fontWeight: '600', color: '#27ae60' }}>
                    ₱{sale.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    No sales yet today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2><FaExclamationTriangle style={{ marginRight: "6px" }} /> Low Stock Items</h2>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/manager/reports')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              View All
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.slice(0, 5).map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td style={{ 
                    fontWeight: '600', 
                    color: product.stock <= 5 ? '#e74c3c' : '#f39c12' 
                  }}>
                    {product.stock}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: product.stock <= 5 ? '#fee' : '#fef3e5',
                      color: product.stock <= 5 ? '#c33' : '#d68910'
                    }}>
                      {product.stock <= 5 ? (
                        <>
                          <FaTimesCircle style={{ marginRight: 4 }} /> Critical
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle style={{ marginRight: 4 }} /> Low
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStockProducts.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#27ae60' }}>
                    ✅ All stock levels healthy!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container" style={{ marginBottom: '30px' }}>
        <div className="table-header">
          <h2><FaStore style={{ marginRight: "6px" }} /> Our Suppliers</h2>
          <span style={{ fontSize: '13px', color: '#7f8c8d' }}>
            {suppliers.length} active supplier{suppliers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact Person</th>
              <th>Categories</th>
              <th>Payment Terms</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td style={{ fontWeight: '600' }}>{supplier.supplier_name}</td>
                <td>{supplier.contact_person}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {supplier.categories.slice(0, 3).map((cat, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '2px 8px',
                          background: '#e8f5e9',
                          color: '#27ae60',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    {supplier.categories.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#7f8c8d' }}>
                        +{supplier.categories.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {supplier.payment_terms}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                  <FaEnvelope /> {supplier.email}
                  <br />
                  <FaPhone /> {supplier.phone}
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No suppliers registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: '15px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong><FaTruckLoading style={{ marginRight: 6 }} /> System Status: All Systems Operational</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
            Last updated: {new Date().toLocaleTimeString()} | Auto-refresh: 30s
          </p>
        </div>
      <button
        onClick={loadData}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? '#bdc3c7' : 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? (
          <>
            <FaHourglassHalf style={{ marginRight: 6 }} /> Refreshing...
          </>
        ) : (
          <>
            <FaSyncAlt style={{ marginRight: 6 }} /> Refresh Now
          </>
        )}
      </button>
      </div>
    </div>
  );
}

export default Dashboard;