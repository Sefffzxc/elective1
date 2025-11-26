import r, { createDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

const initializeData = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Create database and tables
    await createDatabase();

    // Check if users already exist
    const usersCount = await r.table('users').count().run();
    
    if (usersCount === 0) {
      // Create default users
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const defaultUsers = [
        {
          username: 'manager',
          password: hashedPassword,
          role: 'manager',
          fullName: 'System Manager',
          created_at: new Date()
        },
        {
          username: 'cashier1',
          password: hashedPassword,
          role: 'cashier',
          fullName: 'Cashier One',
          created_at: new Date()
        },
        {
          username: 'cashier2',
          password: hashedPassword,
          role: 'cashier',
          fullName: 'Cashier Two',
          created_at: new Date()
        }
      ];

      await r.table('users').insert(defaultUsers).run();
      console.log('Default users created (username/password: manager/password123, cashier1/password123, cashier2/password123)');
    }

    // Check if products already exist
    const productsCount = await r.table('products').count().run();
    
    if (productsCount === 0) {
      // Create sample products
      const sampleProducts = [
        { name: 'Coca Cola', category: 'Beverages', price: 45.00, stock: 100, barcode: '001', created_at: new Date() },
        { name: 'Pepsi', category: 'Beverages', price: 45.00, stock: 80, barcode: '002', created_at: new Date() },
        { name: 'Chips', category: 'Snacks', price: 25.00, stock: 150, barcode: '003', created_at: new Date() },
        { name: 'Chocolate Bar', category: 'Snacks', price: 35.00, stock: 200, barcode: '004', created_at: new Date() },
        { name: 'Bottled Water', category: 'Beverages', price: 20.00, stock: 300, barcode: '005', created_at: new Date() },
        { name: 'Instant Noodles', category: 'Food', price: 15.00, stock: 250, barcode: '006', created_at: new Date() },
        { name: 'Bread', category: 'Food', price: 50.00, stock: 50, barcode: '007', created_at: new Date() },
        { name: 'Milk', category: 'Beverages', price: 75.00, stock: 60, barcode: '008', created_at: new Date() }
      ];

      await r.table('products').insert(sampleProducts).run();
      console.log('Sample products created');
    }

    console.log('\n=== Initialization Complete ===');
    console.log('Database: ordering_system');
    console.log('Tables: users, products, sales');
    console.log('Sharding: products and sales have 2 shards with 2 replicas each');
    console.log('\nDefault Login Credentials:');
    console.log('Manager - username: manager, password: password123');
    console.log('Cashier - username: cashier1, password: password123');
    console.log('Cashier - username: cashier2, password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeData();