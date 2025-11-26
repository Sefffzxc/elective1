import r, { createDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

const initializeData = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Create database and tables
    await createDatabase();

    // Check if managers already exist
    const managersCount = await r.table('managers').count().run();
    
    if (managersCount === 0) {
      // Create default managers
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const defaultManagers = [
        {
          username: 'manager',
          password: hashedPassword,
          fullName: 'System Manager',
          email: 'manager@store.com',
          created_at: new Date()
        },
        {
          username: 'manager2',
          password: hashedPassword,
          fullName: 'Assistant Manager',
          email: 'manager2@store.com',
          created_at: new Date()
        }
      ];

      await r.table('managers').insert(defaultManagers).run();
      console.log('Default managers created');
    }

    // Check if cashiers already exist
    const cashiersCount = await r.table('cashiers').count().run();
    
    if (cashiersCount === 0) {
      // Create default cashiers
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const defaultCashiers = [
        {
          username: 'cashier1',
          password: hashedPassword,
          fullName: 'John Doe',
          email: 'cashier1@store.com',
          created_at: new Date()
        },
        {
          username: 'cashier2',
          password: hashedPassword,
          fullName: 'Jane Smith',
          email: 'cashier2@store.com',
          created_at: new Date()
        },
        {
          username: 'cashier3',
          password: hashedPassword,
          fullName: 'Mike Johnson',
          email: 'cashier3@store.com',
          created_at: new Date()
        }
      ];

      await r.table('cashiers').insert(defaultCashiers).run();
      console.log('Default cashiers created');
    }

    // Check if products already exist
    const productsCount = await r.table('products').count().run();
    
    if (productsCount === 0) {
      // Create sample products
      const sampleProducts = [
        // ---------------- Laptops ----------------
        { name: 'Acer Aspire 5', category: 'Laptops', price: 28999, stock: 12, barcode: 'LAP001', created_at: new Date() },
        { name: 'ASUS Vivobook 15', category: 'Laptops', price: 32999, stock: 8, barcode: 'LAP002', created_at: new Date() },
        { name: 'Lenovo IdeaPad Slim 3', category: 'Laptops', price: 25999, stock: 10, barcode: 'LAP003', created_at: new Date() },
        { name: 'HP Pavilion x360', category: 'Laptops', price: 44999, stock: 6, barcode: 'LAP004', created_at: new Date() },
        { name: 'MSI GF63 Thin Gaming Laptop', category: 'Laptops', price: 42999, stock: 5, barcode: 'LAP005', created_at: new Date() },

        // ---------------- Desktops ----------------
        { name: 'Acer Aspire TC Desktop', category: 'Desktops', price: 19999, stock: 7, barcode: 'DST001', created_at: new Date() },
        { name: 'Lenovo ThinkCentre M720s', category: 'Desktops', price: 23999, stock: 4, barcode: 'DST002', created_at: new Date() },
        { name: 'HP ProDesk 400 G6', category: 'Desktops', price: 28999, stock: 5, barcode: 'DST003', created_at: new Date() },

        // ---------------- Processors ----------------
        { name: 'Intel Core i3-12100', category: 'Processors', price: 6999, stock: 20, barcode: 'CPU003', created_at: new Date() },
        { name: 'Intel Core i5-12400F', category: 'Processors', price: 8999, stock: 20, barcode: 'CPU001', created_at: new Date() },
        { name: 'Intel Core i7-12700', category: 'Processors', price: 19999, stock: 10, barcode: 'CPU004', created_at: new Date() },
        { name: 'AMD Ryzen 5 5600X', category: 'Processors', price: 10500, stock: 15, barcode: 'CPU002', created_at: new Date() },
        { name: 'AMD Ryzen 7 5800X', category: 'Processors', price: 16500, stock: 8, barcode: 'CPU005', created_at: new Date() },

        // ---------------- Graphics Cards ----------------
        { name: 'NVIDIA GTX 1650 4GB', category: 'Graphics Cards', price: 8999, stock: 12, barcode: 'GPU003', created_at: new Date() },
        { name: 'NVIDIA RTX 3060 12GB', category: 'Graphics Cards', price: 18999, stock: 7, barcode: 'GPU001', created_at: new Date() },
        { name: 'ASUS Dual RTX 4060 8GB', category: 'Graphics Cards', price: 21999, stock: 5, barcode: 'GPU002', created_at: new Date() },
        { name: 'AMD Radeon RX 6600', category: 'Graphics Cards', price: 13999, stock: 6, barcode: 'GPU004', created_at: new Date() },
        { name: 'AMD Radeon RX 6700 XT', category: 'Graphics Cards', price: 22999, stock: 3, barcode: 'GPU005', created_at: new Date() },

        // ---------------- Motherboards ----------------
        { name: 'ASUS PRIME A320M-K', category: 'Motherboards', price: 2899, stock: 18, barcode: 'MB003', created_at: new Date() },
        { name: 'MSI B550M PRO-VDH', category: 'Motherboards', price: 5499, stock: 10, barcode: 'MB001', created_at: new Date() },
        { name: 'ASUS PRIME B660M-A', category: 'Motherboards', price: 7899, stock: 6, barcode: 'MB002', created_at: new Date() },
        { name: 'Gigabyte B450M DS3H', category: 'Motherboards', price: 3999, stock: 12, barcode: 'MB004', created_at: new Date() },

        // ---------------- RAM ----------------
        { name: 'Kingston Fury 8GB DDR4', category: 'Memory (RAM)', price: 1499, stock: 40, barcode: 'RAM002', created_at: new Date() },
        { name: 'Corsair Vengeance 16GB DDR4', category: 'Memory (RAM)', price: 2999, stock: 30, barcode: 'RAM001', created_at: new Date() },
        { name: 'G.Skill Ripjaws V 16GB DDR4', category: 'Memory (RAM)', price: 2899, stock: 22, barcode: 'RAM003', created_at: new Date() },
        { name: 'TEAM Elite 8GB DDR4', category: 'Memory (RAM)', price: 1299, stock: 35, barcode: 'RAM004', created_at: new Date() },

        // ---------------- Storage ----------------
        { name: 'Samsung 970 EVO Plus 500GB SSD', category: 'Storage', price: 3299, stock: 25, barcode: 'STO001', created_at: new Date() },
        { name: 'Seagate 1TB HDD', category: 'Storage', price: 1999, stock: 35, barcode: 'STO002', created_at: new Date() },
        { name: 'Western Digital Blue 1TB SSD', category: 'Storage', price: 2899, stock: 18, barcode: 'STO003', created_at: new Date() },
        { name: 'Kingston NV2 500GB SSD', category: 'Storage', price: 1599, stock: 30, barcode: 'STO004', created_at: new Date() },

        // ---------------- Power Supplies ----------------
        { name: 'Corsair CV550 550W PSU', category: 'Power Supply', price: 2499, stock: 15, barcode: 'PSU001', created_at: new Date() },
        { name: 'DeepCool 650W PSU', category: 'Power Supply', price: 2999, stock: 10, barcode: 'PSU002', created_at: new Date() },
        { name: 'EVGA 500W 80+ White', category: 'Power Supply', price: 2199, stock: 12, barcode: 'PSU003', created_at: new Date() },

        // ---------------- PC Cases ----------------
        { name: 'Tecware Nexus M2', category: 'PC Cases', price: 1699, stock: 25, barcode: 'CASE001', created_at: new Date() },
        { name: 'DeepCool Matrexx 30', category: 'PC Cases', price: 1499, stock: 20, barcode: 'CASE002', created_at: new Date() },
        { name: 'CoolerMaster MasterBox MB311', category: 'PC Cases', price: 2999, stock: 8, barcode: 'CASE003', created_at: new Date() },

        // ---------------- Cooling ----------------
        { name: 'DeepCool GAMMAXX 400', category: 'Cooling', price: 999, stock: 20, barcode: 'COOL001', created_at: new Date() },
        { name: 'CoolerMaster Hyper 212', category: 'Cooling', price: 1899, stock: 10, barcode: 'COOL002', created_at: new Date() },
        { name: 'Arctic MX-4 Thermal Paste', category: 'Cooling', price: 450, stock: 50, barcode: 'COOL003', created_at: new Date() },

        // ---------------- Monitors ----------------
        { name: 'AOC 24" 75Hz Monitor', category: 'Monitors', price: 4999, stock: 9, barcode: 'MON001', created_at: new Date() },
        { name: 'ASUS 27" 144Hz Gaming Monitor', category: 'Monitors', price: 11999, stock: 4, barcode: 'MON002', created_at: new Date() },
        { name: 'LG 24MK600 24" IPS Monitor', category: 'Monitors', price: 5999, stock: 6, barcode: 'MON003', created_at: new Date() },

        // ---------------- Keyboards ----------------
        { name: 'Redragon K552 Mechanical Keyboard', category: 'Keyboards', price: 1599, stock: 20, barcode: 'KEY001', created_at: new Date() },
        { name: 'Logitech K120 Keyboard', category: 'Keyboards', price: 399, stock: 40, barcode: 'KEY002', created_at: new Date() },
        { name: 'Razer BlackWidow V3', category: 'Keyboards', price: 4999, stock: 7, barcode: 'KEY003', created_at: new Date() },

        // ---------------- Mice ----------------
        { name: 'Logitech G102 Mouse', category: 'Mice', price: 799, stock: 50, barcode: 'MOU001', created_at: new Date() },
        { name: 'Razer DeathAdder Essential', category: 'Mice', price: 1299, stock: 25, barcode: 'MOU002', created_at: new Date() },
        { name: 'A4Tech OP-720 Mouse', category: 'Mice', price: 250, stock: 80, barcode: 'MOU003', created_at: new Date() },

        // ---------------- Headsets ----------------
        { name: 'Razer Kraken X Lite', category: 'Headsets', price: 1799, stock: 15, barcode: 'HSET001', created_at: new Date() },
        { name: 'Logitech H111 Headset', category: 'Headsets', price: 399, stock: 30, barcode: 'HSET002', created_at: new Date() },
        { name: 'Redragon H510 Zeus', category: 'Headsets', price: 2499, stock: 10, barcode: 'HSET003', created_at: new Date() },

        // ---------------- Routers ----------------
        { name: 'TP-Link Archer C20', category: 'Routers', price: 899, stock: 18, barcode: 'RT001', created_at: new Date() },
        { name: 'ASUS RT-AC59U', category: 'Routers', price: 1999, stock: 10, barcode: 'RT002', created_at: new Date() },
        { name: 'Huawei WiFi AX3 Router', category: 'Routers', price: 2499, stock: 6, barcode: 'RT003', created_at: new Date() },

        // ---------------- Printers ----------------
        { name: 'Canon Pixma G3010', category: 'Printers', price: 8999, stock: 5, barcode: 'PRT001', created_at: new Date() },
        { name: 'Epson L3110 Ink Tank Printer', category: 'Printers', price: 9499, stock: 4, barcode: 'PRT002', created_at: new Date() },

        // ---------------- Accessories ----------------
        { name: 'Laptop Sleeve 15.6"', category: 'Accessories', price: 499, stock: 40, barcode: 'ACC001', created_at: new Date() },
        { name: 'HDMI Cable 1.5m', category: 'Accessories', price: 250, stock: 100, barcode: 'ACC002', created_at: new Date() },
        { name: 'USB-C to USB Adapter', category: 'Accessories', price: 199, stock: 80, barcode: 'ACC003', created_at: new Date() },
        { name: 'Logitech Webcam C270', category: 'Accessories', price: 999, stock: 12, barcode: 'ACC004', created_at: new Date() },

        // ---------------- Networking ----------------
        { name: 'CAT6 Ethernet Cable 5m', category: 'Networking', price: 150, stock: 150, barcode: 'NET001', created_at: new Date() },
        { name: 'TP-Link 8-Port Switch', category: 'Networking', price: 699, stock: 20, barcode: 'NET002', created_at: new Date() },

        // ---------------- Software ----------------
        { name: 'Windows 11 Home Key', category: 'Software', price: 4999, stock: 10, barcode: 'SW001', created_at: new Date() },
        { name: 'Microsoft Office 365 Personal', category: 'Software', price: 2999, stock: 12, barcode: 'SW002', created_at: new Date() }
      ];

      await r.table('products').insert(sampleProducts).run();
      console.log('Sample products created');
    }

    console.log('\n=== Initialization Complete ===');
    console.log('Database: ordering_system');
    console.log('Tables: managers, cashiers, products, sales');
    console.log('Sharding: products and sales have 2 shards with 2 replicas each');
    console.log('\nDefault Login Credentials:');
    console.log('\nManagers:');
    console.log('- username: manager, password: password123');
    console.log('- username: manager2, password: password123');
    console.log('\nCashiers:');
    console.log('- username: cashier1, password: password123');
    console.log('- username: cashier2, password: password123');
    console.log('- username: cashier3, password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeData();