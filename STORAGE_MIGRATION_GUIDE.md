# Storage System Migration Guide

## Overview
This guide will help you integrate the new centralized storage system into your existing webapp.

## What's New?

### 1. **storage.js** - Centralized Storage Module
A comprehensive storage layer that provides:
- ✅ Error handling and data validation
- ✅ Backup and restore functionality
- ✅ Import/export capabilities
- ✅ Storage usage monitoring
- ✅ Data integrity checks
- ✅ Automatic cleanup when storage is full

### 2. **storage-manager.html** - Storage Management UI
A beautiful interface to:
- 📊 Monitor storage usage
- 💾 Create and restore backups
- 📤 Export data as JSON
- 📥 Import data from files
- 🔍 Validate data integrity
- 🔧 Repair corrupted data

## Migration Steps

### Step 1: Add Storage Script to Your HTML Files

Add this line to the `<head>` section of your HTML files (before app.js):

```html
<script src="storage.js"></script>
```

**Files to update:**
- `index.html`
- `billing.html`
- `inventory.html`

### Step 2: Update app.js to Use the New Storage System

Replace the existing storage functions with the new storage API:

#### Before (Old Code):
```javascript
function loadInventory() {
  const stored = localStorage.getItem(INVENTORY_KEY);
  if (stored) {
    try {
      inventory = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse inventory from storage", e);
      inventory = [];
    }
  }
}

function saveInventory() {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}
```

#### After (New Code):
```javascript
function loadInventory() {
  inventory = storage.getInventory();
}

function saveInventory() {
  storage.saveInventory(inventory);
}
```

#### Similarly for Sales:
```javascript
// Old
function loadSales() {
  const stored = localStorage.getItem(SALES_KEY);
  if (stored) {
    try {
      sales = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse sales from storage", e);
      sales = [];
    }
  }
}

function saveSales() {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

// New
function loadSales() {
  sales = storage.getSales();
}

function saveSales() {
  storage.saveSales(sales);
}
```

#### For User Authentication:
```javascript
// Old
function setCurrentUser(user) {
  currentUser = user || null;
  if (currentUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
  // ... rest of code
}

// New
function setCurrentUser(user) {
  currentUser = user || null;
  if (currentUser) {
    storage.saveCurrentUser(currentUser);
  } else {
    storage.clearCurrentUser();
  }
  // ... rest of code
}
```

#### For Invoice Sequences:
```javascript
// Old
function getInvoiceSeqKey(year) {
  return INVOICE_SEQ_KEY_PREFIX + String(year);
}

function assignInvoiceNumberIfNeeded() {
  const invoiceInput = document.getElementById("invoiceNumber");
  if (!invoiceInput) return "N/A";

  let invoiceNumber = invoiceInput.value.trim();
  const today = new Date();
  const year = today.getFullYear();
  const key = getInvoiceSeqKey(year);
  let seq = parseInt(localStorage.getItem(key) || "0", 10);
  if (Number.isNaN(seq)) seq = 0;

  if (!invoiceNumber) {
    seq += 1;
    invoiceNumber = formatInvoiceNumber(year, seq);
    invoiceInput.value = invoiceNumber;
    localStorage.setItem(key, String(seq));
  } else {
    seq += 1;
    localStorage.setItem(key, String(seq));
  }

  return invoiceNumber;
}

// New
function assignInvoiceNumberIfNeeded() {
  const invoiceInput = document.getElementById("invoiceNumber");
  if (!invoiceInput) return "N/A";

  let invoiceNumber = invoiceInput.value.trim();
  const today = new Date();
  const year = today.getFullYear();

  if (!invoiceNumber) {
    const seq = storage.incrementInvoiceSequence(year);
    invoiceNumber = formatInvoiceNumber(year, seq);
    invoiceInput.value = invoiceNumber;
  } else {
    storage.incrementInvoiceSequence(year);
  }

  return invoiceNumber;
}
```

### Step 3: Add Link to Storage Manager

Add a link to the storage manager in your navigation. In `index.html`, add:

```html
<a href="storage-manager.html" class="nav-link">
  📦 Storage Manager
</a>
```

### Step 4: Optional - Add Automatic Backups

You can add automatic backups when important actions occur. For example, in `app.js`:

```javascript
// After confirming a sale
function confirmSale() {
  // ... existing sale confirmation code ...
  
  // Create automatic backup every 10 sales
  const sales = storage.getSales();
  if (sales.length % 10 === 0) {
    storage.createBackup(`auto_backup_${sales.length}_sales`);
  }
}
```

## New Features You Can Use

### 1. Storage Monitoring
```javascript
// Get storage usage information
const info = storage.getStorageInfo();
console.log(`Using ${info.usagePercent}% of storage`);
```

### 2. Data Validation
```javascript
// Validate all data
const validation = storage.validateData();
if (!validation.valid) {
  console.log('Issues found:', validation.issues);
  // Optionally repair
  storage.repairData();
}
```

### 3. Backup & Restore
```javascript
// Create a backup
const result = storage.createBackup('before_update');

// List all backups
const backups = storage.listBackups();

// Restore a backup
storage.restoreBackup(timestamp);
```

### 4. Import & Export
```javascript
// Export all data
storage.downloadExport('my_data_backup.json');

// Import from file (programmatically)
storage.importFromFile(file, { merge: false });
```

### 5. Sales Statistics
```javascript
// Get sales stats for today
const stats = storage.getSalesStats('2025-12-06');
console.log('Total revenue:', stats.totalRevenue);
console.log('Average order:', stats.averageOrderValue);
```

### 6. Settings Management
```javascript
// Get settings
const settings = storage.getSettings();

// Update a setting
storage.updateSetting('shopName', 'New Shop Name');
```

## Benefits

1. **Better Error Handling**: All storage operations now have try-catch blocks
2. **Data Validation**: Ensures data integrity before saving
3. **Backup Protection**: Easy backup and restore functionality
4. **Storage Monitoring**: Know when you're running out of space
5. **Data Portability**: Easy import/export for data migration
6. **Automatic Cleanup**: Removes old data when storage is full

## Testing

After migration, test these scenarios:

1. ✅ Add inventory items
2. ✅ Create sales
3. ✅ Create a backup
4. ✅ Export data
5. ✅ Import data
6. ✅ Restore from backup
7. ✅ Check storage usage
8. ✅ Validate data

## Rollback Plan

If you encounter issues, you can easily rollback:

1. Remove `<script src="storage.js"></script>` from HTML files
2. Revert app.js changes
3. Your data in localStorage remains unchanged

## Support

The new storage system is **backward compatible** - it reads from the same localStorage keys as before, so your existing data will work without any changes!

## Next Steps

1. Add the storage.js script to your HTML files
2. Optionally update app.js to use the new API (recommended but not required)
3. Access the Storage Manager at `storage-manager.html`
4. Create your first backup!

---

**Note**: The storage system is designed to work alongside your existing code. You can migrate gradually, one function at a time.
