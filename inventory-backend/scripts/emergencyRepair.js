import r from '../config/database.js';

const emergencyRepair = async () => {
  try {
    console.log('🚨 Starting EMERGENCY REPAIR...\n');
    console.log('⚠️  WARNING: This will use "unsafe_rollback" mode');
    console.log('   Any data on the disconnected server that wasn\'t synced will be lost.\n');

    // Get server status
    const servers = await r.db('rethinkdb').table('server_status').run();
    console.log('📡 Available servers:');
    servers.forEach(server => {
      console.log(`   - ${server.name} (${server.id}) - ${server.status}`);
    });
    console.log('');

    if (servers.length === 0) {
      console.error('❌ No servers available!');
      process.exit(1);
    }

    console.log(`✓ Found ${servers.length} available server(s)\n`);

    // Emergency repair products table
    console.log('🔧 Emergency repair: products table...');
    try {
      await r.db('ordering_system').table('products').reconfigure({
        shards: 1,
        replicas: 1,
        emergencyRepair: 'unsafe_rollback'
      }).run();
      console.log('✅ Products table repaired\n');
    } catch (err) {
      console.error('⚠️  Products table error:', err.message);
    }

    // Emergency repair sales table
    console.log('🔧 Emergency repair: sales table...');
    try {
      await r.db('ordering_system').table('sales').reconfigure({
        shards: 1,
        replicas: 1,
        emergencyRepair: 'unsafe_rollback'
      }).run();
      console.log('✅ Sales table repaired\n');
    } catch (err) {
      console.error('⚠️  Sales table error:', err.message);
    }

    // Emergency repair users table
    console.log('🔧 Emergency repair: users table...');
    try {
      await r.db('ordering_system').table('users').reconfigure({
        shards: 1,
        replicas: 1,
        emergencyRepair: 'unsafe_rollback'
      }).run();
      console.log('✅ Users table repaired\n');
    } catch (err) {
      console.error('⚠️  Users table error:', err.message);
    }

    // Wait for tables
    console.log('⏳ Waiting for tables to be ready...');
    await r.db('ordering_system').table('products').wait({ timeout: 30 }).run();
    await r.db('ordering_system').table('sales').wait({ timeout: 30 }).run();
    await r.db('ordering_system').table('users').wait({ timeout: 30 }).run();

    // Check status
    console.log('\n📊 Table Status:');
    
    const productsStatus = await r.db('ordering_system').table('products').status().run();
    console.log('\nProducts:');
    console.log(`   Ready for reads: ${productsStatus.status.ready_for_reads}`);
    console.log(`   Ready for writes: ${productsStatus.status.ready_for_writes}`);

    const salesStatus = await r.db('ordering_system').table('sales').status().run();
    console.log('\nSales:');
    console.log(`   Ready for reads: ${salesStatus.status.ready_for_reads}`);
    console.log(`   Ready for writes: ${salesStatus.status.ready_for_writes}`);

    console.log('\n✅ EMERGENCY REPAIR COMPLETE!\n');
    console.log('📝 Tables are now writable with 1 replica');
    console.log('⚠️  When the disconnected server comes back online:');
    console.log('   1. It will automatically rejoin the cluster');
    console.log('   2. Run: npm run fix-replication');
    console.log('   3. This will restore 2 replicas for redundancy\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Emergency repair failed:', error);
    process.exit(1);
  }
};

emergencyRepair();