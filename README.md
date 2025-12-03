# Distributed Inventory Management System

A real-time inventory management system with distributed database architecture using RethinkDB cluster across two Windows servers.

## Features

- 🔄 **Distributed Architecture**: Two-server RethinkDB cluster with automatic failover
- 👥 **Role-Based Access**: Manager and Cashier interfaces with different permissions
- 📊 **Real-Time Analytics**: Live dashboard with sales trends and inventory alerts
- 🛒 **Point of Sale (POS)**: Fast cashier interface for transaction processing
- 📈 **Reports & Analytics**: Sales by category, low stock alerts, revenue tracking
- 🔒 **Secure Authentication**: JWT-based auth with bcrypt password hashing

---

## System Requirements

### Hardware (Both PC_A & PC_B)
- **Processor:** Intel Core i3 / AMD Ryzen 3 (minimum)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 50GB free space (SSD recommended)
- **Network:** Gigabit Ethernet, Static IP required
  - PC_A: 192.168.1.100 (Primary Server)
  - PC_B: 192.168.1.101 (Secondary Server)

### Software Requirements
- **OS:** Windows 10/11
- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher
- **RethinkDB:** v2.4.0 or higher

---

## Installation Guide

### Pre-Installation Checklist
- [ ] Both PCs connected to same network
- [ ] Static IPs assigned to both servers
- [ ] Administrator access available
- [ ] Internet connection active
- [ ] Firewall configured to allow required ports

**Network Information:**
- PC_A IP: ________________
- PC_B IP: ________________
- Subnet Mask: ________________
- Gateway: ________________

---

## Step 1: Install Node.js (Both PCs)

