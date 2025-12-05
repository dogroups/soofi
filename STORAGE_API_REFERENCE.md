# Storage API Quick Reference

## Initialization
```javascript
// The storage object is automatically initialized when storage.js is loaded
// Access it globally as: storage
```

## Inventory Methods

### Get Inventory
```javascript
const inventory = storage.getInventory();
// Returns: Array of inventory items
```

### Save Inventory
```javascript
storage.saveInventory(inventoryArray);
// Returns: boolean (success/failure)
```

### Add Single Item
```javascript
const newItem = {
  id: generateId(),
  name: "Rose Attar",
  type: "Attar",
  price: 500,
  stock: 10
};
storage.addInventoryItem(newItem);
```

### Update Item
```javascript
storage.updateInventoryItem(itemId, {
  stock: 15,
  price: 550
});
```

### Delete Item
```javascript
storage.deleteInventoryItem(itemId);
```

## Sales Methods

### Get Sales
```javascript
const sales = storage.getSales();
// Returns: Array of all sales records
```

### Save Sales
```javascript
storage.saveSales(salesArray);
```

### Add Single Sale
```javascript
const saleRecord = {
  id: generateId(),
  date: "2025-12-06",
  timestamp: new Date().toISOString(),
  invoiceNumber: "INV-2025-001",
  customerName: "John Doe",
  customerMobile: "1234567890",
  totals: { /* ... */ },
  items: [ /* ... */ ]
};
storage.addSale(saleRecord);
```

### Get Sales by Date Range
```javascript
const sales = storage.getSalesByDateRange("2025-12-01", "2025-12-31");
```

### Get Sales Statistics
```javascript
// All sales
const allStats = storage.getSalesStats();

// Sales for specific date
const todayStats = storage.getSalesStats("2025-12-06");

// Returns:
// {
//   totalSales: 10,
//   totalRevenue: 5000,
//   totalItems: 25,
//   totalDiscount: 500,
//   totalGST: 450,
//   averageOrderValue: 500
// }
```

## User Methods

### Get Current User
```javascript
const user = storage.getCurrentUser();
```

### Save Current User
```javascript
storage.saveCurrentUser({
  username: "admin",
  displayName: "Admin",
  role: "admin"
});
```

### Logout (Clear User)
```javascript
storage.clearCurrentUser();
```

## Invoice Methods

### Get Invoice Sequence
```javascript
const seq = storage.getInvoiceSequence(2025);
```

### Set Invoice Sequence
```javascript
storage.setInvoiceSequence(2025, 100);
```

### Increment Invoice Sequence
```javascript
const nextSeq = storage.incrementInvoiceSequence(2025);
// Returns the new sequence number
```

## Settings Methods

### Get Settings
```javascript
const settings = storage.getSettings();
// Returns object with shop settings
```

### Save Settings
```javascript
storage.saveSettings({
  shopName: "SOOFI ATTARS",
  shopAddress: "...",
  shopPhone: "...",
  // ... other settings
});
```

### Update Single Setting
```javascript
storage.updateSetting("shopName", "New Shop Name");
```

## Backup & Restore

### Create Backup
```javascript
// With custom name
const result = storage.createBackup("before_update");

// Auto-generated name
const result = storage.createBackup();

// Returns: { success: true, timestamp: 1234567890, name: "backup_name" }
```

### List Backups
```javascript
const backups = storage.listBackups();
// Returns array of backup objects with timestamp, name, date, version
```

### Restore Backup
```javascript
const success = storage.restoreBackup(timestamp);
// Returns: boolean
```

### Delete Backup
```javascript
const success = storage.deleteBackup(timestamp);
```

## Import & Export

### Export Data
```javascript
// Get JSON string
const jsonData = storage.exportData();

// Download as file
storage.downloadExport("my_backup.json");
```

### Import Data
```javascript
// Replace existing data
const result = storage.importData(jsonString, { merge: false });

// Merge with existing data
const result = storage.importData(jsonString, { merge: true });

// Returns: { success: true/false, message: "..." }
```

### Import from File
```javascript
// In file input handler
async function handleFileImport(file) {
  try {
    const result = await storage.importFromFile(file, { merge: false });
    if (result.success) {
      console.log("Import successful!");
    }
  } catch (error) {
    console.error("Import failed:", error);
  }
}
```

