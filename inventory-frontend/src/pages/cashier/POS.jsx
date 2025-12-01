import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories, createSale } from '../../services/api';
import { useProductChangefeed } from '../../hooks/useProductChangefeed';
import { FiSearch } from "react-icons/fi";

function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setProducts(productsRes.data);
      setCategories(['All', ...categoriesRes.data]);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  // Handle real-time product changes
  const handleProductChange = useCallback((change) => {
    console.log('Product change detected:', change);

    if (change.new_val && !change.old_val) {
      // New product added
      setProducts(prev => [...prev, change.new_val]);
      
      // Update categories if new category
      const newCategory = change.new_val.category;
      setCategories(prev => {
        if (!prev.includes(newCategory) && newCategory) {
          return [...prev, newCategory];
        }
        return prev;
      });
    } else if (change.new_val && change.old_val) {
      // Product updated
      setProducts(prev => 
        prev.map(p => p.id === change.new_val.id ? change.new_val : p)
      );

      // Update cart if the updated product is in cart
      setCart(prevCart => 
        prevCart.map(item => {
          if (item.product_id === change.new_val.id) {
            // Check if quantity exceeds new stock
            const newQuantity = Math.min(item.quantity, change.new_val.stock);
            return {
              ...item,
              name: change.new_val.name,
              price: change.new_val.price,
              quantity: newQuantity,
              subtotal: newQuantity * change.new_val.price
            };
          }
          return item;
        })
      );
    } else if (!change.new_val && change.old_val) {
      // Product deleted
      setProducts(prev => prev.filter(p => p.id !== change.old_val.id));
      
      // Remove from cart if exists
      setCart(prevCart => 
        prevCart.filter(item => item.product_id !== change.old_val.id)
      );
    }
  }, []);

  // Setup changefeed
  useProductChangefeed(handleProductChange);

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Not enough stock!');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      if (product.stock < 1) {
        alert('Product out of stock!');
        return;
      }
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      }]);
    }
  };

  const updateQuantity = (productId, change) => {
    const item = cart.find(i => i.product_id === productId);
    const product = products.find(p => p.id === productId);
    
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
      setCart(cart.filter(i => i.product_id !== productId));
      return;
    }

    if (newQuantity > product.stock) {
      alert('Not enough stock!');
      return;
    }

    setCart(cart.map(i =>
      i.product_id === productId
        ? { ...i, quantity: newQuantity, subtotal: newQuantity * i.price }
        : i
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }

    if (!confirm(`Complete sale for ₱${total.toFixed(2)}?`)) {
      return;
    }

    try {
      await createSale({
        items: cart,
        total: total,
        payment_method: paymentMethod,
        customer_name: customerName.trim()
      });

      alert('Sale completed successfully!');
      setCart([]);
      setCustomerName('');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to complete sale');
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Point of Sale</h1>
        <p>Select products to create a sale</p>
      </div>

      <div className="pos-container">
        <div className="products-panel">

          <div className="product-search">
            <input autoFocus
              type="text"
              placeholder="Search product by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm('');
                  }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  padding: '50px',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '22px',
                  fontWeight: '600'
                }}
              >
                <FiSearch
                  size={40}
                  style={{ marginBottom: '12px', color: '#b0b0b0' }}
                />
                <div>No products found</div>
              </div>
            )}
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToCart(product)}
                style={{ opacity: product.stock < 1 ? 0.5 : 1 }}
              >
                <h4>{product.name}</h4>
                <div className="product-price">₱{product.price.toFixed(2)}</div>
                <div className="product-stock">
                  Stock: {product.stock}
                  {product.stock < 10 && (
                    <span className="stock-badge low">LOW</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-panel">
          <h2 style={{ marginBottom: '20px' }}>Current Sale</h2>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No items in cart
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product_id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>₱{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.product_id, -1)}>
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.product_id, 1)}>
                      +
                    </button>
                    <button className="btn-danger" style={{ marginLeft: '10px', padding: '6px 12px' }} onClick={() => removeFromCart(item.product_id)}>
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #e0e0e0',
                  marginBottom: '15px'
                }}
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #e0e0e0'
                }}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="gcash">GCash</option>
              </select>
            </div>

            <div className="total-row">
              <span>Total:</span>
              <span>₱{total.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Complete Sale
            </button>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => {
                setCart([]);
                setCustomerName('');
              }}
              disabled={cart.length === 0}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POS;