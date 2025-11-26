import r from '../config/database.js';

const fixReplication = async () => {
  try {
    console.log('🔧 Fixing table replication configuration...\n');

    // Get list of servers in cluster
    const servers = await r.db('rethinkdb').table('server_status').run();
    console.log('📡 Available servers:');
    servers.forEach(server => {
      console.log(`   - ${server.name} (${server.id})`);
    });
    console.log('');

    if (servers.length < 2) {
      console.error('❌ ERROR: Need at least 2 servers in cluster!');
      console.log('Make sure both PC_A and PC_B are running RethinkDB');
      process.exit(1);
    }

    const serverIds = servers.map(s => s.id);
    console.log(`✅ Found ${servers.length} servers in cluster\n`);

    // Reconfigure products table
    console.log('🔄 Reconfiguring products table...');
    await r.db('ordering_system')
      .table('products')
      .reconfigure({
        shards: 2,
        replicas: 2,
        primaryReplicaTag: null
      })
      .run();
    
    console.log('✅ Products table reconfigured\n');

    // Reconfigure sales table
    console.log('🔄 Reconfiguring sales table...');
    await r.db('ordering_system')
      .table('sales')
      .reconfigure({
        shards: 2,
        replicas: 2,
        primaryReplicaTag: null
      })
      .run();
    
    console.log('✅ Sales table reconfigured\n');

    // Wait for tables to be ready
    console.log('⏳ Waiting for tables to sync...');
    await r.db('ordering_system').table('products').wait({ timeout: 30 }).run();
    await r.db('ordering_system').table('sales').wait({ timeout: 30 }).run();
    
    console.log('✅ All tables ready!\n');

    // Check configuration
    console.log('📊 Current table configuration:');
    
    const productsConfig = await r.db('ordering_system').table('products').config().run();
    console.log('\nProducts table:');
    console.log(`   Shards: ${productsConfig.shards.length}`);
    productsConfig.shards.forEach((shard, i) => {
      console.log(`   Shard ${i}: ${shard.replicas.length} replicas`);
      shard.replicas.forEach(replica => {
        const server = servers.find(s => s.id === replica);
        console.log(`      → ${server ? server.name : replica}`);
      });
    });

    const salesConfig = await r.db('ordering_system').table('sales').config().run();
    console.log('\nSales table:');
    console.log(`   Shards: ${salesConfig.shards.length}`);
    salesConfig.shards.forEach((shard, i) => {
      console.log(`   Shard ${i}: ${shard.replicas.length} replicas`);
      shard.replicas.forEach(replica => {
        const server = servers.find(s => s.id === replica);
        console.log(`      → ${server ? server.name : replica}`);
      });
    });

    console.log('\n✅ Replication fix complete!');
    console.log('📝 Now each shard has replicas on both servers');
    console.log('🎯 System will continue working even if one server goes down\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing replication:', error);
    process.exit(1);
  }
};

fixReplication();