## Storage Information

### Get Storage Info
```javascript
const info = storage.getStorageInfo();
// Returns:
// {
//   totalSize: 12345,
//   totalSizeKB: "12.05",
//   totalSizeMB: "0.01",
//   itemCount: 5,
//   usagePercent: "0.24",
//   items: { /* individual item sizes */ }
// }
```

### Check Storage Availability
```javascript
if (storage.isAvailable) {
  console.log("Storage is available");
}
```

## Data Validation

### Validate Data
```javascript
const validation = storage.validateData();
// Returns:
// {
//   valid: true/false,
//   issues: ["issue 1", "issue 2", ...]
// }
```

### Repair Data
```javascript
const result = storage.repairData();
// Returns: { repaired: 5 } // number of items removed
```

## Utility Methods

### Clear All Data
```javascript
const success = storage.clearAll();
// Removes all app data from localStorage
```

### Get/Set Generic Data
```javascript
// Get with default value
const data = storage.get("custom_key", defaultValue);

// Set
storage.set("custom_key", { foo: "bar" });

// Remove
storage.remove("custom_key");
```

## Error Handling

All methods include built-in error handling:

```javascript
// Methods return false on error
if (!storage.saveInventory(inventory)) {
  console.error("Failed to save inventory");
}

// Import/export return result objects
const result = storage.importData(jsonString);
if (!result.success) {
  console.error("Import failed:", result.message);
}
```

## Events & Callbacks

### Storage Quota Exceeded
The storage system automatically handles quota exceeded errors:
- Cleans up old backups
- Compresses sales data
- Logs warnings to console

### Automatic Cleanup
```javascript
// Manually trigger cleanup
storage.cleanupOldBackups();
storage.compressSalesData();
```

## Configuration

Access configuration:
```javascript
console.log(storage.config);
// {
//   version: "1.0.0",
//   prefix: "attar_",
//   keys: { ... },
//   limits: {
//     maxBackups: 5,
//     maxSalesRecords: 10000,
//     maxInventoryItems: 1000
//   }
// }
```

## Best Practices

1. **Always check return values**
   ```javascript
   if (!storage.saveInventory(inventory)) {
     // Handle error
   }
   ```

2. **Create backups before major operations**
   ```javascript
   storage.createBackup("before_bulk_update");
   // ... perform operations
   ```

3. **Validate data periodically**
   ```javascript
   // On app load
   const validation = storage.validateData();
   if (!validation.valid) {
     storage.repairData();
   }
   ```

4. **Monitor storage usage**
   ```javascript
   const info = storage.getStorageInfo();
   if (parseFloat(info.usagePercent) > 80) {
     // Warn user or cleanup
   }
   ```

5. **Use try-catch for async operations**
   ```javascript
   try {
     const result = await storage.importFromFile(file);
   } catch (error) {
     console.error("Import failed:", error);
   }
   ```

## Examples

### Complete Sale Workflow
```javascript
// 1. Load inventory
const inventory = storage.getInventory();

// 2. Create sale
const sale = {
  id: generateId(),
  date: new Date().toISOString().split('T')[0],
  timestamp: new Date().toISOString(),
  invoiceNumber: `INV-2025-${storage.incrementInvoiceSequence(2025)}`,
  customerName: "John Doe",
  totals: { grandTotal: 1000 },
  items: []
};

// 3. Save sale
storage.addSale(sale);

// 4. Update inventory
inventory.forEach(item => {
  // Update stock
});
storage.saveInventory(inventory);

// 5. Create backup every 10 sales
const sales = storage.getSales();
if (sales.length % 10 === 0) {
  storage.createBackup(`auto_${sales.length}`);
}
```

### Daily Report
```javascript
const today = new Date().toISOString().split('T')[0];
const stats = storage.getSalesStats(today);

console.log(`
  Sales Today: ${stats.totalSales}
  Revenue: ₹${stats.totalRevenue}
  Items Sold: ${stats.totalItems}
  Average Order: ₹${stats.averageOrderValue.toFixed(2)}
`);
```

### Data Export for Backup
```javascript
// Export data
storage.downloadExport(`backup_${new Date().toISOString().split('T')[0]}.json`);

// Or get JSON for custom handling
const jsonData = storage.exportData();
// Send to server, email, etc.
```
