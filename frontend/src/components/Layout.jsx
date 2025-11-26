import { useNavigate, useLocation } from 'react-router-dom';

function Layout({ user, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isManager = user?.role === 'manager';

  const managerMenuItems = [
    { path: '/manager/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/manager/products', label: '📦 Products', icon: '📦' },
    { path: '/manager/sales', label: '💰 Sales', icon: '💰' },
    { path: '/manager/reports', label: '📈 Reports', icon: '📈' }
  ];

  const cashierMenuItems = [
    { path: '/cashier/pos', label: '🛒 Point of Sale', icon: '🛒' },
    { path: '/cashier/history', label: '📋 My History', icon: '📋' }
  ];

  const menuItems = isManager ? managerMenuItems : cashierMenuItems;

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Inventory System</h2>
          <p>{user?.fullName}</p>
          <p style={{ fontSize: '11px', marginTop: '4px', textTransform: 'uppercase', color: '#95a5a6' }}>
            {user?.role}
          </p>
        </div>

        <div className="nav-menu">
          {menuItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              <span>{item.label.replace(item.icon + ' ', '')}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

export default Layout;