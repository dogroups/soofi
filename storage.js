/**
 * ========================================
 * STORAGE MODULE - Centralized Data Management
 * ========================================
 * 
 * This module provides a comprehensive storage layer for the billing webapp.
 * Features:
 * - LocalStorage wrapper with error handling
 * - Data validation and schema versioning
 * - Backup and restore functionality
 * - Import/export capabilities
 * - Migration support for schema changes
 * - Compression for large datasets
 */

// ========== STORAGE CONFIGURATION ==========
const STORAGE_CONFIG = {
    version: "1.0.0",
    prefix: "attar_",
    keys: {
        inventory: "inventory_v1",
        sales: "sales_v1",
        currentUser: "current_user_v1",
        invoiceSeq: "invoice_seq_",
        settings: "settings_v1",
        backup: "backup_",
    },
    limits: {
        maxBackups: 5,
        maxSalesRecords: 10000,
        maxInventoryItems: 1000,
    },
};

// ========== STORAGE CLASS ==========
class StorageManager {
    constructor(config = STORAGE_CONFIG) {
        this.config = config;
        this.isAvailable = this.checkStorageAvailability();

        if (!this.isAvailable) {
            console.error("LocalStorage is not available!");
        }
    }

    /**
     * Check if localStorage is available
     */
    checkStorageAvailability() {
        try {
            const test = "__storage_test__";
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get the full key with prefix
     */
    getKey(key) {
        return this.config.prefix + key;
    }

    /**
     * Get storage usage information
     */
    getStorageInfo() {
        if (!this.isAvailable) return null;

        let totalSize = 0;
        const items = {};

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.config.prefix)) {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                totalSize += size;
                items[key] = {
                    size: size,
                    sizeKB: (size / 1024).toFixed(2),
                };
            }
        }

