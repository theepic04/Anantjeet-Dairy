// ---------- Sidebar navigation ----------
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.panel');
  const pageTitle = document.getElementById('pageTitle');
  const pageCrumb = document.getElementById('pageCrumb');
  const productCount = document.getElementById("productCount");
  const ordersCount = document.getElementById("ordersCount");
  const queriesTbody = document.getElementById("queriesTbody");
  const queriesCount = document.getElementById("queriesCount");
  const visitorsCount = document.getElementById("visitorsCount");
  const productsCountDashboard = document.getElementById("productsCountDashboard");
  const ordersCountDashboard = document.getElementById("ordersCountDashboard");
  const revenueCountDashboard = document.getElementById("revenueCountDashboard");
  const reviewsTbody = document.getElementById("reviewsTbody");
  const reviewsCount = document.getElementById("reviewsCount");
  const storeName = document.getElementById("storeName");
  const supportEmail = document.getElementById("supportEmail");
  const deliveryCity = document.getElementById("deliveryCity");
  const openingDays = document.getElementById("openingDays");
  const storeAddress = document.getElementById("storeAddress");
  const facebookLink = document.getElementById("facebookLink");
  const instagramLink = document.getElementById("instagramLink");
  const morningOpen = document.getElementById("morningOpen");
  const morningClose = document.getElementById("morningClose");
  const eveningOpen = document.getElementById("eveningOpen");
  const eveningClose = document.getElementById("eveningClose");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const ownerName = document.getElementById("ownerName");
  const userName = document.getElementById("userName");
  const ownerPassword = document.getElementById("ownerPassword");
  const logoutBtn = document.getElementById("logoutBtn");


  function selectNav(targetId){
    navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
    panels.forEach(p => p.classList.toggle('active', p.id === targetId));
    const activeBtn = document.querySelector('.nav-item.active');
    if(activeBtn){
      const label = activeBtn.textContent.trim().replace(/\d+$/, '').trim();
      pageTitle.textContent = label;
      pageCrumb.textContent = 'Admin / ' + label;
    }
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => selectNav(btn.dataset.target));
  });

  async function loadDashboardStats() {

    try {

        const response =await fetch("/api/dashboard/stats", {
            credentials: "include"
        });


        const result =
            await response.json();

        if (!result.success)
            return;

        visitorsCount.textContent =
            result.stats.visitors;

        productsCountDashboard.textContent =
            result.stats.products;

        ordersCountDashboard.textContent =
            result.stats.orders;

        revenueCountDashboard.textContent =
            "₹" +
            Number(result.stats.revenue)
            .toLocaleString("en-IN");

    }
    catch(error){

        console.error(error);

    }

}

  // ---------- Add / Edit Order modal ----------
  // FRONTEND ONLY — no backend/database is connected yet.
  // TODO: once connected, POST (add) or PATCH (edit) the order to the API instead of
  // building/updating the <tr> directly, then re-render from the server response.
  const addOrderBtn = document.getElementById('addOrderBtn');
  const orderModalOverlay = document.getElementById('orderModalOverlay');
  const orderModalClose = document.getElementById('orderModalClose');
  const orderModalCancel = document.getElementById('orderModalCancel');
  const orderModalTitle = document.getElementById('orderModalTitle');
  const orderModalSaveBtn = document.getElementById('orderModalSaveBtn');
  const addOrderForm = document.getElementById('addOrderForm');
  const ordIdDisplay = document.getElementById('ordIdDisplay');
  const ordCustomer = document.getElementById('ordCustomer');
  const ordDate = document.getElementById('ordDate');
  const ordTime = document.getElementById('ordTime');
  const ordAmount = document.getElementById('ordAmount');
  const ordersTbody = document.querySelector('#panel-orders tbody');
  const orderItemsList = document.getElementById('orderItemsList');
  const addItemBtn = document.getElementById('addItemBtn');

  let editingOrderRow = null;
  let currentOrderItems = [];

  const pencilIconSvg = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20l4.2-.9 10-10a2 2 0 000-2.8l-1.5-1.5a2 2 0 00-2.8 0l-10 10L4 20z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.5 5.5l4 4" stroke="currentColor" stroke-width="1.6"/></svg>';
  const trashIconSvg = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="1.6"/><path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  // Combine a <input type=date> value ("2026-07-20") and <input type=time> value ("11:30")
  // into the display format already used across the dashboard ("20 Jul 2026, 11:30 AM").
  function formatOrderDateTime(dateVal, timeVal){
    if (!dateVal || !timeVal) return '';
    const [y, m, d] = dateVal.split('-').map(Number);
    const [hh, mm] = timeVal.split(':').map(Number);
    const dt = new Date(y, m - 1, d, hh, mm);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const datePart = dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; if (hours === 0) hours = 12;
    return datePart + ', ' + hours + ':' + minutes + ' ' + ampm;
  }

  // Best-effort reverse parse for prefilling the Date/Time inputs when editing an
  // existing row (display text -> {date, time} input values).
  function parseOrderDateTime(text){
    const dt = new Date(text);
    if (isNaN(dt.getTime())) return { date: '', time: '' };
    const date = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0');
    const time = String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0');
    return { date, time };
  }

  function renderOrderItemsList(){
    if (currentOrderItems.length === 0) {
      orderItemsList.innerHTML = '<div class="order-items-empty">No items added yet.</div>';
      return;
    }
    orderItemsList.innerHTML = currentOrderItems.map((item, idx) =>
      '<div class="order-item-row">' +
        '<div><span class="oi-name">' + item.name + '</span><span class="oi-qty">× ' + item.qty + '</span></div>' +
        '<button type="button" class="icon-btn icon-btn-danger" aria-label="Remove item" title="Remove item" onclick="removeOrderItem(' + idx + ')">' + trashIconSvg + '</button>' +
      '</div>'
    ).join('');
  }

  function addOrderItem(name, qty){
    const existing = currentOrderItems.find(i => i.name === name);
    if (existing) {
      existing.qty += qty;
    } else {
      currentOrderItems.push({ name, qty });
    }
    renderOrderItemsList();
    updateOrderAmount();
  }

  function removeOrderItem(idx){
    currentOrderItems.splice(idx, 1);
    renderOrderItemsList();
    updateOrderAmount();
  }

  function updateOrderAmount() {

    let total = 0;

    currentOrderItems.forEach(item => {

        const row = Array.from(productsTbody.querySelectorAll("tr"))
            .find(r =>
                r.querySelector(".strong").textContent.trim() === item.name
            );

        if (!row) return;

        const price = Number(
            row.children[3].textContent
                .replace("₹", "")
                .trim()
        );

        total += price * item.qty;

    });

    ordAmount.value = total.toFixed(2);

}

  function itemsCellHtml(items){
    return items.map(i => '<div>' + i.name + ' × ' + i.qty + '</div>').join('');
  }

  // Fallback parser for any legacy row that only has plain comma-separated item text
  // (e.g. "Milk, Ghee" or "Milk (x2)") and no data-items attribute yet.
  function parseLegacyItemsText(text){
    return text.split(',').map(s => s.trim()).filter(Boolean).map(token => {
      const m = token.match(/^(.*?)\s*\(x(\d+)\)\s*$/i);
      return m ? { name: m[1].trim(), qty: parseInt(m[2], 10) } : { name: token, qty: 1 };
    });
  }

  function openOrderModal(btn){
    if (btn) {
      // Edit mode — prefill from the row
      editingOrderRow = btn.closest('tr');
      const cells = editingOrderRow.querySelectorAll('td');
      orderModalTitle.textContent = 'Edit Order';
      orderModalSaveBtn.textContent = 'Save Changes';
      ordIdDisplay.value = cells[0].textContent.trim();
      ordCustomer.value = cells[1].textContent.trim();

      const dt = parseOrderDateTime(cells[2].textContent.trim());
      ordDate.value = dt.date;
      ordTime.value = dt.time;

      const storedItems = editingOrderRow.dataset.items;
      currentOrderItems = storedItems ? JSON.parse(storedItems) : parseLegacyItemsText(cells[3].textContent.trim());

      updateOrderAmount();
    } else {
      // Add mode
      editingOrderRow = null;
      orderModalTitle.textContent = 'Add Order';
      orderModalSaveBtn.textContent = 'Save Order';
      addOrderForm.reset();
      currentOrderItems = [];
      updateOrderAmount();
      ordIdDisplay.value = nextOrderId();
    }
    renderOrderItemsList();
    orderModalOverlay.classList.add('active');
  }

  function closeOrderModal(){
    orderModalOverlay.classList.remove('active');
    addOrderForm.reset();
    editingOrderRow = null;
    currentOrderItems = [];
    updateOrderAmount();
  }

  addOrderBtn.addEventListener('click', () => openOrderModal(null));
  orderModalClose.addEventListener('click', closeOrderModal);
  orderModalCancel.addEventListener('click', closeOrderModal);
  orderModalOverlay.addEventListener('click', (e) => {
    if (e.target === orderModalOverlay) closeOrderModal();
  });

  function nextOrderId(){
    let maxNum = 1000;
    ordersTbody.querySelectorAll('tr td:first-child').forEach(td => {
      const m = td.textContent.trim().match(/#AD-(\d+)/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    return '#AD-' + (maxNum + 1);
  }

  addOrderForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const customer = ordCustomer.value.trim();
    const dateVal = ordDate.value;
    const timeVal = ordTime.value;

    if (!customer || !dateVal || !timeVal || currentOrderItems.length === 0) {
        alert("Please fill all fields.");
        return;
    }

    // Convert currentOrderItems into backend format
    const items = [];

    for (const item of currentOrderItems) {

        const row = Array.from(productsTbody.querySelectorAll("tr"))
            .find(r =>
                r.querySelector(".strong").textContent.trim() === item.name
            );

        if (!row) continue;

        items.push({
            product_id: Number(row.dataset.id),
            quantity: item.qty
        });

    }

    const orderData = {

        customer_name: customer,

        order_datetime:
            `${dateVal} ${timeVal}:00`,

        items

    };

    try {

        const url = editingOrderRow
            ? `/api/orders/${editingOrderRow.dataset.id}`
            : "/api/orders/add";

        const method = editingOrderRow ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });


        const result = await response.json();

        if (result.success) {

            alert(
                editingOrderRow
                    ? "Order Updated Successfully!"
                    : "Order Added Successfully!"
            );

            closeOrderModal();

            loadOrders();

        }
        else {

            alert(result.message);

        }

    }
    catch (error) {

        console.error(error);

        alert("Server Error");

    }

});

  // ---------- Add Item picker (opens on top of the Add/Edit Order modal) ----------
  const itemPickerOverlay = document.getElementById('itemPickerOverlay');
  const itemPickerClose = document.getElementById('itemPickerClose');
  const itemPickerCancel = document.getElementById('itemPickerCancel');
  const itemPickerSelect = document.getElementById('itemPickerSelect');
  const itemPickerQty = document.getElementById('itemPickerQty');
  const itemPickerMinus = document.getElementById('itemPickerMinus');
  const itemPickerPlus = document.getElementById('itemPickerPlus');
  const itemPickerAddBtn = document.getElementById('itemPickerAddBtn');

  function populateItemPickerOptions(){
    // TODO: once the backend/database is connected, fetch the product list from the
    // API instead of reading it from the Products table currently in the DOM.
    const names = Array.from(document.querySelectorAll('#productsTbody tr td.strong'))
      .map(td => td.textContent.trim());
    itemPickerSelect.innerHTML = names.map(n => '<option value="' + n + '">' + n + '</option>').join('');
  }

  function openItemPicker(){
    populateItemPickerOptions();
    itemPickerQty.value = 1;
    itemPickerOverlay.classList.add('active');
  }

  function closeItemPicker(){
    itemPickerOverlay.classList.remove('active');
  }

  addItemBtn.addEventListener('click', openItemPicker);
  itemPickerClose.addEventListener('click', closeItemPicker);
  itemPickerCancel.addEventListener('click', closeItemPicker);
  itemPickerOverlay.addEventListener('click', (e) => {
    if (e.target === itemPickerOverlay) closeItemPicker();
  });

  itemPickerMinus.addEventListener('click', () => {
    const v = Math.max(1, parseInt(itemPickerQty.value, 10) - 1 || 1);
    itemPickerQty.value = v;
  });
  itemPickerPlus.addEventListener('click', () => {
    const v = (parseInt(itemPickerQty.value, 10) || 1) + 1;
    itemPickerQty.value = v;
  });

  itemPickerAddBtn.addEventListener('click', () => {
    const name = itemPickerSelect.value;
    const qty = Math.max(1, parseInt(itemPickerQty.value, 10) || 1);
    if (!name) return;
    addOrderItem(name, qty);
    closeItemPicker();
  });

  // ---------- Query Details modal ----------
  const queryModalOverlay = document.getElementById('queryModalOverlay');
  const queryModalClose = document.getElementById('queryModalClose');
  const queryModalCloseBtn = document.getElementById('queryModalCloseBtn');

  function closeQueryModal(){ queryModalOverlay.classList.remove('active'); }

  function openQueryModal(btn){
    const row = btn.closest('tr');
    const cells = row.querySelectorAll('td');
    const contactCell = cells[2];
    const contactParts = contactCell.innerHTML.split('<br>');

    document.getElementById('qdName').textContent = cells[0].textContent.trim();
    document.getElementById('qdGender').textContent = cells[1].textContent.trim();
    document.getElementById('qdPhone').textContent = (contactParts[0] || '').trim();
    document.getElementById('qdEmail').textContent = (contactParts[1] || '').trim();
    document.getElementById('qdAddress').textContent = cells[3].getAttribute('title') || cells[3].textContent.trim();
    document.getElementById('qdMessage').textContent = cells[4].getAttribute('title') || cells[4].textContent.trim();
    document.getElementById('qdReceived').textContent = cells[5].textContent.trim();

    queryModalOverlay.classList.add('active');
  }

  queryModalClose.addEventListener('click', closeQueryModal);
  queryModalCloseBtn.addEventListener('click', closeQueryModal);
  queryModalOverlay.addEventListener('click', (e) => {
    if (e.target === queryModalOverlay) closeQueryModal();
  });

  async function loadQueries() {

    try {

        const response = await fetch("/api/queries", {
            credentials: "include"
        })


        const result = await response.json();

        if (!result.success) {

            console.error(result.message);
            return;

        }

        queriesTbody.innerHTML = "";

        queriesCount.textContent =
            `${result.queries.length} message${result.queries.length !== 1 ? "s" : ""} received`;

        result.queries.forEach(query => {

            const tr = document.createElement("tr");

            tr.dataset.id = query.id;

            tr.innerHTML = `

                <td class="strong">
                    ${query.name}
                </td>

                <td class="muted">
                    ${query.gender}
                </td>

                <td class="muted">
                    ${query.phone}<br>
                    ${query.email}
                </td>

                <td
                    class="muted truncate"
                    title="${query.address}">
                    ${query.address}
                </td>

                <td
                    class="muted truncate"
                    title="${query.message}">
                    ${query.message}
                </td>

                <td class="muted">

                    ${(() => {

                        const [datePart,timePart] =
                            query.created_at.split(" ");

                        return formatOrderDateTime(
                            datePart,
                            timePart.substring(0,5)
                        );

                    })()}

                </td>

                <td>

                    <button
                        class="link-btn"
                        onclick="openQueryModal(this)">

                        View

                    </button>

                </td>

            `;

            queriesTbody.appendChild(tr);

        });

    }

    catch(error){

        console.error(error);

    }

}

