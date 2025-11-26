import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiBarChart2,
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
  FiClipboard
} from "react-icons/fi";

function Layout({ user, children, setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ token: null, user: null });
    navigate('/', { replace: true });
  };

  const isManager = user?.role === 'manager';

  const managerMenuItems = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: <FiBarChart2 size={20} /> },
    { path: '/manager/products', label: 'Products', icon: <FiBox size={20} /> },
    { path: '/manager/sales', label: 'Sales', icon: <FiDollarSign size={20} /> },
    { path: '/manager/reports', label: 'Reports', icon: <FiTrendingUp size={20} /> }
  ];

  const cashierMenuItems = [
    { path: '/cashier/pos', label: 'Point of Sale', icon: <FiShoppingCart size={20} /> },
    { path: '/cashier/history', label: 'My History', icon: <FiClipboard size={20} /> }
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
              <span>{item.label}</span>
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