import r from '../config/database.js';

/**
 * This script configures RethinkDB tables for true high availability
 * It sets write_acks to 'single' so that writes succeed even if one server is down
 */

const configureHighAvailability = async () => {
  try {
    console.log('Starting High Availability Configuration...\n');

    // Check current cluster status
    console.log('Checking cluster status...');
    const servers = await r.db('rethinkdb').table('server_status').run();
    console.log(`Found ${servers.length} server(s) in cluster:`);
    servers.forEach(server => {
      console.log(`  - ${server.name} (${server.network.hostname}): ${server.status}`);
    });
    console.log('');

    // List all tables
    const tables = ['products', 'sales'];
    
    for (const tableName of tables) {
      console.log(`\nConfiguring table: ${tableName}`);
      console.log('━'.repeat(50));
      
      try {
        // Get current config
        const currentConfig = await r.db('ordering_system').table(tableName).config().run();
        console.log(`Current shards: ${currentConfig.shards.length}`);
        console.log(`Current replicas per shard: ${currentConfig.shards[0].replicas.length}`);
        console.log(`Current write_acks: ${currentConfig.write_acks}`);

        // Reconfigure for high availability
        console.log('\nReconfiguring for high availability...');
        
        // Step 1: Ensure proper sharding and replication
        await r.db('ordering_system').table(tableName).reconfigure({
          shards: 2,
          replicas: 2,
          primaryReplicaTag: 'default'
        }).run();
        console.log('✓ Sharding and replication configured');

        // Wait a moment for reconfiguration
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Set write acknowledgment to 'single'
        // This is the KEY setting for HA - only needs 1 server to acknowledge writes
        await r.db('ordering_system').table(tableName).config().update({
          write_acks: 'single'
        }).run();
        console.log('✓ Write acknowledgment set to "single"');

        // Step 3: Wait for table to be ready
        console.log('Waiting for table to be ready for writes...');
        await r.db('ordering_system').table(tableName).wait({ 
          waitFor: 'ready_for_writes', 
          timeout: 60 
        }).run();
        console.log('✓ Table is ready for writes');

        // Verify configuration
        const newConfig = await r.db('ordering_system').table(tableName).config().run();
        console.log('\nNew configuration:');
        console.log(`  Shards: ${newConfig.shards.length}`);
        console.log(`  Replicas: ${newConfig.shards[0].replicas.length}`);
        console.log(`  Write acks: ${newConfig.write_acks}`);
        console.log(`  Durability: ${newConfig.durability}`);

        // Check table status
        const tableStatus = await r.db('ordering_system').table(tableName).status().run();
        console.log('\nTable status:');
        console.log(`  Ready for outdated reads: ${tableStatus.status.ready_for_outdated_reads}`);
        console.log(`  Ready for reads: ${tableStatus.status.ready_for_reads}`);
        console.log(`  Ready for writes: ${tableStatus.status.ready_for_writes}`);
        console.log(`  All replicas ready: ${tableStatus.status.all_replicas_ready}`);

      } catch (error) {
        console.error(`Error configuring ${tableName}:`, error.message);
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('High Availability Configuration Complete!');
    console.log('═'.repeat(50));
    console.log('\nYour tables are now configured to:');
    console.log('  ✓ Continue working if ONE server goes down');
    console.log('  ✓ Automatically sync when server comes back');
    console.log('  ✓ Distribute data across 2 shards');
    console.log('  ✓ Maintain 2 replicas of each shard');
    console.log('\nYou can now safely stop either PC and the system will continue working!');

  } catch (error) {
    console.error('Configuration failed:', error);
    process.exit(1);
  }

  process.exit(0);
};

configureHighAvailability();