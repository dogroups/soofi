# SOOFI ATTARS - Billing & Inventory Management System

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-success)

A comprehensive web-based billing and inventory management system designed specifically for **Soofi Attars**, a perfume and attar retail business. This application provides a complete solution for managing inventory, processing sales, generating invoices, and tracking business analytics—all running entirely in the browser with no backend required.

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [File Structure](#-file-structure)
- [Data Storage](#-data-storage)
- [Authentication](#-authentication)
- [Backup & Recovery](#-backup--recovery)
- [Browser Compatibility](#-browser-compatibility)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### 🏪 Core Functionality

#### **Inventory Management**
- ✅ Add, edit, and delete inventory items
- ✅ Track stock levels in real-time
- ✅ Low stock alerts with visual indicators
- ✅ Support for multiple product types (Attar, Perfume, Body Mist, Others)
- ✅ Price per ML tracking
- ✅ Automatic stock updates after sales

#### **Billing & Invoicing**
- ✅ Create professional invoices with shop branding
- ✅ Add multiple items to a single bill
- ✅ Apply discount percentages
- ✅ Calculate GST automatically
- ✅ Generate unique invoice numbers (auto-incrementing)
- ✅ Customer name and mobile number capture
- ✅ Amount in words conversion
- ✅ Print-ready invoice format
- ✅ PDF download capability
- ✅ WhatsApp sharing integration

#### **Sales Tracking & Reports**
- ✅ View all sales by date
- ✅ Invoice-wise sales summary
- ✅ Item-wise sales breakdown
- ✅ Daily sales statistics
- ✅ Export sales data to CSV
- ✅ Revenue tracking and analytics

#### **Data Management**
- ✅ Local storage-based data persistence
- ✅ Create and restore backups
- ✅ Import/export data in JSON format
- ✅ Data validation and integrity checks
- ✅ Automatic data repair functionality
- ✅ Storage usage monitoring

#### **User Experience**
- ✅ Beautiful, modern UI with premium aesthetics
- ✅ Dark theme with gold accents
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Toast notifications for user feedback
- ✅ Login/logout functionality
- ✅ Role-based access (Admin, Cashier)
- ✅ Smooth animations and transitions

---

## 📸 Screenshots

### Dashboard
The main dashboard provides quick access to billing and inventory modules.

### Billing Interface
Professional billing interface with real-time calculations, discount, and GST support.

### Inventory Management
Comprehensive inventory management with stock tracking and alerts.

### Storage Manager
Advanced data management tools for backups, exports, and system monitoring.

---

## 🛠 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure JS for maximum performance

### Fonts
- **Sahara Scrolls** - Custom decorative font for branding
- **System UI** - Native system fonts for optimal readability

### Storage
- **LocalStorage API** - Client-side data persistence
- **JSON** - Data serialization format

### Design Principles
- **Glassmorphism** - Modern frosted glass effects
- **Gradient backgrounds** - Rich, vibrant color schemes
- **Micro-animations** - Smooth, engaging interactions
- **Responsive design** - Mobile-first approach

---

## 📦 Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or database required!

### Setup Instructions

1. **Download the Application**
   ```bash
   # Clone or download the repository
   git clone https://github.com/yourusername/soofi-attars.git
   cd soofi-attars
   ```

2. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local development server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

3. **Access the Application**
   - Navigate to `http://localhost:8000` (if using a server)
   - Or directly open the `index.html` file

**That's it!** No installation, no dependencies, no configuration needed.

---

## 📖 Usage Guide

### First-Time Setup

1. **Login**
   - Open the application
   - Use demo credentials:
     - **Admin**: username: `admin`, password: `admin123`
     - **Cashier**: username: `cashier`, password: `cashier123`

2. **Add Inventory**
   - Navigate to **Inventory** from the dashboard
   - Click "Add to Inventory"
   - Fill in item details:
     - Item Name (e.g., "Rose Attar")
     - Type (Attar, Perfume, etc.)
     - Price per ML
     - Stock Quantity
   - Submit the form

3. **Create Your First Bill**
   - Navigate to **Billing** from the dashboard
   - Enter customer details (optional)
   - Select items from inventory
   - Add quantities
   - Apply discount/GST if needed
   - Click "Confirm Sale" to update stock
   - Print or download the invoice

### Daily Operations

#### **Processing a Sale**
1. Open the Billing page
2. Enter customer name and mobile number
3. Select items from the dropdown
4. Enter quantity and click "Add to Bill"
5. Repeat for multiple items
6. Apply discount percentage (if any)
7. Set GST percentage (default: 18%)
8. Review the totals
9. Click "Confirm Sale (Update Stock)"
10. Print or share the invoice

#### **Managing Inventory**
- **Add New Items**: Use the inventory form
- **Edit Items**: Click edit button in the inventory table
- **Delete Items**: Click delete button (with confirmation)
- **Check Stock**: View stock levels in the inventory table
- **Low Stock Alerts**: Items with low stock show warning badges

#### **Viewing Sales Reports**
1. Go to Billing page
2. Scroll to "Sales / Reports" section
3. Select a date
4. View invoice-wise and item-wise sales
5. Export to CSV for external analysis

### Advanced Features

#### **Creating Backups**
1. Navigate to **Storage Manager** (link in dashboard)
2. Click "Create Backup"
3. Enter a backup name
4. Backup is saved to local storage

#### **Restoring Data**
1. Go to Storage Manager
2. View list of available backups
3. Click "Restore" on desired backup
4. Confirm the restoration

#### **Exporting Data**
1. Storage Manager → "Export Data"
2. Choose format (JSON or CSV)
3. Download file to your computer

#### **Importing Data**
1. Storage Manager → "Import Data"
2. Select JSON file
3. Choose merge or replace option
4. Confirm import

---

## 📁 File Structure

```
soofi-attars/
│
├── index.html                      # Main dashboard/landing page
├── billing.html                    # Billing and invoicing interface
├── inventory.html                  # Inventory management page
├── storage-manager.html            # Data management and backups
├── storage-demo.html               # Storage system demonstration
│
├── app.js                          # Main application logic
├── storage.js                      # Storage management module
│
├── README.md                       # This file
├── STORAGE_README.md               # Storage system documentation
├── STORAGE_API_REFERENCE.md        # Storage API documentation
├── STORAGE_COMPLETE_PACKAGE.md     # Complete storage package guide
└── STORAGE_MIGRATION_GUIDE.md      # Data migration guide
```

### Key Files Explained

- **index.html**: Dashboard with links to Billing and Inventory modules
- **billing.html**: Complete billing interface with invoice generation
- **inventory.html**: Inventory management with CRUD operations
- **storage-manager.html**: Advanced data management tools
- **app.js**: Core business logic, authentication, and UI interactions
- **storage.js**: Centralized storage module with backup/restore capabilities

---

## 💾 Data Storage

### Storage Architecture

This application uses **browser LocalStorage** for data persistence. All data is stored locally on the user's device.

### Data Structure

#### **Inventory Items**
```javascript
{
  id: "unique_id",
  name: "Rose Attar",
  type: "Attar",
  price: 500,        // Price per ML
  stock: 10          // Available quantity
}
```

#### **Sales Records**
```javascript
{
  id: "sale_id",
  date: "2025-12-06",
  timestamp: "2025-12-06T01:13:38.000Z",
  invoiceNumber: "INV-2025-001",
  customerName: "John Doe",
  customerMobile: "9876543210",
  createdBy: "admin",
  createdByName: "Admin",
  items: [
    { name: "Rose Attar", qty: 2, rate: 500, amount: 1000 }
  ],
  totals: {
    totalQty: 2,
    subtotal: 1000,
    discountPercent: 10,
    discountAmount: 100,
    taxable: 900,
    gstPercent: 18,
    gstAmount: 162,
    grandTotal: 1062
  }
}
```

### Storage Keys

- `attar_inventory_v1` - Inventory items array
- `attar_sales_v1` - Sales records array
- `attar_current_user_v1` - Current logged-in user
- `attar_invoice_seq_YYYY` - Invoice sequence per year
- `attar_settings_v1` - Application settings
- `attar_backup_TIMESTAMP` - Backup snapshots

### Storage Limits

- **Maximum Inventory Items**: 1,000
- **Maximum Sales Records**: 10,000
- **Maximum Backups**: 5 (auto-cleanup of oldest)
- **Typical Storage Limit**: 5-10 MB (browser dependent)

---

## 🔐 Authentication

### User Roles

#### **Admin**
- Full access to all features
- Can manage inventory
- Can process sales
- Can access storage manager
- Can create/restore backups

#### **Cashier**
- Can process sales
- Can view inventory (limited editing)
- Cannot access storage manager
- Cannot create backups

### Demo Credentials

| Username | Password    | Role    |
|----------|-------------|---------|
| admin    | admin123    | Admin   |
| cashier  | cashier123  | Cashier |

### Security Notes

⚠️ **Important**: This is a demo application with hardcoded credentials. For production use:
- Implement proper authentication
- Use secure password hashing
- Add server-side validation
- Implement session management
- Use HTTPS

---

## 💾 Backup & Recovery

### Automatic Backups

The system automatically:
- Cleans up old backups (keeps latest 5)
- Compresses sales data when storage is full
- Validates data integrity

### Manual Backup Process

1. **Create Backup**
   - Go to Storage Manager
   - Click "Create Backup"
   - Enter a descriptive name
   - Backup is created with timestamp

2. **Restore Backup**
   - Select backup from list
   - Click "Restore"
   - Confirm restoration
   - All data is replaced with backup

3. **Export Backup**
   - Click "Export Data"
   - Download JSON file
   - Store safely on external storage

### Best Practices

✅ **Do's**
- Create backups before major changes
- Export data weekly to external storage
- Test restore process periodically
- Keep multiple backup copies

❌ **Don'ts**
- Don't rely solely on browser storage
- Don't clear browser data without backup
- Don't ignore low storage warnings
- Don't skip data validation

---

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |
| Opera   | 76+     | ✅ Fully Supported |

### Required Features

- LocalStorage API
- ES6 JavaScript
- CSS Grid & Flexbox
- Print Media Queries
- File API (for import/export)

### Mobile Support

- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Firefox Mobile 88+
- ✅ Samsung Internet 14+

---

## 🐛 Troubleshooting

### Common Issues

#### **1. Data Not Saving**

**Problem**: Changes are not persisted after page reload.

**Solutions**:
- Check if LocalStorage is enabled in browser settings
- Ensure you're not in Private/Incognito mode
- Check storage quota (Settings → Storage)
- Try clearing browser cache (after backup!)

#### **2. Login Not Working**

**Problem**: Cannot log in with credentials.

**Solutions**:
- Verify username and password (case-sensitive)
- Clear browser cookies and cache
- Check browser console for errors
- Try different browser

#### **3. Invoice Not Printing**

**Problem**: Print dialog doesn't show or prints incorrectly.

**Solutions**:
- Ensure pop-ups are allowed
- Check printer settings
- Try "Print Preview" first
- Use PDF download as alternative

#### **4. Storage Quota Exceeded**

**Problem**: "Storage quota exceeded" error.

**Solutions**:
- Create backup and export data
- Delete old sales records
- Clean up old backups
- Use data compression feature

#### **5. Items Not Showing in Billing**

**Problem**: Inventory items don't appear in billing dropdown.

**Solutions**:
- Verify items are added to inventory
- Check if items have stock > 0
- Refresh the page
- Check browser console for errors

### Getting Help

If you encounter issues not listed here:

1. Check browser console for error messages
2. Verify data integrity using Storage Manager
3. Try the Storage Demo page to test functionality
4. Create a backup before attempting fixes
5. Contact support (see Contact section)

---

## 🤝 Contributing

We welcome contributions to improve this application!

### How to Contribute

1. **Fork the Repository**
   ```bash
   git fork https://github.com/yourusername/soofi-attars.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit Your Changes**
   ```bash
   git commit -m "Add: your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Wait for review

### Development Guidelines

- **Code Style**: Follow existing patterns
- **Comments**: Document complex functions
- **Testing**: Test on multiple browsers
- **Commits**: Use clear, descriptive messages
- **Documentation**: Update README if needed

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Soofi Attars

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

### Business Information

**Soofi Attars**  
*A Divine Fragrance*

📍 **Address**:  
6/723, 2nd Main Road  
Muthamizh Nagar, Kodungaiyur  
Chennai - 600118  
Tamil Nadu, India

📱 **Phone**: +91-8754143194

### Developer Contact

For technical support, bug reports, or feature requests:

- **Email**: support@soofiattars.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/soofi-attars/issues)
- **Website**: [www.soofiattars.com](https://www.soofiattars.com)

---

## 🙏 Acknowledgments

- **Sahara Scrolls Font** - Beautiful decorative typography
- **LocalStorage API** - Browser-based data persistence
- **Open Source Community** - Inspiration and best practices

---

## 📚 Additional Documentation

For more detailed information, please refer to:

- [Storage System Documentation](STORAGE_README.md)
- [Storage API Reference](STORAGE_API_REFERENCE.md)
- [Complete Storage Package Guide](STORAGE_COMPLETE_PACKAGE.md)
- [Data Migration Guide](STORAGE_MIGRATION_GUIDE.md)

---

## 🎯 Roadmap

### Planned Features

- [ ] Multi-language support (Tamil, Hindi, English)
- [ ] Cloud backup integration
- [ ] Barcode scanning for inventory
- [ ] Customer database management
- [ ] Advanced analytics dashboard
- [ ] Email invoice delivery
- [ ] Payment gateway integration
- [ ] Multi-store support
- [ ] Employee management
- [ ] Supplier management

---

## ⭐ Support This Project

If you find this application useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others
- 🤝 Contributing code

---

<div align="center">

**Made with ❤️ for Soofi Attars**

*Empowering small businesses with modern technology*

[⬆ Back to Top](#soofi-attars---billing--inventory-management-system)

</div>
