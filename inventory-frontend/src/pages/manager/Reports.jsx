import { useState, useEffect } from 'react';
import { getSalesByCategory, getLowStock, getSuppliersByCategory, createPurchaseOrder } from '../../services/api';
import { 
  FaCircle, 
  FaExclamationTriangle, 
  FaBox,
  FaInfoCircle,
  FaCheckCircle
} from "react-icons/fa";

function Reports() {
  const [categorySales, setCategorySales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reorderQuantity, setReorderQuantity] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [categoryRes, lowStockRes] = await Promise.all([
        getSalesByCategory(),
        getLowStock(10)
      ]);

      setCategorySales(categoryRes.data);
      setLowStockProducts(lowStockRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (product) => {
    setSelectedProduct(product);
    const suggestedQty = product.stock <= 5 ? 100 : 50;
    setReorderQuantity(suggestedQty.toString());
    
    // Load suppliers for this product category
    try {
      const response = await getSuppliersByCategory(product.category);
      setSuppliers(response.data);
      if (response.data.length > 0) {
        setSelectedSupplier(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setSuppliers([]);
    }
    
    setShowReorderModal(true);
  };

  const handleReorderSubmit = async (e) => {
    e.preventDefault();

    if (!reorderQuantity || parseInt(reorderQuantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }

    try {
      await createPurchaseOrder({
        supplier_id: selectedSupplier,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        category: selectedProduct.category,
        quantity: parseInt(reorderQuantity),
        unit_price: selectedProduct.price
      });

      const supplierName = suppliers.find(s => s.id === selectedSupplier)?.supplier_name || 'Selected supplier';
      
      alert(`Purchase Order created successfully!\n\nProduct: ${selectedProduct.name}\nQuantity: ${reorderQuantity} units\nSupplier: ${supplierName}\n\nThe stock will be updated when the order is received.`);
      
      setShowReorderModal(false);
      setSelectedProduct(null);
      setReorderQuantity('');
      setSelectedSupplier('');
      setSuppliers([]);
      
      loadReports();
    } catch (error) {
      alert('Failed to create purchase order');
      console.error('Purchase order error:', error);
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
          <p style={{ fontSize: '13px', color: '#7f8c8d' }}>
            {lowStockProducts.filter(p => p.stock <= 5).length} Critical | {lowStockProducts.filter(p => p.stock > 5).length} Low
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td style={{ color: product.stock <= 5 ? '#e74c3c' : '#f39c12', fontWeight: '600' }}>
                  {product.stock}
                </td>
                <td>₱{product.price.toFixed(2)}</td>
                <td>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px',
                    backgroundColor: product.stock <= 5 ? '#fee' : '#fef3e5',
                    color: product.stock <= 5 ? '#c33' : '#d68910',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {product.stock <= 5 ? (
                      <>
                        <FaCircle style={{ marginRight: "6px", color: "#e74c3c" }} />
                        Critical
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle style={{ marginRight: "6px", color: "#d68910" }} />
                        Low
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleReorder(product)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <FaBox style={{ marginRight: "6px" }} /> Reorder
                  </button>
                </td>
              </tr>
            ))}
            {lowStockProducts.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <FaCheckCircle style={{ marginRight: "8px", color: "#2ecc71" }} />
                  All products have sufficient stock
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showReorderModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowReorderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2><FaBox style={{ marginRight: "8px" }} /> Reorder Product</h2>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: selectedProduct.stock <= 5 ? '2px solid #e74c3c' : '2px solid #f39c12'
            }}>
              <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>{selectedProduct.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div>
                  <strong>Category:</strong> {selectedProduct.category}
                </div>
                <div>
                  <strong>Price:</strong> ₱{selectedProduct.price.toFixed(2)}
                </div>
                <div style={{ color: selectedProduct.stock <= 5 ? '#e74c3c' : '#f39c12' }}>
                  <strong>Current Stock:</strong> {selectedProduct.stock} units
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  {selectedProduct.stock <= 5 ? (
                    <>
                      <FaCircle style={{ marginRight: "6px", color: "#e74c3c" }} />
                      Critical
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle style={{ marginRight: "6px", color: "#d68910" }} />
                      Low
                    </>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleReorderSubmit}>
              <div className="form-group">
                <label>Select Supplier *</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    border: '2px solid #e0e0e0',
                    fontSize: '14px',
                    marginBottom: '15px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name} - {supplier.payment_terms}
                    </option>
                  ))}
                </select>
                {suppliers.length === 0 && (
                  <small style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>
                    ⚠️ No suppliers found for this category
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Reorder Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(e.target.value)}
                  required
                  placeholder="Enter quantity to order"
                  style={{ fontSize: '16px' }}
                />
                <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Suggested: {selectedProduct.stock <= 5 ? '100' : '50'} units
                </small>
              </div>

              {reorderQuantity && selectedSupplier && (
                <div style={{ 
                  background: '#e8f5e9', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '15px',
                  border: '1px solid #4caf50'
                }}>
                  <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                    <strong>Purchase Order Summary:</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: '#2c3e50', marginBottom: '3px' }}>
                    Supplier: <strong>{suppliers.find(s => s.id === selectedSupplier)?.supplier_name}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: '#2c3e50' }}>
                    Current Stock: <strong>{selectedProduct.stock}</strong> units
                  </div>
                  <div style={{ fontSize: '13px', color: '#2c3e50' }}>
                    Order Quantity: <strong>+{reorderQuantity}</strong> units
                  </div>
                  <div style={{ fontSize: '14px', color: '#27ae60', marginTop: '5px' }}>
                    Stock After Delivery: <strong>{selectedProduct.stock + parseInt(reorderQuantity || 0)}</strong> units
                  </div>
                  <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '8px', borderTop: '1px solid #c8e6c9', paddingTop: '8px' }}>
                    Order Total: <strong>₱{(selectedProduct.price * parseInt(reorderQuantity || 0)).toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                    Payment Terms: {suppliers.find(s => s.id === selectedSupplier)?.payment_terms}
                  </div>
                </div>
              )}

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowReorderModal(false);
                    setSelectedProduct(null);
                    setReorderQuantity('');
                    setSelectedSupplier('');
                    setSuppliers([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  ✅ Create Purchase Order
                </button>
              </div>
            </form>

            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: '#fff3cd', 
              borderRadius: '6px',
              fontSize: '12px',
              color: '#856404'
            }}>
              <FaInfoCircle style={{ marginRight: "6px" }} />
              A purchase order will be created. Stock will be updated…
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;