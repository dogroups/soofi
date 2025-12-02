// ========== GLOBAL STATE & CONSTANTS ==========
let inventory = [];
let currentBill = [];
let sales = [];
let currentUser = null;

const INVENTORY_KEY = "attar_inventory_v1";
const INVOICE_SEQ_KEY_PREFIX = "attar_invoice_seq_";
const SALES_KEY = "attar_sales_v1";
const CURRENT_USER_KEY = "attar_current_user_v1";

const USERS = [
  { username: "admin",   password: "admin123",   displayName: "Admin",   role: "admin" },
  { username: "cashier", password: "cashier123", displayName: "Cashier", role: "cashier" }
];

// ========== AUTH / LOGIN (shared) ==========
function setCurrentUser(user) {
  currentUser = user || null;
  const app = document.getElementById("app-container");
  const loginScreen = document.getElementById("login-screen");
  const nameSpan = document.getElementById("currentUserName");

  if (currentUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    if (nameSpan) nameSpan.textContent = currentUser.displayName || currentUser.username;
    if (loginScreen) loginScreen.style.display = "none";
    if (app) app.style.display = "block";
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    if (nameSpan) nameSpan.textContent = "-";
    if (app) app.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
  }
}

function canEditInventory() {
  return currentUser && currentUser.role === "admin";
}

function tryAutoLogin() {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) {
    const ls = document.getElementById("login-screen");
    if (ls) ls.style.display = "flex";
    return;
  }
  try {
    const user = JSON.parse(stored);
    setCurrentUser(user);
  } catch {
    const ls = document.getElementById("login-screen");
    if (ls) ls.style.display = "flex";
  }
}

function setCurrentUser(user) {
  currentUser = user || null;
  const app = document.getElementById("app-container");
  const loginScreen = document.getElementById("login-screen");
  const nameSpan = document.getElementById("currentUserName");

  if (currentUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    if (nameSpan) nameSpan.textContent = currentUser.displayName || currentUser.username;
    if (loginScreen) loginScreen.style.display = "none";
    if (app) app.style.display = "block";
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    if (nameSpan) nameSpan.textContent = "-";
    if (app) app.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
  }

  // ✅ Re-render inventory actions based on role (admin vs cashier)
  if (document.getElementById("inventory-section")) {
    renderInventory();
  }
}


function handleLogin() {
  const usernameEl = document.getElementById("login-username");
  const passwordEl = document.getElementById("login-password");
  const errorEl = document.getElementById("login-error");
  if (!usernameEl || !passwordEl) return;

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    if (errorEl) errorEl.textContent = "Invalid username or password.";
    return;
  }

  if (errorEl) errorEl.textContent = "";
  passwordEl.value = "";
  setCurrentUser({
  username: user.username,
  displayName: user.displayName,
  role: user.role
});

}

function initAuthEvents() {
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);

  const loginPassword = document.getElementById("login-password");
  if (loginPassword) {
    loginPassword.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Logout from this device?")) {
        setCurrentUser(null);
      }
    });
  }
}

// ===== TOAST / NOTIFICATION HELPERS =====
function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.warn("Toast container not found");
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icon = document.createElement("div");
  icon.className = "toast-icon";

  if (type === "success") {
    icon.textContent = "✓";
  } else if (type === "error") {
    icon.textContent = "!";
  } else {
    icon.textContent = "i";
  }

  const msg = document.createElement("div");
  msg.className = "toast-message";
  msg.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast-close";
  closeBtn.type = "button";
  closeBtn.innerHTML = "&times;";

  closeBtn.addEventListener("click", () => {
    hideToast(toast);
  });

  toast.appendChild(icon);
  toast.appendChild(msg);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // small delay so CSS transition works
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  if (duration > 0) {
    setTimeout(() => {
      hideToast(toast);
    }, duration);
  }
}

function hideToast(toast) {
  if (!toast) return;
  toast.classList.remove("show");
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 200);
}

// convenience wrappers
function notifySuccess(msg) {
  showToast(msg, "success", 3000);
}
function notifyError(msg) {
  showToast(msg, "error", 4000);
}
function notifyInfo(msg) {
  showToast(msg, "info", 3000);
}




// ========== GENERAL HELPERS ==========
function todayDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ========== INVOICE HELPERS ==========
function getInvoiceSeqKey(year) {
  return INVOICE_SEQ_KEY_PREFIX + String(year);
}