// Load Orders from Database
async function loadOrders() {

    try {

        const response = await fetch("/api/orders", {
            credentials: "include"
        })


        const result = await response.json();

        ordersTbody.innerHTML = "";

        result.orders.forEach(order => {
            
            const tr = document.createElement("tr");
            ordersCount.textContent = `${result.orders.length} order${result.orders.length !== 1 ? "s" : ""}`;

            tr.dataset.id = order.id;

            tr.dataset.items = JSON.stringify(
                order.items.map(item => ({
                    name: item.product_name,
                    qty: item.quantity
                }))
            );

            tr.innerHTML = `

                <td class="strong">
                    ${order.order_number}
                </td>

                <td>
                    ${order.customer_name}
                </td>

                <td class="muted">
                    ${(() => {
                        const [datePart, timePart] = order.order_datetime.split(" ");
                        return formatOrderDateTime(datePart, timePart.substring(0, 5));
                    })()}
                </td>

                <td class="muted">
                    ${order.items.map(item =>
                        `<div>${item.product_name} × ${item.quantity}</div>`
                    ).join("")}
                </td>

                <td>
                    ₹${order.total_amount}
                </td>

                <td>

                    <div class="row-actions">

                        <button
                            class="icon-btn"
                            title="Edit order"
                            onclick="openOrderModal(this)">

                            ${pencilIconSvg}

                        </button>

                        <button
                            class="icon-btn icon-btn-danger"
                            title="Delete order"
                            onclick="deleteOrder(${order.id})">

                            ${trashIconSvg}

                        </button>

                        <button
                            class="link-btn"
                            onclick="openInvoiceModal(this)">

                            Generate Invoice

                        </button>

                    </div>

                </td>

            `;

            ordersTbody.appendChild(tr);

        });

    }
    catch (error) {

        console.error(error);

    }

}
async function deleteOrder(id) {

    const confirmDelete = confirm("Are you sure you want to delete this order?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `/api/orders/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );


        const result = await response.json();

        if (result.success) {

            alert("Order Deleted Successfully!");

            loadOrders();

        } else {

            alert(result.message);

        }

    }

    catch (error) {

        console.error(error);

        alert("Server Error");

    }

}
//load products from database
async function loadProducts() {

    try {

        const response = await fetch("/api/products");


        const result = await response.json();
        productCount.textContent =
    `${result.data.length} product${result.data.length !== 1 ? "s" : ""} across the catalog`;

        productsTbody.innerHTML = "";

        result.data.forEach(product => {

            const tr = document.createElement("tr");
            tr.dataset.id = product.id;

            tr.innerHTML = `

                <td>
                    <div class="prod-thumb">
                        <img
                            src="/uploads/${product.image}"
                            alt="${product.product_name}"
                            style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"
                        >
                    </div>
                </td>

                <td class="strong">
                    ${product.product_name}
                </td>

                <td class="muted">
                    ${product.description}
                </td>

                <td>
                    ₹${product.price}
                </td>

                <td>

                    <div class="row-actions">

                        <button
                            class="icon-btn"
                            aria-label="Edit product"
                            title="Edit product"
                            onclick="editProduct(this)">

                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M4 20l4.2-.9 10-10a2 2 0 000-2.8l-1.5-1.5a2 2 0 00-2.8 0l-10 10L4 20z"
                                      stroke="currentColor"
                                      stroke-width="1.6"
                                      stroke-linejoin="round"/>
                                <path d="M13.5 5.5l4 4"
                                      stroke="currentColor"
                                      stroke-width="1.6"/>
                            </svg>

                        </button>

                        <button
                            class="icon-btn icon-btn-danger"
                            aria-label="Delete product"
                            title="Delete product"
                            onclick="deleteProduct(${product.id})">

                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M4 7h16"
                                      stroke="currentColor"
                                      stroke-width="1.6"
                                      stroke-linecap="round"/>
                                <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"
                                      stroke="currentColor"
                                      stroke-width="1.6"/>
                                <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"
                                      stroke="currentColor"
                                      stroke-width="1.6"
                                      stroke-linejoin="round"/>
                                <path d="M10 11v6M14 11v6"
                                      stroke="currentColor"
                                      stroke-width="1.6"
                                      stroke-linecap="round"/>
                            </svg>

                        </button>

                    </div>

                </td>

            `;

            productsTbody.appendChild(tr);

        });

    }

    catch (error) {

        console.error(error);

    }

}
async function deleteProduct(id) {

    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `/api/products/${id}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );


        const result = await response.json();

        if (result.success) {

            alert("Product deleted successfully.");

            loadProducts();

        } else {

            alert(result.message);

        }

    }

    catch (error) {

        console.error(error);

        alert("Server Error");

    }

}
  // ---------- Add / Edit Product modal ----------
  // FRONTEND ONLY — no backend/database is connected yet.
  // TODO: once connected, POST (add) or PATCH (edit) the product to the API instead of
  // building/updating the <tr> directly, then re-render from the server response.
  const addProductBtn = document.getElementById('addProductBtn');
  const productModalOverlay = document.getElementById('productModalOverlay');
  const productModalClose = document.getElementById('productModalClose');
  const productModalCancel = document.getElementById('productModalCancel');
  const productModalTitle = document.getElementById('productModalTitle');
  const productModalSaveBtn = document.getElementById('productModalSaveBtn');
  const productForm = document.getElementById('productForm');
  const prodName = document.getElementById('prodName');
  const prodDesc = document.getElementById('prodDesc');
  const prodPrice = document.getElementById('prodPrice');
  const prodImageInput = document.getElementById('prodImageInput');
  const prodImagePreviewWrap = document.getElementById('prodImagePreviewWrap');
  const prodImagePreview = document.getElementById('prodImagePreview');
  const productsTbody = document.getElementById('productsTbody');

 
  let currentProductImage = '';
  let editingProductId = null;

  const defaultThumbSvg = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 16l4-5 3 3 4-6 5 8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>';

  function resetProductForm(){
    productForm.reset();
    currentProductImage = '';
    prodImagePreviewWrap.style.display = 'none';
    prodImagePreview.src = '';
  }

  function editProduct(button) {

    openProductModal(button);

  }

  function openProductModal(btn){
    if (btn) {
      // Edit mode — prefill from the row
      const row = btn.closest("tr");
      editingProductId = row.dataset.id;
      const cells = row.querySelectorAll("td");
      productModalTitle.textContent = 'Edit Product';
      productModalSaveBtn.textContent = 'Save Changes';
      prodName.value = cells[1].textContent.trim();
      prodDesc.value = cells[2].textContent.trim();
      prodPrice.value = cells[3].textContent.replace('₹', '').trim();

      const existingImg = cells[0].querySelector('img');
      if (existingImg) {
        currentProductImage = existingImg.src;
        prodImagePreview.src = currentProductImage;
        prodImagePreviewWrap.style.display = 'block';
      } else {
        currentProductImage = '';
        prodImagePreviewWrap.style.display = 'none';
      }
    } else {
      // Add mode
      editingProductId = null;
      productModalTitle.textContent = 'Add Product';
      productModalSaveBtn.textContent = 'Save Product';
      resetProductForm();
    }
    productModalOverlay.classList.add('active');
  }

  function closeProductModal(){
    productModalOverlay.classList.remove('active');
    resetProductForm();
  }

  addProductBtn.addEventListener('click', () => openProductModal(null));
  productModalClose.addEventListener('click', closeProductModal);
  productModalCancel.addEventListener('click', closeProductModal);
  productModalOverlay.addEventListener('click', (e) => {
    if (e.target === productModalOverlay) closeProductModal();
  });

  prodImageInput.addEventListener('change', () => {
    const file = prodImageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      currentProductImage = e.target.result;
      prodImagePreview.src = currentProductImage;
      prodImagePreviewWrap.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  

  productForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const isEditing = editingProductId !== null;
    const formData = new FormData();

    formData.append("product_name", prodName.value.trim());
    formData.append("description", prodDesc.value.trim());
    formData.append("price", prodPrice.value.trim());

    if (prodImageInput.files.length > 0) {
        formData.append("image", prodImageInput.files[0]);
    }

    try {

        const url = editingProductId
            ? `/api/products/${editingProductId}`
            : "/api/products/add";

        const method = editingProductId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            credentials: "include",
            body: formData
        });


        const result = await response.json();

        if (result.success) {

          closeProductModal();
          loadProducts();

          alert(
              isEditing
                ? "Product Updated Successfully!"
                : "Product Added Successfully!"
          );

          editingProductId = null;

        } 
        else {

            alert(result.message);

        }

    }

    catch (error) {

        console.log(error);

        alert("Server Error");

    }

});

  // ---------- Invoice Preview modal ----------
  // FRONTEND ONLY — no backend is connected yet.
  // TODO: once connected, this can fetch a real generated invoice (or PDF) from the API
  // using the order ID, instead of building the preview from the table row's data.
  const invoiceModalOverlay = document.getElementById('invoiceModalOverlay');
  const invoiceModalClose = document.getElementById('invoiceModalClose');
  const invoiceModalCloseBtn = document.getElementById('invoiceModalCloseBtn');
  const invoiceDownloadBtn = document.getElementById('invoiceDownloadBtn');

  function closeInvoiceModal(){ invoiceModalOverlay.classList.remove('active'); }

  async function openInvoiceModal(btn) {

    const row = btn.closest("tr");
    const orderId = row.dataset.id;

    try {

        const response = await fetch(`/api/orders/${orderId}/invoice`, {
            credentials: "include"
        })


        const result = await response.json();

        if (!result.success) {

            alert(result.message);
            return;

        }

        const invoice = result.invoice;

        document.getElementById("invOrderId").textContent =
            invoice.order_number;

        document.getElementById("invCustomer").textContent =
            invoice.customer_name;

        const [datePart, timePart] =
            invoice.order_datetime.split(" ");

        document.getElementById("invDate").textContent =
            formatOrderDateTime(
                datePart,
                timePart.substring(0,5)
            );

        const tbody =
            document.getElementById("invItemsBody");

        tbody.innerHTML = "";

        invoice.items.forEach(item => {

            tbody.innerHTML += `

                <tr>

                    <td>${item.product_name}</td>

                    <td style="text-align:center;">
                        ${item.quantity}
                    </td>

                    <td style="text-align:right;">
                        ₹${item.price}
                    </td>

                    <td style="text-align:right;">
                        ₹${item.subtotal}
                    </td>

                </tr>

            `;

        });

        document.getElementById("invTotal").textContent =
            `₹${invoice.total_amount}`;

        invoiceModalOverlay.classList.add("active");

    }

    catch(error){

        console.error(error);

        alert("Server Error");

    }

}

  invoiceModalClose.addEventListener('click', closeInvoiceModal);
  invoiceModalCloseBtn.addEventListener('click', closeInvoiceModal);
  invoiceModalOverlay.addEventListener('click', (e) => {
    if (e.target === invoiceModalOverlay) closeInvoiceModal();
  });

  invoiceDownloadBtn.addEventListener('click', () => {
    // Uses the browser print dialog scoped to just the invoice sheet (see @media print
    // rules) — choosing "Save as PDF" there downloads it. TODO: replace with a direct
    // PDF download once the backend can generate one.
    window.print();
  });

  async function loadReviews() {

    try {

        const response = await fetch("/api/reviews");


        const result = await response.json();

        reviewsTbody.innerHTML = "";

        reviewsCount.textContent =
            `${result.reviews.length} review${result.reviews.length !== 1 ? "s" : ""}`;

        result.reviews.forEach(review => {

            let stars = "";

            for (let i = 1; i <= 5; i++) {

                stars +=
                    i <= review.rating
                    ? "★"
                    : "☆";

            }

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td class="strong">
                    ${review.customer_name}
                </td>

                <td class="stars">
                    ${stars}
                </td>

                <td class="muted">
                    ${review.comment}
                </td>

            `;

            reviewsTbody.appendChild(tr);

        });

    }

    catch(error){

        console.error(error);

    }

}