        return {
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            itemCount: Object.keys(items).length,
            items: items,
            estimatedLimit: 5120, // 5MB typical limit
            usagePercent: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2),
        };
    }

    /**
     * Generic get method with error handling
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;

        try {
            const fullKey = this.getKey(key);
            const value = localStorage.getItem(fullKey);

            if (value === null) return defaultValue;

            return JSON.parse(value);
        } catch (e) {
            console.error(`Error reading key "${key}":`, e);
            return defaultValue;
        }
    }

    /**
     * Generic set method with error handling
     */
    set(key, value) {
        if (!this.isAvailable) {
            console.error("Storage not available");
            return false;
        }

        try {
            const fullKey = this.getKey(key);
            const serialized = JSON.stringify(value);
            localStorage.setItem(fullKey, serialized);
            return true;
        } catch (e) {
            if (e.name === "QuotaExceededError") {
                console.error("Storage quota exceeded!");
                this.handleQuotaExceeded();
            } else {
                console.error(`Error writing key "${key}":`, e);
            }
            return false;
        }
    }

    /**
     * Remove a key from storage
     */
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            const fullKey = this.getKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error(`Error removing key "${key}":`, e);
            return false;
        }
    }

    /**
     * Clear all app data (with confirmation)
     */
    clearAll() {
        if (!this.isAvailable) return false;

        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.prefix)) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.error("Error clearing storage:", e);
            return false;
        }
    }

    /**
     * Handle quota exceeded error
     */
    handleQuotaExceeded() {
        console.warn("Storage quota exceeded. Attempting cleanup...");

        // Try to clean up old backups
        this.cleanupOldBackups();

        // Try to compress sales data
        this.compressSalesData();
    }

    /**
     * Clean up old backups
     */
    cleanupOldBackups() {
        const backups = this.listBackups();

        if (backups.length > this.config.limits.maxBackups) {
            // Sort by timestamp and remove oldest
            backups.sort((a, b) => a.timestamp - b.timestamp);

            const toRemove = backups.slice(0, backups.length - this.config.limits.maxBackups);
            toRemove.forEach(backup => {
                this.remove(this.config.keys.backup + backup.timestamp);
            });

            console.log(`Cleaned up ${toRemove.length} old backups`);
        }
    }

    /**
     * Compress sales data by removing old records
     */
    compressSalesData() {
        const sales = this.get(this.config.keys.sales, []);

        if (sales.length > this.config.limits.maxSalesRecords) {
            // Keep only recent records
            sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const compressed = sales.slice(0, this.config.limits.maxSalesRecords);

            this.set(this.config.keys.sales, compressed);
            console.log(`Compressed sales data from ${sales.length} to ${compressed.length} records`);
        }
    }

    // ========== INVENTORY METHODS ==========

    /**
     * Get inventory
     */
    getInventory() {
        return this.get(this.config.keys.inventory, []);
    }

    /**
     * Save inventory
     */
    saveInventory(inventory) {
        if (!Array.isArray(inventory)) {
            console.error("Inventory must be an array");
            return false;
        }

        // Validate inventory items
        const validated = inventory.filter(item => {
            return item.id && item.name && typeof item.price === 'number' && typeof item.stock === 'number';
        });

        if (validated.length !== inventory.length) {
            console.warn(`Filtered out ${inventory.length - validated.length} invalid inventory items`);
        }

        return this.set(this.config.keys.inventory, validated);
    }

    /**
     * Add inventory item
     */
    addInventoryItem(item) {
        const inventory = this.getInventory();

        if (inventory.length >= this.config.limits.maxInventoryItems) {
            console.error("Maximum inventory items reached");
            return false;
        }

        inventory.push(item);
        return this.saveInventory(inventory);
    }

    /**
     * Update inventory item
     */
    updateInventoryItem(id, updates) {
        const inventory = this.getInventory();
        const index = inventory.findIndex(item => item.id === id);

        if (index === -1) {
            console.error(`Inventory item with id ${id} not found`);
            return false;
        }

        inventory[index] = { ...inventory[index], ...updates };
        return this.saveInventory(inventory);
    }

    /**
     * Delete inventory item
     */
    deleteInventoryItem(id) {
        const inventory = this.getInventory();
        const filtered = inventory.filter(item => item.id !== id);
        return this.saveInventory(filtered);
    }

    // ========== SALES METHODS ==========

    /**
     * Get sales
     */
    getSales() {
        return this.get(this.config.keys.sales, []);
    }

    /**
     * Save sales
     */
    saveSales(sales) {
        if (!Array.isArray(sales)) {
            console.error("Sales must be an array");
            return false;
        }

        return this.set(this.config.keys.sales, sales);
    }

    /**
     * Add sale record
     */
    addSale(sale) {
        const sales = this.getSales();
        sales.push(sale);
        return this.saveSales(sales);
    }

    /**
     * Get sales by date range
     */
    getSalesByDateRange(startDate, endDate) {
        const sales = this.getSales();
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
    }

    /**
     * Get sales statistics
     */
    getSalesStats(dateStr = null) {
        const sales = dateStr
            ? this.getSales().filter(s => s.date === dateStr)
            : this.getSales();

        const stats = {
            totalSales: sales.length,
            totalRevenue: 0,
            totalItems: 0,
            totalDiscount: 0,
            totalGST: 0,
            averageOrderValue: 0,
        };

        sales.forEach(sale => {
            stats.totalRevenue += sale.totals.grandTotal || 0;
            stats.totalItems += sale.totals.totalQty || 0;
            stats.totalDiscount += sale.totals.discountAmount || 0;
            stats.totalGST += sale.totals.gstAmount || 0;
        });

        stats.averageOrderValue = stats.totalSales > 0
            ? stats.totalRevenue / stats.totalSales
            : 0;

        return stats;
    }

    // ========== USER METHODS ==========

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.get(this.config.keys.currentUser, null);
    }

    /**
     * Save current user
     */
    saveCurrentUser(user) {
        return this.set(this.config.keys.currentUser, user);
    }

    /**
     * Clear current user (logout)
     */
    clearCurrentUser() {
        return this.remove(this.config.keys.currentUser);
    }

    // ========== INVOICE METHODS ==========

    /**
     * Get invoice sequence for a year
     */
    getInvoiceSequence(year) {
        const key = this.config.keys.invoiceSeq + year;
        return this.get(key, 0);
    }

    /**
     * Set invoice sequence for a year
     */
    setInvoiceSequence(year, sequence) {
        const key = this.config.keys.invoiceSeq + year;
        return this.set(key, sequence);
    }

    /**
     * Increment invoice sequence
     */
    incrementInvoiceSequence(year) {
        const current = this.getInvoiceSequence(year);
        const next = current + 1;
        this.setInvoiceSequence(year, next);
        return next;
    }

    // ========== SETTINGS METHODS ==========

    /**
     * Get settings
     */
    getSettings() {
        return this.get(this.config.keys.settings, {
            shopName: "SOOFI ATTARS",
            shopAddress: "6/ 723, 2nd Main Road, Muthamizh nagar, Kodungaiyur, Chennai - 600118",
            shopPhone: "+91-8754143194",
            shopGST: "",
            defaultGSTPercent: 0,
            defaultDiscountPercent: 0,
            currency: "₹",
            dateFormat: "YYYY-MM-DD",
            theme: "light",
        });
    }

    /**
     * Save settings
     */
    saveSettings(settings) {
        return this.set(this.config.keys.settings, settings);
    }

    /**
     * Update specific setting
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }

    // ========== BACKUP & RESTORE ==========

    /**
     * Create a backup of all data
     */
    createBackup(name = null) {
        const timestamp = Date.now();
        const backupName = name || `backup_${new Date().toISOString().split('T')[0]}`;

        const backup = {
            name: backupName,
            timestamp: timestamp,
            version: this.config.version,
            data: {
                inventory: this.getInventory(),
                sales: this.getSales(),
                settings: this.getSettings(),
                invoiceSequences: this.getAllInvoiceSequences(),
            },
        };

        const key = this.config.keys.backup + timestamp;
        const success = this.set(key, backup);

        if (success) {
            this.cleanupOldBackups();
            return { success: true, timestamp, name: backupName };
        }

        return { success: false };
    }

    /**
     * Get all invoice sequences
     */
    getAllInvoiceSequences() {
        const sequences = {};
        const currentYear = new Date().getFullYear();

        // Get sequences for last 5 years
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            const seq = this.getInvoiceSequence(year);
            if (seq > 0) {
                sequences[year] = seq;
            }
        }

        return sequences;
    }

    /**
     * List all backups
     */
    listBackups() {
        const backups = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.getKey(this.config.keys.backup))) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key: key,
                        name: backup.name,
                        timestamp: backup.timestamp,
                        date: new Date(backup.timestamp).toLocaleString(),
                        version: backup.version,
                    });
                } catch (e) {
                    console.error("Error reading backup:", e);
                }
            }
        }

        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Restore from backup
     */
    restoreBackup(timestamp) {
        const key = this.config.keys.backup + timestamp;
        const backup = this.get(key);

        if (!backup) {
            console.error("Backup not found");
            return false;
        }

        try {
            // Restore data
            this.saveInventory(backup.data.inventory || []);
            this.saveSales(backup.data.sales || []);
            this.saveSettings(backup.data.settings || {});

            // Restore invoice sequences
            if (backup.data.invoiceSequences) {
                Object.entries(backup.data.invoiceSequences).forEach(([year, seq]) => {
                    this.setInvoiceSequence(year, seq);
                });
            }

            return true;
        } catch (e) {
            console.error("Error restoring backup:", e);
            return false;
        }
    }

    /**
     * Delete a backup
     */
    deleteBackup(timestamp) {
        const key = this.config.keys.backup + timestamp;
        return this.remove(key);
    }

    // ========== IMPORT & EXPORT ==========

    /**
     * Export all data as JSON
     */
    exportData() {
        const data = {
            version: this.config.version,
            exportDate: new Date().toISOString(),
            inventory: this.getInventory(),
            sales: this.getSales(),
            settings: this.getSettings(),
            invoiceSequences: this.getAllInvoiceSequences(),
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Export data as downloadable file
     */
    downloadExport(filename = null) {
        const data = this.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `attar_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import data from JSON
     */
    importData(jsonString, options = { merge: false }) {
        try {
            const data = JSON.parse(jsonString);

            // Validate data structure
            if (!data.version) {
                throw new Error("Invalid data format: missing version");
            }

            // Import inventory
            if (data.inventory) {
                if (options.merge) {
                    const existing = this.getInventory();
                    const merged = [...existing, ...data.inventory];
                    this.saveInventory(merged);
                } else {
                    this.saveInventory(data.inventory);
                }
            }

            // Import sales
            if (data.sales) {
                if (options.merge) {
                    const existing = this.getSales();
                    const merged = [...existing, ...data.sales];
                    this.saveSales(merged);
                } else {
                    this.saveSales(data.sales);
                }
            }

            // Import settings
            if (data.settings && !options.merge) {
                this.saveSettings(data.settings);
            }

            // Import invoice sequences
            if (data.invoiceSequences && !options.merge) {
                Object.entries(data.invoiceSequences).forEach(([year, seq]) => {
                    this.setInvoiceSequence(year, seq);
                });
            }

            return { success: true, message: "Data imported successfully" };
        } catch (e) {
            console.error("Error importing data:", e);
            return { success: false, message: e.message };
        }
    }

    /**
     * Import from file
     */
    importFromFile(file, options = { merge: false }) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const result = this.importData(e.target.result, options);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };

            reader.readAsText(file);
        });
    }

    // ========== DATA VALIDATION ==========

    /**
     * Validate all data integrity
     */
    validateData() {
        const issues = [];

        // Validate inventory
        const inventory = this.getInventory();
        inventory.forEach((item, index) => {
            if (!item.id) issues.push(`Inventory item ${index} missing ID`);
            if (!item.name) issues.push(`Inventory item ${index} missing name`);
            if (typeof item.price !== 'number') issues.push(`Inventory item ${index} invalid price`);
            if (typeof item.stock !== 'number') issues.push(`Inventory item ${index} invalid stock`);
        });

        // Validate sales
        const sales = this.getSales();
        sales.forEach((sale, index) => {
            if (!sale.id) issues.push(`Sale ${index} missing ID`);
            if (!sale.date) issues.push(`Sale ${index} missing date`);
            if (!sale.items || !Array.isArray(sale.items)) issues.push(`Sale ${index} invalid items`);
        });

        return {
            valid: issues.length === 0,
            issues: issues,
        };
    }

    /**
     * Repair data issues
     */
    repairData() {
        let repaired = 0;

        // Repair inventory
        const inventory = this.getInventory();
        const repairedInventory = inventory.filter(item => {
            if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.stock !== 'number') {
                repaired++;
                return false;
            }
            return true;
        });
        this.saveInventory(repairedInventory);

        // Repair sales
        const sales = this.getSales();
        const repairedSales = sales.filter(sale => {
            if (!sale.id || !sale.date || !sale.items) {
                repaired++;
                return false;
            }
            return true;
        });
        this.saveSales(repairedSales);

        return { repaired: repaired };
    }

    // ========== MIGRATION SUPPORT ==========

    /**
     * Migrate data to new version
     */
    migrate(fromVersion, toVersion) {
        console.log(`Migrating from ${fromVersion} to ${toVersion}`);

        // Add migration logic here as needed
        // Example: if (fromVersion === "1.0.0" && toVersion === "2.0.0") { ... }

        return true;
    }
}

// ========== INITIALIZE STORAGE ==========
const storage = new StorageManager();

// ========== EXPORT ==========
// For use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storage };
}