function formatInvoiceNumber(year, seq) {
  const padded = String(seq).padStart(3, "0");
  return `INV-${year}-${padded}`;
}

function initInvoiceNumber() {
  const invoiceInput = document.getElementById("invoiceNumber");
  if (!invoiceInput) return;
  if (invoiceInput.value.trim()) return;

  const today = new Date();
  const year = today.getFullYear();
  const key = getInvoiceSeqKey(year);
  let seq = parseInt(localStorage.getItem(key) || "0", 10);
  if (Number.isNaN(seq)) seq = 0;
  const nextSeq = seq + 1;
  invoiceInput.value = formatInvoiceNumber(year, nextSeq);
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

// ========== NUMBER → WORDS (Indian) ==========
function numberToWordsIndian(num) {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  if (num === 0) return "Zero";

  function twoDigit(n) {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  }

  function threeDigit(n) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (h) {
      str += ones[h] + " Hundred";
      if (rest) str += " ";
    }
    if (rest) str += twoDigit(rest);
    return str;
  }

  let result = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) result += threeDigit(crore) + " Crore";
  if (lakh) {
    if (result) result += " ";
    result += threeDigit(lakh) + " Lakh";
  }
  if (thousand) {
    if (result) result += " ";
    result += threeDigit(thousand) + " Thousand";
  }
  if (hundred) {
    if (result) result += " ";
    result += threeDigit(hundred);
  }

  return result.trim();
}

function amountToWordsIndian(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let parts = [];
  if (rupees > 0) {
    parts.push(numberToWordsIndian(rupees) + " Rupees");
  } else {
    parts.push("Zero Rupees");
  }
  if (paise > 0) {
    parts.push(numberToWordsIndian(paise) + " Paise");
  }
  return parts.join(" and ") + " Only";
}