async function loadSettings() {

    try {

        const response = await fetch("/api/settings");

        const result =
        await response.json();

        const s = result.settings;

        storeName.value = s.store_name;
        supportEmail.value = s.support_email;
        deliveryCity.value = s.delivery_city;
        openingDays.value = s.opening_days;
        storeAddress.value = s.store_address;

        facebookLink.value = s.facebook_link;
        instagramLink.value = s.instagram_link;

        morningOpen.value =
        s.morning_open.substring(0,5);

        morningClose.value =
        s.morning_close.substring(0,5);

        eveningOpen.value =
        s.evening_open.substring(0,5);

        eveningClose.value =
        s.evening_close.substring(0,5);

    }

    catch(error){

        console.error(error);

    }

}

saveSettingsBtn.addEventListener("click", async () => {

    try {

        const response = await fetch(

            "/api/settings",

            {

                method:"PUT",
                credentials:"include",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    store_name:storeName.value,

                    support_email:supportEmail.value,

                    delivery_city:deliveryCity.value,

                    opening_days:openingDays.value,

                    store_address:storeAddress.value,

                    facebook_link:facebookLink.value,

                    instagram_link:instagramLink.value,

                    morning_open:morningOpen.value,

                    morning_close:morningClose.value,

                    evening_open:eveningOpen.value,

                    evening_close:eveningClose.value

                })

            }

        );


        const result =
        await response.json();

        alert(result.message);

    }

    catch(error){

        console.error(error);

    }

});

  // ---------- Account settings: show/hide password ----------
  const ownerPwToggle = document.getElementById('ownerPwToggle');
  if (ownerPwToggle && ownerPassword) {
    ownerPwToggle.addEventListener('click', () => {
      const showing = ownerPassword.type === 'text';
      ownerPassword.type = showing ? 'password' : 'text';
      ownerPwToggle.classList.toggle('showing', !showing);
      ownerPwToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
    // Clear the placeholder dots the moment the admin starts typing a new password,
    // so they don't accidentally save "••••••••" as the literal password.
    ownerPassword.addEventListener('focus', () => {
      if (ownerPassword.value === '••••••••') ownerPassword.value = '';
    });
  }

  async function loadAdminProfile() {

    try {

        const response = await fetch("/api/admin/profile", {

            credentials: "include"

        });

        if (response.status === 401) {

            window.location.href = "/admin-login.html";
            return;

        }

        const result =
        await response.json();

        ownerName.value =
            result.admin.name;

        userName.value =
            result.admin.username;

        sideOwnerName.textContent =
            result.admin.name;

        sideAvatarInitial.textContent =
            result.admin.name.charAt(0).toUpperCase();

        ownerPassword.value = "";

    }

    catch(error){

        console.error(error);

    }

}

  // ---------- Account settings: Save ----------
  // FRONTEND ONLY — no backend is connected yet.
  // TODO: once the Node.js backend is live, POST { ownerName, password } to the
  // account-settings endpoint (e.g. /api/admin/account), which should hash the
  // password (e.g. bcrypt) before storing it — never store or transmit it in plain text.
  const accountSettingsSaveBtn = document.getElementById('accountSettingsSaveBtn');
  const ownerNameInput = document.getElementById('ownerName');
  const sideOwnerName = document.getElementById('sideOwnerName');
  const sideAvatarInitial = document.getElementById('sideAvatarInitial');

  function syncSidebarOwnerName(){
    const name = ownerNameInput.value.trim();
    if (!name) return;
    sideOwnerName.textContent = name;
    sideAvatarInitial.textContent = name.charAt(0).toUpperCase();
  }

  if (accountSettingsSaveBtn) {
    syncSidebarOwnerName();
    
    accountSettingsSaveBtn.addEventListener( "click", async () => {

        try {

            const response = await fetch(

                "/api/admin/profile",

                {

                    method:"PUT",
                    credentials:"include",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        name:ownerName.value,

                        username:userName.value,

                        password:ownerPassword.value

                    })

                }

            );


            const result =
            await response.json();

            if(result.success){

                sideOwnerName.textContent =
                    ownerName.value;

                sideAvatarInitial.textContent =
                    ownerName.value.charAt(0).toUpperCase();

            }

            alert(result.message);

            ownerPassword.value = "";

        }

        catch(error){

            console.error(error);

        }

    }
    );
  }

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

        const response = await fetch("/api/admin/logout", {
            method: "POST",
            credentials: "include"
        });

        const result = await response.json();

        if (result.success) {

            window.location.href = "/admin-login.html";

        } else {

            alert(result.message);

        }

    }
    catch (error) {

        console.error(error);
        alert("Logout failed.");

    }

});
}

  loadProducts();
  loadOrders();
  loadQueries();
  loadDashboardStats();
  loadReviews();
  loadSettings();
  loadAdminProfile();