import r from '../config/database.js';

/**
 * This script fixes old sales records that are missing cashier_name
 * Run this once after migrating to the new system
 */

const fixSalesData = async () => {
  try {
    console.log('Starting sales data migration...');

    // Get all sales
    const sales = await r.table('sales').run();
    console.log(`Found ${sales.length} sales records`);

    let fixedCount = 0;
    let missingCashierCount = 0;

    for (const sale of sales) {
      // Check if cashier_name is missing or empty
      if (!sale.cashier_name || sale.cashier_name === '') {
        // Try to find cashier in cashiers table
        let cashier = await r.table('cashiers').get(sale.cashier_id).run();
        
        // If not found in cashiers, try managers table
        if (!cashier) {
          cashier = await r.table('managers').get(sale.cashier_id).run();
        }

        if (cashier) {
          // Update the sale with cashier name
          await r.table('sales')
            .get(sale.id)
            .update({ cashier_name: cashier.fullName })
            .run();
          
          console.log(`✓ Fixed sale ${sale.id} - Added cashier: ${cashier.fullName}`);
          fixedCount++;
        } else {
          // Cashier no longer exists
          await r.table('sales')
            .get(sale.id)
            .update({ cashier_name: 'Unknown Cashier' })
            .run();
          
          console.log(`⚠ Sale ${sale.id} - Cashier ID ${sale.cashier_id} not found, set to Unknown`);
          missingCashierCount++;
        }
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Total sales: ${sales.length}`);
    console.log(`Fixed with cashier names: ${fixedCount}`);
    console.log(`Set to "Unknown Cashier": ${missingCashierCount}`);
    console.log(`Already had names: ${sales.length - fixedCount - missingCashierCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

fixSalesData();