1. Download Node.js LTS from [https://nodejs.org/](https://nodejs.org/)
2. Run installer `node-v18.x.x-x64.msi`
3. Accept license agreement
4. Use default installation path: `C:\Program Files\nodejs\`
5. Check "Automatically install necessary tools"
6. Click Install

**Verify Installation:**
```cmd
node --version
npm --version
```

---

## Step 2: Install RethinkDB

### PC_A (Primary Server)

1. Download RethinkDB Windows build from [https://rethinkdb.com/docs/install/windows/](https://rethinkdb.com/docs/install/windows/)
2. Extract `rethinkdb-2.4.x-windows-amd64.zip` to `C:\RethinkDB\`
3. Add RethinkDB to System PATH:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Edit PATH variable, add: `C:\RethinkDB`
   - Click OK

4. Create data directory:
```cmd
mkdir C:\RethinkDB\data
```

5. Start RethinkDB:
```cmd
cd C:\RethinkDB
rethinkdb.exe --bind all --directory data
```

### PC_B (Secondary Server)

1. Repeat steps 1-4 from PC_A setup
2. Start RethinkDB and join PC_A's cluster:
```cmd
cd C:\RethinkDB
rethinkdb.exe --bind all --directory data --join 192.168.1.100:29015
```
*(Replace 192.168.1.100 with PC_A's actual IP address)*

### Verify RethinkDB Cluster

1. Open browser on PC_A: `http://localhost:8080`
2. Click "Servers" tab
3. Should see 2 servers listed:
   - Server 1: PC_A (192.168.1.100)
   - Server 2: PC_B (192.168.1.101)
4. Both servers should show status: **Ready**

Expected: `Cluster: 2 servers connected`

---

## Step 3: Project Setup (Both PCs)

### Create Project Directory
```cmd
mkdir C:\inventory-system
cd C:\inventory-system
```

### Backend Directory Structure
```
C:\inventory-system\inventory-backend\
├── package.json
├── .env
├── server.js
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── sales.js
│   ├── reports.js
│   ├── suppliers.js
│   └── purchaseOrders.js
└── scripts/
    ├── initDatabase.js
    └── fixSalesData.js
```

### Frontend Directory Structure
```
C:\inventory-system\inventory-frontend\
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── services/
    │   └── api.js
    └── pages/
        ├── Login.jsx
        ├── manager/
        │   ├── Dashboard.jsx
        │   ├── Products.jsx
        │   ├── Sales.jsx
        │   └── Reports.jsx
        └── cashier/
            ├── POS.jsx
            └── History.jsx
```

---

## Step 4: Backend Configuration (Both PCs)

### Create `.env` File

Create `C:\inventory-system\inventory-backend\.env`:

```env
PORT=5000
JWT_SECRET=YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION_12345
NODE_ENV=production

# RethinkDB Configuration
RETHINKDB_HOST_A=192.168.1.100
RETHINKDB_HOST_B=192.168.1.101
RETHINKDB_PORT=28015
RETHINKDB_DB=ordering_system
```

⚠️ **CRITICAL:** Change `JWT_SECRET` to a strong, random string in production!

### Install Backend Dependencies
```cmd
cd C:\inventory-system\inventory-backend
npm install
```

**Expected Output:** `added 250 packages in 45s`

**Verify Installation:**
```cmd
npm list
```
Should show all packages installed without errors.

---

## Step 5: Frontend Configuration

### Configure API Connection

Edit `src/services/api.js`:

```javascript
// Multiple backend servers for failover
const API_SERVERS = [
  'http://192.168.1.100:5000/api',  // PC_A
  'http://192.168.1.101:5000/api'   // PC_B
];
```
*(Replace with your actual server IP addresses)*

### Install Frontend Dependencies
```cmd
cd C:\inventory-system\inventory-frontend
npm install
```

**Expected Output:** `added 180 packages in 35s`

---

## Step 6: Database Initialization

⚠️ **Run this ONCE from PC_A only:**

```cmd
cd C:\inventory-system\inventory-backend
npm run init-db
```

**Expected Output:**
```
Starting database initialization...
Database created: ordering_system
Table created: managers
Table created: cashiers
Table created: suppliers
Table created: products (shards: 2, replicas: 2)
Table created: sales (shards: 2, replicas: 2)
Table created: purchase_orders
Table created: inventory_logs (shards: 2, replicas: 2)
Table created: analytics

Default Login Credentials:

Managers:
- username: manager, password: password123
- username: manager2, password: password123

Cashiers:
- username: cashier1, password: password123
- username: cashier2, password: password123
- username: cashier3, password: password123

Suppliers: 5 suppliers created
Sample products: 60+ products created
```

### Verify Database in RethinkDB Admin

1. Open browser: `http://192.168.1.100:8080`
2. Click "Tables" tab
3. Verify all tables exist with proper sharding:
   - `products` → 2 shards, 2 replicas
   - `sales` → 2 shards, 2 replicas
   - `inventory_logs` → 2 shards, 2 replicas
4. Click "Data Explorer"
5. Run query: `r.table('products').count()` → Should return 60+

---

## Step 7: Firewall Configuration (Both PCs)

**Run Command Prompt as Administrator:**

```cmd
netsh advfirewall firewall add rule name="RethinkDB Client" dir=in action=allow protocol=TCP localport=28015
netsh advfirewall firewall add rule name="RethinkDB Cluster" dir=in action=allow protocol=TCP localport=29015
netsh advfirewall firewall add rule name="RethinkDB Admin" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Backend API" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="Frontend" dir=in action=allow protocol=TCP localport=3000
```

### Test Network Connectivity

From PC_A:
```cmd
ping 192.168.1.101
telnet 192.168.1.101 28015
```

From PC_B:
```cmd
ping 192.168.1.100
telnet 192.168.1.100 28015
```

All tests should succeed.

---

## Step 8: Start Services

### Start Backend on PC_A
```cmd
cd C:\inventory-system\inventory-backend
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║   Distributed Inventory System Backend                ║
║   Server running on port 5000                         ║
║   Environment: production                             ║
║                                                        ║
║   RethinkDB Cluster Status: Connected                 ║
╚════════════════════════════════════════════════════════╝
```

### Start Backend on PC_B
```cmd
cd C:\inventory-system\inventory-backend
npm start
```
Same expected output as PC_A.

### Test Backend Health
```cmd
curl http://192.168.1.100:5000/api/health
curl http://192.168.1.101:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

### Start Frontend (PC_A or any client machine)
```cmd
cd C:\inventory-system\inventory-frontend
npm run dev
```

**Expected Output:**
```
VITE v5.0.8 ready in 1200ms

➜ Local:   http://localhost:3000/
➜ Network: http://192.168.1.100:3000/
```

---

## Available Scripts

### Backend Scripts

#### `npm start`
Starts the backend server in production mode on port 5000.

#### `npm run dev`
Starts the backend in development mode with auto-reload on file changes.

#### `npm run init-db`
Initializes the database with default tables, users, and sample data. **Run once only from PC_A.**

### Frontend Scripts

#### `npm run dev`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. Any lint errors will appear in the console.

#### `npm run build`
Builds the app for production to the `dist` folder. The build is minified and optimized for best performance.

```cmd
cd C:\inventory-system\inventory-frontend
npm run build
```

**Expected Output:**
```
vite v5.0.8 building for production...
✓ 1250 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-a3b2c1d4.css   25.30 kB
dist/assets/index-b4c3d2e1.js   180.25 kB

✓ built in 8.50s
```

#### `npm run preview`
Locally preview the production build.

---

## Testing & Verification

### Test 1: Authentication

**Manager Login:**
1. Open browser: `http://localhost:3000`
2. Enter credentials:
   - Username: `manager`
   - Password: `password123`
3. Should redirect to Manager Dashboard

**Cashier Login:**
1. Enter credentials:
   - Username: `cashier1`
   - Password: `password123`
2. Should redirect to POS System

### Test 2: Product Management (Manager)

1. Login as manager
2. Navigate to Products page
3. Click "Add Product"
4. Fill in details:
   - Name: Test Product
   - Category: Test Category
   - Price: 100
   - Stock: 50
5. Click "Add"
6. Verify product appears in list

### Test 3: POS System (Cashier)

1. Login as cashier1
2. Select products from categories
3. Enter customer name (required)
4. Select payment method: Cash/Card/GCash
5. Click "Complete Sale"
6. Verify success message appears
7. Check stock decremented

### Test 4: Reports (Manager)

1. Login as manager
2. Navigate to Reports
3. Verify charts display:
   - Sales by Category
   - Low Stock Alerts
   - Recent Transactions
4. Click "Reorder" on low stock item
5. Enter quantity and create purchase order
6. Verify success

### Test 5: Failover Testing

1. Stop backend on PC_A:
   - Press `Ctrl+C` in terminal
2. Refresh frontend page
3. Should still work (connected to PC_B)
4. Create a new sale
5. Restart backend on PC_A:
```cmd
npm start
```
6. Verify sale synced to PC_A (check reports)

### Test 6: Database Replication

1. Stop RethinkDB on PC_B temporarily
2. Add product via PC_A
3. Restart RethinkDB on PC_B:
```cmd
cd C:\RethinkDB
rethinkdb.exe --bind all --directory data --join 192.168.1.100:29015
```
4. Check RethinkDB Admin: PC_B should show new product (auto-synced)

---

## Default User Accounts

| Username | Password | Role | Access |
|----------|----------|------|--------|
| manager | password123 | Manager | Full system access |
| manager2 | password123 | Manager | Full system access |
| cashier1 | password123 | Cashier | POS and sales history |
| cashier2 | password123 | Cashier | POS and sales history |
| cashier3 | password123 | Cashier | POS and sales history |

⚠️ **IMPORTANT:** Change all default passwords immediately after installation!

---

## Production Deployment (Optional)

### Run Backend as Windows Service

1. Download NSSM from [https://nssm.cc/download](https://nssm.cc/download)
2. Install backend as service:
```cmd
nssm install InventoryBackend "C:\Program Files\nodejs\node.exe" "C:\inventory-system\inventory-backend\server.js"
nssm set InventoryBackend AppDirectory "C:\inventory-system\inventory-backend"
nssm start InventoryBackend
```

3. Set service to auto-start:
```cmd
nssm set InventoryBackend Start SERVICE_AUTO_START
```

### Build and Deploy Frontend

1. Build production version:
```cmd
cd C:\inventory-system\inventory-frontend
npm run build
```

2. The `dist` folder can be served using any web server (IIS, Nginx, Apache)

---

## Troubleshooting

### Cannot connect to RethinkDB

**Symptoms:** Backend shows "Failed to connect to RethinkDB"

**Solutions:**
1. Check RethinkDB is running:
```cmd
tasklist | findstr rethinkdb
```
2. Verify firewall allows port 28015
3. Check IP addresses in `.env` are correct
4. Test connection:
```cmd
telnet 192.168.1.100 28015
```

### Cluster not forming

**Symptoms:** RethinkDB admin shows only 1 server

**Solutions:**
1. Verify `--join` parameter has correct IP address
2. Check both servers are on same network
3. Ensure port 29015 is open in firewall
4. Restart both RethinkDB instances

### Frontend cannot connect to backend

**Symptoms:** Login fails with "Network Error"

**Solutions:**
1. Check backend is running:
```cmd
curl http://192.168.1.100:5000/api/health
```
2. Verify `api.js` has correct server IPs
3. Check browser console for CORS errors
4. Ensure port 5000 is open in firewall

### Products not appearing

**Symptoms:** Products page is empty

**Solutions:**
1. Run database initialization (PC_A only):
```cmd
npm run init-db
```
2. Verify in RethinkDB admin:
```
r.table('products').count()
```
3. Check browser console for errors
4. Verify user has correct permissions

### Sales creation fails

**Symptoms:** "Failed to create sale" error

**Solutions:**
1. Check product has sufficient stock
2. Verify customer name is entered (required field)
3. Check backend logs for errors
4. Ensure database tables exist

---

## Backup & Recovery

### Create Backup

```cmd
cd C:\RethinkDB
rethinkdb dump -e ordering_system -f backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.tar.gz
```

### Restore from Backup

```cmd
cd C:\RethinkDB
rethinkdb restore backup_20250120.tar.gz
```

**Recommended Schedule:** Daily backups at 2:00 AM

---

## System Access Points

- **Frontend Application:** http://192.168.1.100:3000
- **Backend API:** http://192.168.1.100:5000
- **RethinkDB Admin Panel:** http://192.168.1.100:8080

---

## Architecture Overview

### Database Structure

**Tables:**
- `managers` - Manager user accounts (1 shard, 2 replicas)
- `cashiers` - Cashier user accounts (1 shard, 2 replicas)
- `products` - Product inventory (2 shards, 2 replicas)
- `sales` - Sales transactions (2 shards, 2 replicas)
- `suppliers` - Supplier information (1 shard, 2 replicas)
- `purchase_orders` - Purchase order records (1 shard, 2 replicas)
- `inventory_logs` - Stock movement logs (2 shards, 2 replicas)
- `analytics` - Aggregated analytics data (1 shard, 2 replicas)

### Sharding Strategy

High-traffic tables (`products`, `sales`, `inventory_logs`) are sharded across 2 servers for better performance:
- **Shard 1**: Primary on PC_A, Replica on PC_B
- **Shard 2**: Primary on PC_B, Replica on PC_A

This ensures:
- Automatic failover if one server goes down
- Load distribution across both servers
- Data redundancy and high availability

---

## Post-Installation Checklist

- [ ] Both servers running RethinkDB
- [ ] RethinkDB cluster shows 2 connected servers
- [ ] Backend running on both PC_A and PC_B
- [ ] Frontend accessible from all workstations
- [ ] All default users can login successfully
- [ ] Products page loads with sample data
- [ ] POS system works for cashiers
- [ ] Sales are recorded successfully
- [ ] Reports generate correctly
- [ ] Purchase orders can be created
- [ ] Failover tested successfully
- [ ] **All default passwords changed**
- [ ] Backup procedures configured
- [ ] User training completed

---

## Support & Maintenance

### Daily Tasks
- Monitor RethinkDB cluster status via admin panel
- Check backend logs for errors
- Verify both servers are online

### Weekly Tasks
- Backup database
- Review sales reports
- Check low stock alerts
- Update product prices if needed

### Monthly Tasks
- Clean old logs
- Update system dependencies
- Review user accounts
- Archive old sales data

---

## Learn More

- [RethinkDB Documentation](https://rethinkdb.com/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

## License

This project is proprietary software for internal use.

---

🎉 **Installation Complete!**

For additional support, refer to the troubleshooting section or contact your system administrator.
