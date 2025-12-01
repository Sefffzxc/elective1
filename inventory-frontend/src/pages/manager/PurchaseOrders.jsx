import { useState, useEffect } from 'react';
import { getPurchaseOrders, receivePurchaseOrder } from '../../services/api';

// React Icons
import { 
  FaHourglassHalf, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaBox, 
  FaClipboardList,
  FaCheck 
} from "react-icons/fa";

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getPurchaseOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (order) => {
    if (!confirm(`Mark order ${order.po_number} as received?\n\nThis will:\n- Update status to "received"\n- Add ${order.items[0].quantity} units to ${order.items[0].product_name}\n- Create inventory log`)) {
      return;
    }

    try {
      await receivePurchaseOrder(order.id);
      alert(`Order ${order.po_number} received successfully!\n\nStock has been updated.`);
      loadOrders();
    } catch (error) {
      alert('Failed to receive order');
      console.error('Receive order error:', error);
    }
  };

  if (loading) {
    return <div className="main-content">Loading...</div>;
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const receivedCount = orders.filter(o => o.status === 'received').length;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Purchase Orders</h1>
        <p>Manage inventory restocking orders</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '12px 24px',
            background: filter === 'all' ? '#3498db' : 'transparent',
            color: filter === 'all' ? 'white' : '#7f8c8d',
            border: 'none',
            borderBottom: filter === 'all' ? '3px solid #3498db' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '12px 24px',
            background: filter === 'pending' ? '#f39c12' : 'transparent',
            color: filter === 'pending' ? 'white' : '#7f8c8d',
            border: 'none',
            borderBottom: filter === 'pending' ? '3px solid #f39c12' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          <FaHourglassHalf style={{ marginRight: "6px" }} /> Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('received')}
          style={{
            padding: '12px 24px',
            background: filter === 'received' ? '#27ae60' : 'transparent',
            color: filter === 'received' ? 'white' : '#7f8c8d',
            border: 'none',
            borderBottom: filter === 'received' ? '3px solid #27ae60' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          <FaCheckCircle style={{ marginRight: "6px" }} /> Received ({receivedCount})
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Purchase Orders</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: '600', color: '#3498db' }}>
                  {order.po_number}
                </td>
                <td>{order.supplier_name}</td>
                <td>
                  {order.items.map(item => (
                    <div key={item.product_id}>
                      {item.product_name}
                      <br />
                      <small style={{ color: '#7f8c8d' }}>{item.category}</small>
                    </div>
                  ))}
                </td>
                <td style={{ fontWeight: '600' }}>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                </td>
                <td style={{ fontWeight: '600', color: '#27ae60' }}>
                  ₱{order.total_amount.toFixed(2)}
                </td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>
                  {new Date(order.expected_delivery).toLocaleDateString()}
                  {order.status === 'pending' && new Date(order.expected_delivery) < new Date() && (
                    <div style={{ color: '#e74c3c', fontSize: '11px', marginTop: '3px' }}>
                      <FaExclamationTriangle style={{ marginRight: "4px" }} /> Overdue
                    </div>
                  )}
                </td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: order.status === 'pending' ? '#fef3e5' : '#e8f5e9',
                    color: order.status === 'pending' ? '#f39c12' : '#27ae60',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {order.status === 'pending' ? (
                      <>
                        <FaHourglassHalf /> Pending
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Received
                      </>
                    )}
                  </span>
                </td>
                <td>
                  {order.status === 'pending' ? (
                    <button
                      className="btn btn-success"
                      onClick={() => handleReceive(order)}
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FaBox /> Mark as Received
                    </button>
                  ) : (
                    <span style={{ color: '#27ae60', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaCheck /> Completed on {new Date(order.received_date).toLocaleDateString()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {filter === 'all' && (<><FaClipboardList /> No purchase orders yet</>)}
                  {filter === 'pending' && (<><FaHourglassHalf /> No pending orders</>)}
                  {filter === 'received' && (<><FaBox /> No received orders</>)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards" style={{ marginTop: '30px' }}>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <div className="stat-value" style={{ color: '#f39c12' }}>{pendingCount}</div>
        </div>
        <div className="stat-card">
          <h3>Received Orders</h3>
          <div className="stat-value" style={{ color: '#27ae60' }}>{receivedCount}</div>
        </div>
        <div className="stat-card">
          <h3>Total Value</h3>
          <div className="stat-value" style={{ fontSize: '24px' }}>
            ₱{orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrders;
