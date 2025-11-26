import rethinkdbdash from 'rethinkdbdash';
import dotenv from 'dotenv';

dotenv.config();

const r = rethinkdbdash({
  servers: [
    { host: process.env.RETHINKDB_HOST_A || '192.168.1.7', port: parseInt(process.env.RETHINKDB_PORT) || 28015 },
    { host: process.env.RETHINKDB_HOST_B || '192.168.1.7', port: parseInt(process.env.RETHINKDB_PORT) || 28015 }
  ],
  db: process.env.RETHINKDB_DB || 'ordering_system',
  pool: true,
  buffer: 10,
  max: 100,
  timeout: 20,
  pingInterval: 60,
  discovery: true,
  silent: false
});

export const createDatabase = async () => {
  try {
    const dbList = await r.dbList().run();
    
    if (!dbList.includes('ordering_system')) {
      await r.dbCreate('ordering_system').run();
      console.log('Database created: ordering_system');
    }

    const tableList = await r.db('ordering_system').tableList().run();

    // Create managers table
    if (!tableList.includes('managers')) {
      await r.db('ordering_system').tableCreate('managers').run();
      await r.db('ordering_system').table('managers').indexCreate('username').run();
      console.log('Table created: managers');
    }

    // Create cashiers table
    if (!tableList.includes('cashiers')) {
      await r.db('ordering_system').tableCreate('cashiers').run();
      await r.db('ordering_system').table('cashiers').indexCreate('username').run();
      console.log('Table created: cashiers');
    }

    // Create products table with sharding
    if (!tableList.includes('products')) {
      await r.db('ordering_system').tableCreate('products').run();
      await r.db('ordering_system').table('products').indexCreate('category').run();
      await r.db('ordering_system').table('products').indexCreate('name').run();
      console.log('Table created: products (shards: 2, replicas: 2)');
    }

    // Create sales table with sharding
    if (!tableList.includes('sales')) {
      await r.db('ordering_system').tableCreate('sales').run();
      await r.db('ordering_system').table('sales').indexCreate('cashier_id').run();
      await r.db('ordering_system').table('sales').indexCreate('created_at').run();
      console.log('Table created: sales (shards: 2, replicas: 2)');
    }

    // Wait for indexes
    await r.db('ordering_system').table('managers').indexWait().run();
    await r.db('ordering_system').table('cashiers').indexWait().run();
    await r.db('ordering_system').table('products').indexWait().run();
    await r.db('ordering_system').table('sales').indexWait().run();

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export default r;