// ========== INVENTORY PAGE LOGIC ==========
function renderInventory() {
  const tbody = document.getElementById("inventory-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (inventory.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "text-center";
    td.textContent = "No items in inventory yet.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    inventory.forEach((item) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.textContent = item.name;

      const typeTd = document.createElement("td");
      typeTd.textContent = item.type;

      const priceTd = document.createElement("td");
      priceTd.className = "text-right";
      priceTd.textContent = "₹" + item.price.toFixed(2);

      const stockTd = document.createElement("td");
      stockTd.className = "text-center";

      const stockSpan = document.createElement("span");
      stockSpan.textContent = item.stock;

      const badge = document.createElement("span");
      if (item.stock === 0) {
        badge.className = "badge-out badge-low";
        badge.innerHTML = '<span class="status-dot red"></span>Out';
      } else if (item.stock <= 3) {
        badge.className = "badge-low";
        badge.innerHTML = '<span class="status-dot"></span>Low';
      }

      stockTd.appendChild(stockSpan);
      if (item.stock <= 3) {
        stockTd.appendChild(document.createTextNode(" "));
        stockTd.appendChild(badge);
      }

      const actionsTd = document.createElement("td");
      actionsTd.className = "text-center";

      if (canEditInventory()) {
        // ✅ Admin: show + / − / delete
        const addBtn = document.createElement("button");
        addBtn.className = "small-btn";
        addBtn.textContent = "+";
        addBtn.title = "Increase stock by 1";
        addBtn.addEventListener("click", () => adjustStock(item.id, 1));

        const minusBtn = document.createElement("button");
        minusBtn.className = "small-btn";
        minusBtn.style.marginLeft = "4px";
        minusBtn.textContent = "−";
        minusBtn.title = "Decrease stock by 1";
        minusBtn.addEventListener("click", () => adjustStock(item.id, -1));

        const delBtn = document.createElement("button");
        delBtn.className = "small-btn danger";
        delBtn.style.marginLeft = "4px";
        delBtn.textContent = "✕";
        delBtn.title = "Delete item";
        delBtn.addEventListener("click", () => deleteItem(item.id));

        actionsTd.appendChild(addBtn);
        actionsTd.appendChild(minusBtn);
        actionsTd.appendChild(delBtn);
      } else {
        // 👀 Cashier: view-only
        actionsTd.textContent = "-";
      }

      tr.appendChild(nameTd);
      tr.appendChild(typeTd);
      tr.appendChild(priceTd);
      tr.appendChild(stockTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  const countEl = document.getElementById("inventory-count");
  if (countEl) {
    const totalItems = inventory.length;
    const totalQty = inventory.reduce((sum, i) => sum + i.stock, 0);
    countEl.textContent = `${totalItems} Items • ${totalQty} In Stock`;
  }
}

function adjustStock(id, delta) {
  if (!canEditInventory()) return; // extra safety

  const item = inventory.find((i) => i.id === id);
  if (!item) return;
  const newStock = item.stock + delta;
  if (newStock < 0) return;
  item.stock = newStock;
  saveInventory();
  renderInventory();
}

function deleteItem(id) {
  if (!canEditInventory()) return; // extra safety

  if (!confirm("Remove this item from inventory?")) return;
  inventory = inventory.filter((i) => i.id !== id);
  saveInventory();
  renderInventory();
}

function initInventoryPage() {
  const form = document.getElementById("inventory-form");
  if (form) {
    form.addEventListener("submit", (e) => {
  e.preventDefault();

  // 🚫 Cashier cannot add inventory
  if (!canEditInventory()) {
    notifyError("You don't have permission to modify inventory. (Cashier view-only)");
    return;
  }
      const nameEl = document.getElementById("itemName");
      const typeEl = document.getElementById("itemType");
      const priceEl = document.getElementById("itemPrice");
      const stockEl = document.getElementById("itemStock");
      if (!nameEl || !typeEl || !priceEl || !stockEl) return;

      const name = nameEl.value.trim();
      const type = typeEl.value;
      const priceVal = parseFloat(priceEl.value);
      const stockVal = parseInt(stockEl.value, 10);

      if (!name) {
        notifyError("Please enter item name.");
        return;
      }
   if (Number.isNaN(priceVal) || priceVal < 0) {
  notifyError("Please enter a valid price.");
  return;
}
      if (Number.isNaN(stockVal) || stockVal < 0) {
        notifyError("Please enter a valid stock quantity.");
        return;
      }

      inventory.push({
        id: generateId(),
        name,
        type,
        price: priceVal,
        stock: stockVal,
      });

      saveInventory();
      renderInventory();
      form.reset();
    });
  }

  renderInventory();
}

// ========== BILLING & SALES LOGIC ==========
function renderProductSelect() {
  const select = document.getElementById("billItem");
  if (!select) return;

  select.innerHTML = "";

  if (inventory.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.selected = true;
    opt.textContent = "Add inventory items first";
    select.appendChild(opt);
    select.disabled = true;
    return;
  }

  select.disabled = false;

  inventory.forEach((item) => {
    const billQtyForItem = currentBill
      .filter((line) => line.itemId === item.id)
      .reduce((sum, l) => sum + l.qty, 0);

    const remaining = item.stock - billQtyForItem;

    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.name} (${item.type}) • ₹${item.price.toFixed(
      2
    )} • Stock: ${remaining}`;
    if (remaining <= 0) {
      opt.disabled = true;
      opt.textContent += " (Out)";
    }
    select.appendChild(opt);
  });
}

function calculateTotals() {
  const subtotal = currentBill.reduce((sum, l) => sum + l.amount, 0);
  const totalQty = currentBill.reduce((sum, l) => sum + l.qty, 0);

  const discountInput = document.getElementById("discountPercent");
  const gstInput = document.getElementById("gstPercent");

  const discountPercentRaw = discountInput ? parseFloat(discountInput.value) : 0;
  const gstPercentRaw = gstInput ? parseFloat(gstInput.value) : 0;

  const discountPercent = Number.isNaN(discountPercentRaw)
    ? 0
    : Math.max(discountPercentRaw, 0);
  const gstPercent = Number.isNaN(gstPercentRaw)
    ? 0
    : Math.max(gstPercentRaw, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const taxable = Math.max(subtotal - discountAmount, 0);
  const gstAmount = taxable * (gstPercent / 100);
  const grandTotal = taxable + gstAmount;

  return {
    totalQty,
    subtotal,
    discountPercent,
    discountAmount,
    taxable,
    gstPercent,
    gstAmount,
    grandTotal,
  };
}

function updateTotalsDisplay() {
  const totals = calculateTotals();

  const discountLabel =
    totals.discountPercent > 0
      ? `${totals.discountPercent.toFixed(1)}%`
      : "0%";
  const gstLabel =
    totals.gstPercent > 0 ? `${totals.gstPercent.toFixed(1)}%` : "0%";

  const subtotalDisplay = document.getElementById("subtotalDisplay");
  const discountDisplay = document.getElementById("discountDisplay");
  const taxableDisplay = document.getElementById("taxableDisplay");
  const gstDisplay = document.getElementById("gstDisplay");
  const grandTotalDisplay = document.getElementById("grandTotalDisplay");
  const wordsDisplay = document.getElementById("amountInWordsDisplay");

  if (subtotalDisplay)
    subtotalDisplay.textContent = "₹" + totals.subtotal.toFixed(2);
  if (discountDisplay)
    discountDisplay.textContent =
      "-₹" + totals.discountAmount.toFixed(2) + " (" + discountLabel + ")";
  if (taxableDisplay)
    taxableDisplay.textContent = "₹" + totals.taxable.toFixed(2);
  if (gstDisplay)
    gstDisplay.textContent =
      "₹" + totals.gstAmount.toFixed(2) + " (" + gstLabel + ")";
  if (grandTotalDisplay)
    grandTotalDisplay.textContent = "₹" + totals.grandTotal.toFixed(2);

  if (wordsDisplay) {
    const words = amountToWordsIndian(totals.grandTotal);
    wordsDisplay.textContent = words;
  }

  const pill = document.getElementById("bill-summary-pill");
  if (pill) {
    pill.textContent = `${totals.totalQty} Items • ₹${totals.grandTotal.toFixed(
      2
    )}`;
  }
}

function renderBill() {
  const tbody = document.getElementById("bill-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (currentBill.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.className = "text-center";
    td.textContent = "No items in bill.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    let totalQty = 0;

    currentBill.forEach((line, idx) => {
      const tr = document.createElement("tr");

      const idxTd = document.createElement("td");
      idxTd.textContent = idx + 1;

      const nameTd = document.createElement("td");
      nameTd.textContent = line.name;

      const qtyTd = document.createElement("td");
      qtyTd.className = "text-center";
      qtyTd.textContent = line.qty;

      const rateTd = document.createElement("td");
      rateTd.className = "text-right";
      rateTd.textContent = "₹" + line.rate.toFixed(2);

      const amountTd = document.createElement("td");
      amountTd.className = "text-right";
      amountTd.textContent = "₹" + line.amount.toFixed(2);

      const removeTd = document.createElement("td");
      removeTd.className = "text-center";
      const rmBtn = document.createElement("button");
      rmBtn.className = "small-btn danger";
      rmBtn.textContent = "✕";
      rmBtn.title = "Remove from bill";
      rmBtn.addEventListener("click", () => {
        currentBill = currentBill.filter((l) => l.itemId !== line.itemId);
        renderBill();
        renderProductSelect();
      });
      removeTd.appendChild(rmBtn);

      tr.appendChild(idxTd);
      tr.appendChild(nameTd);
      tr.appendChild(qtyTd);
      tr.appendChild(rateTd);
      tr.appendChild(amountTd);
      tr.appendChild(removeTd);

      tbody.appendChild(tr);
      totalQty += line.qty;
    });

    const totals = calculateTotals();

    const totalTr = document.createElement("tr");
    totalTr.className = "totals-row";

    const tdLabel = document.createElement("td");
    tdLabel.colSpan = 2;
    tdLabel.textContent = "Items Total";

    const tdQty = document.createElement("td");
    tdQty.className = "text-center";
    tdQty.textContent = totalQty;

    const tdBlank = document.createElement("td");
    const tdTotal = document.createElement("td");
    tdTotal.className = "text-right";
    tdTotal.textContent = "₹" + totals.subtotal.toFixed(2);

    const tdEmpty = document.createElement("td");

    totalTr.appendChild(tdLabel);
    totalTr.appendChild(tdQty);
    totalTr.appendChild(tdBlank);
    totalTr.appendChild(tdTotal);
    totalTr.appendChild(tdEmpty);

    tbody.appendChild(totalTr);
  }

  updateTotalsDisplay();
}

function generateInvoicePDF() {
  if (!currentBill.length) {
    notifyInfo("No items in bill to generate PDF.");
    return;
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    notifyInfo("jsPDF library not loaded.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const shopName = "SOOFI ATTARS";
  const shopAddress = "6/ 723, 2 nd Main Road, Muthamizh nagar, <br>Kodungaiyur, Chennai - 600118";
  const shopPhone = "Phone: +91-8754143194";
  const shopGST = "";

  const customerName =
    (document.getElementById("customerName")?.value.trim()) || "Customer";
 const customerMobile =
  (document.getElementById("customerMobile")?.value.trim()) || "";
  const invoiceNumber =
    (document.getElementById("invoiceNumber")?.value.trim()) || "N/A";
  const invoiceDate =
    document.getElementById("invoiceDate")?.value || new Date().toLocaleDateString();

  const totals = calculateTotals();
  const amountWords = amountToWordsIndian(totals.grandTotal);

  let y = 10;

  doc.setFontSize(14);
  doc.text(shopName, 10, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(shopAddress, 10, y);
  y += 4;
  doc.text(shopPhone, 10, y);
  y += 4;
  doc.text(shopGST, 10, y);

  y += 8;
  doc.setFontSize(11);
  doc.text(`Invoice: ${invoiceNumber}`, 10, y);
  doc.text(`Date: ${invoiceDate}`, 140, y);
  y += 6;
  doc.text(`Customer: ${customerName}`, 10, y);

  y += 8;
  doc.setFontSize(10);
  doc.text("S.No", 10, y);
  doc.text("Item", 25, y);
  doc.text("Qty", 110, y);
  doc.text("Rate", 130, y);
  doc.text("Amount", 160, y);
  y += 4;
  doc.line(10, y, 200, y);
  y += 4;

  doc.setFontSize(9);
  currentBill.forEach((line, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(idx + 1), 10, y);
    doc.text(line.name, 25, y);
    doc.text(String(line.qty), 110, y, { align: "right" });
    doc.text(line.rate.toFixed(2), 140, y, { align: "right" });
    doc.text(line.amount.toFixed(2), 180, y, { align: "right" });
    y += 5;
  });

  y += 2;
  doc.line(120, y, 200, y);
  y += 5;

  doc.setFontSize(10);
  doc.text("Subtotal:", 130, y);
  doc.text(totals.subtotal.toFixed(2), 180, y, { align: "right" });
  y += 5;
  doc.text(`Discount (${totals.discountPercent.toFixed(1)}%):`, 130, y);
  doc.text(`-${totals.discountAmount.toFixed(2)}`, 180, y, { align: "right" });
  y += 5;
  doc.text("Taxable:", 130, y);
  doc.text(totals.taxable.toFixed(2), 180, y, { align: "right" });
  y += 5;
  doc.text(`GST (${totals.gstPercent.toFixed(1)}%):`, 130, y);
  doc.text(totals.gstAmount.toFixed(2), 180, y, { align: "right" });
  y += 6;
  doc.setFontSize(11);
  doc.text("Grand Total:", 130, y);
  doc.text(totals.grandTotal.toFixed(2), 180, y, { align: "right" });

  y += 8;
  doc.setFontSize(9);
  doc.text("Amount in Words:", 10, y);
  y += 5;
  const splitWords = doc.splitTextToSize(amountWords, 180);
  doc.text(splitWords, 10, y);

  doc.save(`${invoiceNumber || "invoice"}.pdf`);
}

function shareBillViaWhatsApp() {
  if (!currentBill.length) {
    notifyError("No items in bill to share.");
    return;
  }

  const customerName =
    (document.getElementById("customerName")?.value.trim()) || "Customer";
  const invoiceNumber =
    (document.getElementById("invoiceNumber")?.value.trim()) || "N/A";
  const invoiceDate =
    document.getElementById("invoiceDate")?.value || new Date().toLocaleDateString();
  const totals = calculateTotals();
  const amountWords = amountToWordsIndian(totals.grandTotal);

  let message = `Invoice ${invoiceNumber}\nDate: ${invoiceDate}\nCustomer: ${customerName}\n\nItems:\n`;

  currentBill.forEach((line, idx) => {
    message += `${idx + 1}. ${line.name} x ${line.qty} @ ₹${line.rate.toFixed(
      2
    )} = ₹${line.amount.toFixed(2)}\n`;
  });

  message += `\nSubtotal: ₹${totals.subtotal.toFixed(2)}`;
  message += `\nDiscount (${totals.discountPercent.toFixed(
    1
  )}%): -₹${totals.discountAmount.toFixed(2)}`;
  message += `\nTaxable: ₹${totals.taxable.toFixed(2)}`;
  message += `\nGST (${totals.gstPercent.toFixed(
    1
  )}%): ₹${totals.gstAmount.toFixed(2)}`;
  message += `\nGrand Total: ₹${totals.grandTotal.toFixed(2)}`;
  message += `\n\nAmount in words: ${amountWords}`;
  message += `\n\n(Please find attached invoice PDF.)`;

  const url = "https://wa.me/?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// ========== SALES + XLSX EXPORT ==========
function renderSalesForDate(dateStr) {
  const tbody = document.getElementById("sales-body");
  const itemTbody = document.getElementById("item-sales-body");
  const pill = document.getElementById("sales-summary-pill");
  const summaryText = document.getElementById("sales-summary-text");

  if (!tbody || !itemTbody || !pill || !summaryText) return;

  tbody.innerHTML = "";
  itemTbody.innerHTML = "";

  const filtered = sales.filter((s) => s.date === dateStr);
  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "text-center";
    td.textContent = "No sales for selected date.";
    tr.appendChild(td);
    tbody.appendChild(tr);

    const itr = document.createElement("tr");
    const itd = document.createElement("td");
    itd.colSpan = 3;
    itd.className = "text-center";
    itd.textContent = "No item-wise sales for selected date.";
    itr.appendChild(itd);
    itemTbody.appendChild(itr);

    pill.textContent = "0 Invoices • ₹0.00";
    summaryText.textContent = "No sales for selected date.";
    return;
  }

  let totalInvoices = filtered.length;
  let totalItems = 0;
  let totalAmount = 0;

  filtered
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .forEach((sale, idx) => {
      const tr = document.createElement("tr");

      const time = new Date(sale.timestamp);
      const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const itemsQty = sale.totals.totalQty;
      totalItems += itemsQty;
      totalAmount += sale.totals.grandTotal;

      const idxTd = document.createElement("td");
      idxTd.textContent = idx + 1;

      const timeTd = document.createElement("td");
      timeTd.textContent = timeStr;

      const invTd = document.createElement("td");
      invTd.textContent = sale.invoiceNumber;

      const custTd = document.createElement("td");
      custTd.textContent = sale.customerName;

      const mobileTd = document.createElement("td");
      mobileTd.textContent = sale.customerMobile || "-";
 
      const userTd = document.createElement("td");
      userTd.textContent = sale.createdByName || sale.createdBy || "-";

      const itemsTd = document.createElement("td");
      itemsTd.className = "text-right";
      itemsTd.textContent = itemsQty;

      const amtTd = document.createElement("td");
      amtTd.className = "text-right";
      amtTd.textContent = "₹" + sale.totals.grandTotal.toFixed(2);

      tr.appendChild(idxTd);
      tr.appendChild(timeTd);
      tr.appendChild(invTd);
      tr.appendChild(custTd);
      tr.appendChild(mobileTd);
      tr.appendChild(userTd);
      tr.appendChild(itemsTd);
      tr.appendChild(amtTd);

      tbody.appendChild(tr);
    });

  pill.textContent = `${totalInvoices} Invoices • ₹${totalAmount.toFixed(2)}`;
  summaryText.textContent = `Invoices: ${totalInvoices} • Items sold: ${totalItems} • Total sales: ₹${totalAmount.toFixed(
    2
  )}`;

  const itemMap = new Map();
  filtered.forEach((sale) => {
    sale.items.forEach((line) => {
      const key = line.name;
      if (!itemMap.has(key)) {
        itemMap.set(key, { name: line.name, qty: 0, amount: 0 });
      }
      const agg = itemMap.get(key);
      agg.qty += line.qty;
      agg.amount += line.amount;
    });
  });

  const itemList = Array.from(itemMap.values()).sort(
    (a, b) => b.amount - a.amount
  );

  if (itemList.length === 0) {
    const itr = document.createElement("tr");
    const itd = document.createElement("td");
    itd.colSpan = 3;
    itd.className = "text-center";
    itd.textContent = "No item-wise sales for selected date.";
    itr.appendChild(itd);
    itemTbody.appendChild(itr);
  } else {
    itemList.forEach((item) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.textContent = item.name;

      const qtyTd = document.createElement("td");
      qtyTd.className = "text-right";
      qtyTd.textContent = item.qty;

      const amountTd = document.createElement("td");
      amountTd.className = "text-right";
      amountTd.textContent = "₹" + item.amount.toFixed(2);

      tr.appendChild(nameTd);
      tr.appendChild(qtyTd);
      tr.appendChild(amountTd);

      itemTbody.appendChild(tr);
    });
  }
}

// --- helper: sales → 2D array (for XLSX) ---
function salesToRows(salesArray) {
  const header = [
    "Date",
    "Time",
    "Invoice",
    "Customer",
    "CustomerMobile",
    "CreatedBy",
    "TotalQty",
    "Subtotal",
    "DiscountPercent",
    "DiscountAmount",
    "Taxable",
    "GSTPercent",
    "GSTAmount",
    "GrandTotal",
  ];
  const rows = [header];

  salesArray.forEach((sale) => {
    const d = new Date(sale.timestamp);
    const dateStr = sale.date;
    const timeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    rows.push([
      dateStr,
      timeStr,
      sale.invoiceNumber,
      sale.customerName,
      sale.customerMobile || "",
      sale.createdByName || sale.createdBy || "",
      sale.totals.totalQty,
      sale.totals.subtotal.toFixed(2),
      sale.totals.discountPercent.toFixed(2),
      sale.totals.discountAmount.toFixed(2),
      sale.totals.taxable.toFixed(2),
      sale.totals.gstPercent.toFixed(2),
      sale.totals.gstAmount.toFixed(2),
      sale.totals.grandTotal.toFixed(2),
    ]);
  });

  return rows;
}

// --- XLSX download (instead of CSV) ---
function downloadXlsx(filename, rows) {
  if (typeof XLSX === "undefined") {
    notifyError("XLSX library not loaded.");
    return;
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sales");
  XLSX.writeFile(wb, filename);
}

function exportSalesForDay() {
  const salesDateInput = document.getElementById("salesDate");
  const dateStr = (salesDateInput && salesDateInput.value) || todayDateString();
  const filtered = sales.filter((s) => s.date === dateStr);
  if (!filtered.length) {
    notifyError("No sales for selected date.");
    return;
  }
  const rows = salesToRows(filtered);
  downloadXlsx(`sales_${dateStr}.xlsx`, rows);
}

function exportSalesAll() {
  if (!sales.length) {
    notifyError("No sales recorded yet.");
    return;
  }
  const rows = salesToRows(sales);
  downloadXlsx("sales_all.xlsx", rows);
}

// ========== INIT BILLING PAGE ==========
function initBillingPage() {
  // date defaults
  const todayStr = todayDateString();
  const invoiceDate = document.getElementById("invoiceDate");
  if (invoiceDate && !invoiceDate.value) invoiceDate.value = todayStr;
  const salesDate = document.getElementById("salesDate");
  if (salesDate && !salesDate.value) salesDate.value = todayStr;

  initInvoiceNumber();
  renderProductSelect();
  renderBill();
  if (salesDate) renderSalesForDate(salesDate.value);

  // billing form
  const billingForm = document.getElementById("billing-form");
  if (billingForm) {
    billingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (inventory.length === 0) {
        notifyError("Add some items in Inventory page first.");
        return;
      }

      const itemSelect = document.getElementById("billItem");
      const qtyInput = document.getElementById("billQty");
      if (!itemSelect || !qtyInput) return;

      const itemId = itemSelect.value;
      const qtyVal = parseInt(qtyInput.value, 10);
      if (!itemId) {
        notifyError("Please select an item.");
        return;
      }
      if (Number.isNaN(qtyVal) || qtyVal <= 0) {
        notifyError("Please enter a valid quantity.");
        return;
      }

      const item = inventory.find((i) => i.id === itemId);
      if (!item) {
        notifyError("Item not found in inventory.");
        return;
      }

      const existingLine = currentBill.find((line) => line.itemId === itemId);
      const alreadyInBillQty = existingLine ? existingLine.qty : 0;
      const totalRequested = alreadyInBillQty + qtyVal;

      if (totalRequested > item.stock) {
        notifyError(
          `Not enough stock. Available: ${item.stock}. Already in bill: ${alreadyInBillQty}.`
        );
        return;
      }

      if (existingLine) {
        existingLine.qty += qtyVal;
        existingLine.amount = existingLine.qty * existingLine.rate;
      } else {
        currentBill.push({
          itemId: item.id,
          name: item.name,
          qty: qtyVal,
          rate: item.price,
          amount: qtyVal * item.price,
        });
      }

      renderBill();
      renderProductSelect();
    });
  }

  // discount/gst inputs
  ["discountPercent", "gstPercent"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        updateTotalsDisplay();
      });
    }
  });

  // confirm sale
  const confirmSaleBtn = document.getElementById("confirm-sale-btn");
  if (confirmSaleBtn) {
    confirmSaleBtn.addEventListener("click", () => {
      if (!currentUser) {
        notifyError("Please login first.");
        return;
      }

      if (!currentBill.length) {
        notifyError("No items in bill.");
        return;
      }

      for (const line of currentBill) {
        const item = inventory.find((i) => i.id === line.itemId);
        if (!item) {
          notifyError(`Item "${line.name}" no longer exists in inventory.`);
          return;
        }
        if (line.qty > item.stock) {
          notifyError(
            `Not enough stock for "${line.name}". Available: ${item.stock}, in bill: ${line.qty}.`
          );
          return;
        }
      }

      currentBill.forEach((line) => {
        const item = inventory.find((i) => i.id === line.itemId);
        item.stock -= line.qty;
      });

      saveInventory(); // shared with inventory.html

      const totals = calculateTotals();
      const customerName =
        (document.getElementById("customerName")?.value.trim()) || "Customer";

      const invoiceDateVal = document.getElementById("invoiceDate")?.value;
      const saleDate = invoiceDateVal || todayDateString();

      const invoiceNumber = assignInvoiceNumberIfNeeded();
      const amountWords = amountToWordsIndian(totals.grandTotal);

      const saleRecord = {
        id: generateId(),
        date: saleDate,
        timestamp: new Date().toISOString(),
        invoiceNumber,
        customerName,
	customerMobile,
        createdBy: currentUser.username,
        createdByName: currentUser.displayName || currentUser.username,
        totals: { ...totals },
        items: currentBill.map((line) => ({
          name: line.name,
          qty: line.qty,
          rate: line.rate,
          amount: line.amount,
        })),
      };
      sales.push(saleRecord);
      saveSales();

      const salesDateInput = document.getElementById("salesDate");
      if (salesDateInput) {
        salesDateInput.value = saleDate;
        renderSalesForDate(saleDate);
      }

      notifySuccess(
        `Sale confirmed.\nUser: ${
          currentUser.displayName || currentUser.username
        }\nCustomer: ${customerName}\nInvoice: ${invoiceNumber}\nGrand Total (incl. GST): ₹${totals.grandTotal.toFixed(
          2
        )}\nAmount in words: ${amountWords}`
      );

      currentBill = [];
      renderBill();
      renderProductSelect();
      initInvoiceNumber();
    });
  }

  // clear bill
  const clearBillBtn = document.getElementById("clear-bill-btn");
  if (clearBillBtn) {
    clearBillBtn.addEventListener("click", () => {
      if (!currentBill.length) return;
      if (!confirm("Clear current bill?")) return;
      currentBill = [];
      renderBill();
      renderProductSelect();
    });
  }

  // print / pdf / whatsapp
  const printBillBtn = document.getElementById("print-bill-btn");
  if (printBillBtn) {
    printBillBtn.addEventListener("click", () => {
      window.print();
    });
  }

  const pdfBillBtn = document.getElementById("pdf-bill-btn");
  if (pdfBillBtn) {
    pdfBillBtn.addEventListener("click", generateInvoicePDF);
  }

  const whatsappBillBtn = document.getElementById("whatsapp-bill-btn");
  if (whatsappBillBtn) {
    whatsappBillBtn.addEventListener("click", shareBillViaWhatsApp);
  }

  // export buttons (XLSX)
  const exportDayBtn = document.getElementById("export-sales-day-btn");
  if (exportDayBtn) {
    exportDayBtn.addEventListener("click", exportSalesForDay);
  }

  const exportAllBtn = document.getElementById("export-sales-all-btn");
  if (exportAllBtn) {
    exportAllBtn.addEventListener("click", exportSalesAll);
  }

  // sales date change
  if (salesDate) {
    salesDate.addEventListener("change", (e) => {
      const dateStr = e.target.value || todayDateString();
      renderSalesForDate(dateStr);
    });
  }
}

// ========== MASTER INIT ==========
window.addEventListener("load", () => {
  initAuthEvents();
  tryAutoLogin();

  loadInventory();
  loadSales();

  // If this page has inventory section => init inventory page
  if (document.getElementById("inventory-section")) {
    initInventoryPage();
  }

  // If this page has billing section => init billing page
  if (document.getElementById("billing-section")) {
    initBillingPage();
  }
});
