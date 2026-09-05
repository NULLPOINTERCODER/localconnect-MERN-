  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append( include("vendor/base.ejs") )
    ; __append("\r\n\r\nDashboard\r\n\r\n\r\n<link rel=\"stylesheet\" href=\"/static/css/vendor/dashboard.css\">\r\n<link rel=\"stylesheet\" href=\"/static/css/vendor/menu.css\">\r\n<style>\r\n    .quick-reason-btn {\r\n        background: #ecf0f1;\r\n        border: 1px solid #bdc3c7;\r\n        color: #2c3e50;\r\n        padding: 8px 12px;\r\n        border-radius: 20px;\r\n        cursor: pointer;\r\n        font-size: 12px;\r\n        transition: all 0.3s;\r\n    }\r\n\r\n    .quick-reason-btn:hover {\r\n        background: #3498db;\r\n        color: white;\r\n        border-color: #3498db;\r\n    }\r\n</style>\r\n\r\n\r\n\r\n<script src=\"/static/js/vendor/menu.js\"></script>\r\n<script>\r\n    function toggleDashboardStatus(checkbox) {\r\n        const headerStatusText = document.getElementById('statusText');\r\n        const headerToggle = document.getElementById('header_shop_status');\r\n        const dashboardWrapper = document.querySelector('.dashboard-wrapper');\r\n        const isOpen = checkbox.checked;\r\n\r\n        // Update header toggle and text if they exist\r\n        if (headerStatusText) headerStatusText.textContent = isOpen ? 'Open' : 'Closed';\r\n        if (headerToggle) headerToggle.checked = isOpen;\r\n\r\n        // Update dashboard wrapper status\r\n        if (dashboardWrapper) {\r\n            dashboardWrapper.setAttribute('data-status', isOpen ? 'open' : 'closed');\r\n        }\r\n\r\n        // Send AJAX request\r\n        fetch('/toggle_shop_status', {\r\n            method: 'POST',\r\n            headers: {\r\n                'Content-Type': 'application/json',\r\n            },\r\n            body: JSON.stringify({ is_open: isOpen })\r\n        })\r\n            .then(response => response.json())\r\n            .then(data => {\r\n                if (!data.success) {\r\n                    // Revert if failed\r\n                    checkbox.checked = !isOpen;\r\n                    if (headerStatusText) headerStatusText.textContent = !isOpen ? 'Open' : 'Closed';\r\n                    if (headerToggle) headerToggle.checked = !isOpen;\r\n                    if (dashboardWrapper) {\r\n                        dashboardWrapper.setAttribute('data-status', !isOpen ? 'open' : 'closed');\r\n                    }\r\n                }\r\n            })\r\n            .catch(error => {\r\n                console.error('Error:', error);\r\n                // Revert if failed\r\n                checkbox.checked = !isOpen;\r\n                if (headerStatusText) headerStatusText.textContent = !isOpen ? 'Open' : 'Closed';\r\n                if (headerToggle) headerToggle.checked = !isOpen;\r\n                if (dashboardWrapper) {\r\n                    dashboardWrapper.setAttribute('data-status', !isOpen ? 'open' : 'closed');\r\n                }\r\n            });\r\n    }\r\n\r\n    function updateOrderStatus(orderId, status) {\r\n        fetch(`/vendor/orders/${orderId}/status`, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify({ status: status })\r\n        })\r\n            .then(response => response.json())\r\n            .then(data => {\r\n                if (data.success) {\r\n                    if (status === 'Completed') {\r\n                        // Get order amount and show banner\r\n                        const orderCard = document.querySelector(`[data-order-id=\"${orderId}\"]`);\r\n                        const amountText = orderCard.querySelector('.order-amount').textContent;\r\n                        const amount = amountText|replace('₹',''));\r\n                        showEarningsBanner(amount);\r\n\r\n                        // Wait 2 seconds then reload to show updated status and earnings\r\n                        setTimeout(() => location.reload(), 2000);\r\n                    } else {\r\n                        location.reload();\r\n                    }\r\n                }\r\n            })\r\n            .catch(error => {\r\n                console.error('Error:', error);\r\n                alert('Failed to update order status');\r\n            });\r\n    }\r\n\r\n    function showEarningsBanner(amount) {\r\n        // Create overlay\r\n        const overlay = document.createElement('div');\r\n        overlay.style.cssText = `\r\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\r\n        background: rgba(0, 0, 0, 0.5); z-index: 9998;\r\n        display: flex; align-items: center; justify-content: center;\r\n    `;\r\n\r\n        // Create banner\r\n        const banner = document.createElement('div');\r\n        banner.style.cssText = `\r\n        background: #f0f9f0; padding: 40px; border-radius: 16px;\r\n        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\r\n        text-align: center; position: relative; min-width: 300px;\r\n        border: 3px solid #4CAF50; animation: popIn 0.3s ease-out;\r\n    `;\r\n\r\n        banner.innerHTML = `\r\n        <button onclick=\"this.closest('.overlay').remove()\" style=\"\r\n            position: absolute; top: 15px; right: 15px; background: none;\r\n            border: none; font-size: 24px; cursor: pointer; color: #666;\r\n            width: 30px; height: 30px; border-radius: 50%;\r\n        \">×</button>\r\n        <div style=\"font-size: 24px; color: #4CAF50; margin-bottom: 15px; font-weight: 600;\">\r\n            Order Completed 🎉\r\n        </div>\r\n        <div style=\"font-size: 32px; font-weight: bold; color: #2E7D32;\">\r\n            You've Earned ₹${amount}\r\n        </div>\r\n    `;\r\n\r\n        // Add animation\r\n        if (!document.getElementById('popupStyles')) {\r\n            const style = document.createElement('style');\r\n            style.id = 'popupStyles';\r\n            style.textContent = `\r\n            @keyframes popIn {\r\n                from { transform: scale(0.8); opacity: 0; }\r\n                to { transform: scale(1); opacity: 1; }\r\n            }\r\n        `;\r\n            document.head.appendChild(style);\r\n        }\r\n\r\n        overlay.className = 'overlay';\r\n        overlay.appendChild(banner);\r\n        document.body.appendChild(overlay);\r\n\r\n        // Auto close after 10 seconds\r\n        setTimeout(() => {\r\n            if (overlay.parentElement) overlay.remove();\r\n        }, 10000);\r\n    }\r\n\r\n    function updatePendingCount() {\r\n        // Update the pending orders count in the stats card\r\n        const pendingCards = document.querySelectorAll('.order-action-card').length;\r\n        const pendingCountElement = document.querySelector('.orange-bg').parentElement.querySelector('h3');\r\n        if (pendingCountElement) {\r\n            pendingCountElement.textContent = Math.max(0, pendingCards - 1);\r\n        }\r\n    }\r\n\r\n    function submitReject(event) {\r\n        event.preventDefault();\r\n        const orderId = document.getElementById('rejectOrderId').value;\r\n        const reason = document.getElementById('rejectionReason').value;\r\n\r\n        fetch(`/vendor/orders/${orderId}/status`, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify({ status: 'Rejected', rejection_reason: reason })\r\n        })\r\n            .then(res => res.json())\r\n            .then(data => {\r\n                if (data.success) {\r\n                    closeRejectModal();\r\n                    location.reload();\r\n                }\r\n            });\r\n    }\r\n\r\n    function setRejectionReason(reason) {\r\n        document.getElementById('rejectionReason').value = reason;\r\n    }\r\n\r\n    function openRejectModal(orderId) {\r\n        document.getElementById('rejectOrderId').value = orderId;\r\n        document.getElementById('rejectionReason').value = '';\r\n        document.getElementById('rejectModal').style.display = 'block';\r\n    }\r\n\r\n    function closeRejectModal() {\r\n        document.getElementById('rejectModal').style.display = 'none';\r\n    }\r\n\r\n    function toggleItemAvailability(itemId, isAvailable) {\r\n        fetch('/toggle_item/' + itemId, {\r\n            method: 'POST',\r\n            headers: {\r\n                'Content-Type': 'application/json',\r\n            },\r\n            body: JSON.stringify({ is_available: isAvailable })\r\n        })\r\n            .then(response => {\r\n                if (!response.ok) {\r\n                    // Revert toggle if request failed\r\n                    const checkbox = document.querySelector(`input[onchange=\"toggleItemAvailability(${itemId}, this.checked)\"]`);\r\n                    checkbox.checked = !isAvailable;\r\n                    alert('Failed to update item availability');\r\n                }\r\n            })\r\n            .catch(error => {\r\n                console.error('Error:', error);\r\n                // Revert toggle if request failed\r\n                const checkbox = document.querySelector(`input[onchange=\"toggleItemAvailability(${itemId}, this.checked)\"]`);\r\n                checkbox.checked = !isAvailable;\r\n                alert('Failed to update item availability');\r\n            });\r\n    }\r\n\r\n    // Real-time time updates for vendor dashboard\r\n    function updateRelativeTimes() {\r\n        document.querySelectorAll('[data-timestamp]').forEach(element => {\r\n            const timestamp = parseFloat(element.getAttribute('data-timestamp'));\r\n            const orderDate = new Date(timestamp * 1000);\r\n            const now = new Date();\r\n            const diff = (now.getTime() - orderDate.getTime()) / 1000;\r\n\r\n            let relativeText;\r\n            if (diff < 60) {\r\n                relativeText = 'Now';\r\n            } else if (diff < 3600) {\r\n                const mins = Math.floor(diff / 60);\r\n                relativeText = `${mins}m ago`;\r\n            } else if (diff < 86400) {\r\n                const hours = Math.floor(diff / 3600);\r\n                relativeText = `${hours}h ago`;\r\n            } else {\r\n                relativeText = orderDate.toLocaleDateString('en-IN');\r\n            }\r\n\r\n            const time24 = orderDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });\r\n            const time12 = orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/AM|PM/, match => match.charAt(0) + '.M');\r\n\r\n            element.textContent = `${relativeText} | ${time24}(${time12})`;\r\n            element.title = orderDate.toLocaleString('en-IN');\r\n        });\r\n    }\r\n\r\n    // Update times immediately and every 30 seconds\r\n    updateRelativeTimes();\r\n    setInterval(updateRelativeTimes, 30000);\r\n\r\n    // SMS Test Function\r\n    function testSMSNotification() {\r\n        const button = event.currentTarget;\r\n        const originalContent = button.innerHTML;\r\n\r\n        // Show loading state\r\n        button.innerHTML = `\r\n        <div class=\"stat-icon-box purple-bg\">\r\n            <i class=\"fa-solid fa-spinner fa-spin\"></i>\r\n        </div>\r\n        <div class=\"stat-info\">\r\n            <p>SMS Notifications</p>\r\n            <h3 style=\"font-size: 14px;\">Sending...</h3>\r\n        </div>\r\n    `;\r\n        button.style.pointerEvents = 'none';\r\n\r\n        fetch('/api/twilio/test-notification', {\r\n            method: 'POST',\r\n            headers: {\r\n                'Content-Type': 'application/json'\r\n            }\r\n        })\r\n            .then(response => response.json())\r\n            .then(data => {\r\n                if (data.success) {\r\n                    // Show success state\r\n                    button.innerHTML = `\r\n                <div class=\"stat-icon-box green-bg\">\r\n                    <i class=\"fa-solid fa-check\"></i>\r\n                </div>\r\n                <div class=\"stat-info\">\r\n                    <p>SMS Notifications</p>\r\n                    <h3 style=\"font-size: 14px;\">SMS Sent!</h3>\r\n                </div>\r\n            `;\r\n\r\n                    // Show success message\r\n                    showNotification('✅ Test SMS sent successfully! Check your phone.', 'success');\r\n                } else {\r\n                    // Show error state\r\n                    button.innerHTML = `\r\n                <div class=\"stat-icon-box red-bg\">\r\n                    <i class=\"fa-solid fa-exclamation-triangle\"></i>\r\n                </div>\r\n                <div class=\"stat-info\">\r\n                    <p>SMS Notifications</p>\r\n                    <h3 style=\"font-size: 14px;\">Failed</h3>\r\n                </div>\r\n            `;\r\n\r\n                    showNotification('❌ SMS test failed: ' + (data.error || 'Unknown error'), 'error');\r\n                }\r\n\r\n                // Reset button after 3 seconds\r\n                setTimeout(() => {\r\n                    button.innerHTML = originalContent;\r\n                    button.style.pointerEvents = 'auto';\r\n                }, 3000);\r\n            })\r\n            .catch(error => {\r\n                console.error('SMS test error:', error);\r\n\r\n                // Show error state\r\n                button.innerHTML = `\r\n            <div class=\"stat-icon-box red-bg\">\r\n                <i class=\"fa-solid fa-exclamation-triangle\"></i>\r\n            </div>\r\n            <div class=\"stat-info\">\r\n                <p>SMS Notifications</p>\r\n                <h3 style=\"font-size: 14px;\">Error</h3>\r\n            </div>\r\n        `;\r\n\r\n                showNotification('❌ SMS test failed: Network error', 'error');\r\n\r\n                // Reset button after 3 seconds\r\n                setTimeout(() => {\r\n                    button.innerHTML = originalContent;\r\n                    button.style.pointerEvents = 'auto';\r\n                }, 3000);\r\n            });\r\n    }\r\n\r\n    // Notification function\r\n    function showNotification(message, type = 'info') {\r\n        const notification = document.createElement('div');\r\n        notification.style.cssText = `\r\n        position: fixed; top: 20px; right: 20px; z-index: 10000;\r\n        padding: 15px 20px; border-radius: 8px; color: white;\r\n        font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.3);\r\n        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};\r\n        animation: slideIn 0.3s ease-out;\r\n    `;\r\n        notification.textContent = message;\r\n\r\n        // Add slide animation\r\n        if (!document.getElementById('notificationStyles')) {\r\n            const style = document.createElement('style');\r\n            style.id = 'notificationStyles';\r\n            style.textContent = `\r\n            @keyframes slideIn {\r\n                from { transform: translateX(100%); opacity: 0; }\r\n                to { transform: translateX(0); opacity: 1; }\r\n            }\r\n        `;\r\n            document.head.appendChild(style);\r\n        }\r\n\r\n        document.body.appendChild(notification);\r\n\r\n        // Auto remove after 5 seconds\r\n        setTimeout(() => {\r\n            if (notification.parentElement) {\r\n                notification.style.animation = 'slideIn 0.3s ease-out reverse';\r\n                setTimeout(() => notification.remove(), 300);\r\n            }\r\n        }, 5000);\r\n    }\r\n</script>\r\n\r\n\r\n\r\n<div class=\"dashboard-wrapper\" data-status=\"")
    ; __line = 385
    ; __append(escapeFn( (vendor_profile && vendor_profile.is_open) ? ('open') : ('closed') ))
    ; __append("\">\r\n    <div class=\"stats-grid\">\r\n        <div class=\"stat-card\">\r\n            <div class=\"stat-icon-box green-bg\">\r\n                <i class=\"fa-solid fa-bell-concierge\"></i>\r\n            </div>\r\n            <div class=\"stat-info\">\r\n                <p>Today's Orders</p>\r\n                <h3>")
    ; __line = 393
    ; __append(escapeFn( todays_orders ))
    ; __append("</h3>\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"stat-card\">\r\n            <div class=\"stat-icon-box blue-bg\">\r\n                <i class=\"fa-solid fa-wallet\"></i>\r\n            </div>\r\n            <div class=\"stat-info\">\r\n                <p>Today's Earnings</p>\r\n                <h3>₹")
    ; __line = 403
    ; __append(escapeFn( todays_earnings ))
    ; __append("</h3>\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"stat-card\">\r\n            <div class=\"stat-icon-box star-bg\">\r\n                <i class=\"fa-solid fa-star\"></i>\r\n            </div>\r\n            <div class=\"stat-info\">\r\n                <p>Rating</p>\r\n                <h3>")
    ; __line = 413
    ; __append(escapeFn( avg_rating ))
    ; __append(" <span class=\"star-mini\">★</span></h3>\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"stat-card\">\r\n            <div class=\"stat-icon-box orange-bg\">\r\n                <i class=\"fa-solid fa-clock\"></i>\r\n            </div>\r\n            <div class=\"stat-info\">\r\n                <p>Pending Orders</p>\r\n                <h3>")
    ; __line = 423
    ; __append(escapeFn( pending_orders ))
    ; __append("</h3>\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"stat-card\" style=\"cursor: pointer;\" onclick=\"testSMSNotification()\">\r\n            <div class=\"stat-icon-box purple-bg\">\r\n                <i class=\"fa-solid fa-sms\"></i>\r\n            </div>\r\n            <div class=\"stat-info\">\r\n                <p>SMS Notifications</p>\r\n                <h3 style=\"font-size: 14px;\">Test SMS</h3>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"dashboard-section\">\r\n        <div class=\"section-header\">\r\n            <h3>Recent Orders</h3>\r\n            <a href=\"/vendor/orders\" class=\"view-link\">View All <i class=\"fa-solid fa-chevron-right\"></i></a>\r\n        </div>\r\n        <div class=\"orders-grid\">\r\n            ")
    ; __line = 444
    ;  if (orders && orders.length) { orders.forEach(function(order) { 
    ; __append("\r\n            <div class=\"order-card compact\" data-order-id=\"")
    ; __line = 445
    ; __append(escapeFn( order.id ))
    ; __append("\">\r\n                <div class=\"order-header\">\r\n                    <div class=\"order-id\">#")
    ; __line = 447
    ; __append(escapeFn( order.id ))
    ; __append("</div>\r\n                    <div class=\"order-time\" data-timestamp=\"")
    ; __line = 448
    ; __append(escapeFn( order.created_at.getTime() ))
    ; __append("\">")
    ; __append(escapeFn( (order.created_at) ? (order.created_at.toLocaleDateString()) : ('Now') ))
    ; __append(" | ")
    ; __append(escapeFn( (order.created_at) ? (order.created_at.toLocaleDateString()) : ('Now') ))
    ; __append("</div>\r\n                </div>\r\n\r\n                <div class=\"order-content\">\r\n                    <div class=\"order-items-compact\">")
    ; __line = 452
    ; __append(escapeFn( order.items_summary ))
    ; __append("</div>\r\n                    ")
    ; __line = 453
    ;  if (order.customer_suggestion) { 
    ; __append("\r\n                    <div class=\"customer-note\"\r\n                        style=\"background: #f8f9fa; padding: 8px 12px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #3498db;\">\r\n                        <span style=\"font-size: 12px; color: #7f8c8d; font-weight: 600;\">Customer Note:</span>\r\n                        <div style=\"font-size: 13px; color: #2c3e50; margin-top: 2px;\">")
    ; __line = 457
    ; __append(escapeFn( order.customer_suggestion ))
    ; __append("\r\n                        </div>\r\n                    </div>\r\n                    ")
    ; __line = 460
    ;  } 
    ; __append("\r\n                    <div class=\"order-meta\">\r\n                        <span\r\n                            class=\"order-type-compact ")
    ; __line = 463
    ; __append(escapeFn( (order.delivery_type == 'delivery') ? ('delivery') : ('takeaway') ))
    ; __append("\">\r\n                            <i\r\n                                class=\"fa-solid ")
    ; __line = 465
    ; __append(escapeFn( (order.delivery_type == 'delivery') ? ('fa-motorcycle') : ('fa-bag-shopping') ))
    ; __append("\"></i>\r\n                            ")
    ; __line = 466
    ; __append(escapeFn( order.delivery_type ))
    ; __append("\r\n                        </span>\r\n                        <span class=\"order-amount\">₹")
    ; __line = 468
    ; __append(escapeFn( order.total ))
    ; __append("</span>\r\n                        <span class=\"payment-type\">")
    ; __line = 469
    ; __append(escapeFn( (order.payment_type == 'online') ? ('Online') : ('Cash') ))
    ; __append("</span>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"order-status-section\">\r\n                    <div class=\"status-badge-compact status-")
    ; __line = 474
    ; __append(escapeFn( (order.status || 'pending').lower() ))
    ; __append("\"\r\n                        id=\"status-")
    ; __line = 475
    ; __append(escapeFn( order.id ))
    ; __append("\">\r\n                        ")
    ; __line = 476
    ; __append(escapeFn( order.status || 'Pending' ))
    ; __append("\r\n                    </div>\r\n\r\n                    <div class=\"order-actions-compact\" id=\"actions-")
    ; __line = 479
    ; __append(escapeFn( order.id ))
    ; __append("\">\r\n                        ")
    ; __line = 480
    ;  if (not order.status or order.status == 'Pending') { 
    ; __append("\r\n                        <button class=\"btn-action accept\" onclick=\"updateOrderStatus(")
    ; __line = 481
    ; __append(escapeFn( order.id ))
    ; __append(", 'preparing')\">\r\n                            Accept\r\n                        </button>\r\n                        <button class=\"btn-action reject\" onclick=\"openRejectModal(")
    ; __line = 484
    ; __append(escapeFn( order.id ))
    ; __append(")\">\r\n                            Reject\r\n                        </button>\r\n                        ")
    ; __line = 487
    ;  } else if (order.status == 'preparing') { 
    ; __append("\r\n                        <button class=\"btn-action accept\"\r\n                            onclick=\"updateOrderStatus(")
    ; __line = 489
    ; __append(escapeFn( order.id ))
    ; __append(", '")
    ; __append(escapeFn( (order.delivery_type == 'delivery') ? ('out_for_delivery') : ('ready') ))
    ; __append("')\">\r\n                            ")
    ; __line = 490
    ;  if (order.delivery_type == 'takeaway') { 
    ; __append("\r\n                            Ready for Takeaway\r\n                            ")
    ; __line = 492
    ;  }); } else { 
    ; __append("\r\n                            Out for Delivery\r\n                            ")
    ; __line = 494
    ;  } 
    ; __append("\r\n                        </button>\r\n                        ")
    ; __line = 496
    ;  } else if (order.status == 'ready' and order.delivery_type == 'takeaway') { 
    ; __append("\r\n                        <button class=\"btn-action accept\" onclick=\"updateOrderStatus(")
    ; __line = 497
    ; __append(escapeFn( order.id ))
    ; __append(", 'Completed')\">\r\n                            Order Delivered\r\n                        </button>\r\n                        ")
    ; __line = 500
    ;  } 
    ; __append("\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            ")
    ; __line = 504
    ;  } else { 
    ; __append("\r\n            <div class=\"empty-state\" style=\"text-align: center; padding: 40px; color: #666;\">\r\n                <i class=\"fa-solid fa-inbox\" style=\"font-size: 3rem; color: #ddd; margin-bottom: 15px;\"></i>\r\n                <p>No orders yet</p>\r\n            </div>\r\n            ")
    ; __line = 509
    ;  } 
    ; __append("\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"dashboard-section\">\r\n        <div class=\"section-header\">\r\n            <h3>")
    ; __line = 515
    ; __append(escapeFn( (labels) ? (labels.inventory) : ('Menu') ))
    ; __append(" Management</h3>\r\n            <a href=\"/vendor/menu\" class=\"view-link\">View All <i class=\"fa-solid fa-chevron-right\"></i></a>\r\n        </div>\r\n        <div class=\"menu-preview-card\">\r\n            <div class=\"dashboard-table-wrapper\">\r\n                <table class=\"dashboard-table\">\r\n                    <thead>\r\n                        <tr>\r\n                            <th>")
    ; __line = 523
    ; __append(escapeFn( (labels) ? ('item') : ('Item') ))
    ; __append("</th>\r\n                            <th>Price</th>\r\n                            <th>Available</th>\r\n                            <th>Action</th>\r\n                        </tr>\r\n                    </thead>\r\n                    <tbody>\r\n                        ")
    ; __line = 530
    ;  if (menu_items && menu_items.length) { menu_items.forEach(function(item) { 
    ; __append("\r\n                        <tr>\r\n                            <td>")
    ; __line = 532
    ; __append(escapeFn( item.name ))
    ; __append("</td>\r\n                            <td>₹")
    ; __line = 533
    ; __append(escapeFn( item.price ))
    ; __append("</td>\r\n                            <td>\r\n                                <label class=\"switch\">\r\n                                    <input type=\"checkbox\" ")
    ; __line = 536
    ; __append(escapeFn( (item.is_available) ? ('checked') : ('') ))
    ; __append("\r\n                                        onchange=\"toggleItemAvailability(")
    ; __line = 537
    ; __append(escapeFn( item.id ))
    ; __append(", this.checked)\">\r\n                                    <span class=\"slider round\"></span>\r\n                                </label>\r\n                            </td>\r\n                            <td>\r\n                                <div class=\"action-buttons\">\r\n                                    <button class=\"btn-edit\" onclick=\"openEditModal(")
    ; __line = 543
    ; __append(escapeFn( item.id ))
    ; __append(")\" title=\"Edit Item\">\r\n                                        <i class=\"fa-solid fa-pen\"></i>\r\n                                    </button>\r\n                                    <button class=\"btn-delete\" onclick=\"deleteItem(")
    ; __line = 546
    ; __append(escapeFn( item.id ))
    ; __append(")\" title=\"Delete Item\">\r\n                                        <i class=\"fa-solid fa-trash\"></i>\r\n                                    </button>\r\n                                </div>\r\n                            </td>\r\n                        </tr>\r\n                        ")
    ; __line = 552
    ;  }); } else { 
    ; __append("\r\n                        <tr>\r\n                            <td colspan=\"4\" style=\"text-align: center; color: #666; padding: 20px;\">\r\n                                No menu items found. <a href=\"/vendor/menu\" style=\"color: var(--primary-green);\">Add\r\n                                    items</a>\r\n                            </td>\r\n                        </tr>\r\n                        ")
    ; __line = 559
    ;  } 
    ; __append("\r\n                    </tbody>\r\n                </table>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<!-- Add/Edit Item Modal -->\r\n<div id=\"itemModal\" class=\"modal\">\r\n    <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n            <h3 id=\"modalTitle\">")
    ; __line = 571
    ; __append(escapeFn( (labels) ? ('Add Item') : ('Add New Menu Item') ))
    ; __append("</h3>\r\n            <span class=\"close\" onclick=\"closeModal()\">&times;</span>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <form id=\"itemForm\" method=\"POST\" enctype=\"multipart/form-data\">\r\n                <div class=\"form-group\">\r\n                    <label for=\"itemName\">Item Name *</label>\r\n                    <input type=\"text\" id=\"itemName\" name=\"name\" placeholder=\"e.g., Paneer Tikka\" required>\r\n                </div>\r\n\r\n                <div class=\"form-group\">\r\n                    <label for=\"itemDescription\">Description</label>\r\n                    <input type=\"text\" id=\"itemDescription\" name=\"sub_name\"\r\n                        placeholder=\"e.g., Spicy grilled paneer with herbs\">\r\n                </div>\r\n\r\n                <div class=\"form-row\">\r\n                    <div class=\"form-group\">\r\n                        <label for=\"itemCategory\">")
    ; __line = 589
    ; __append(escapeFn( (labels) ? (labels.category_field) : ('Category') ))
    ; __append(" *</label>\r\n                        <select id=\"itemCategory\" name=\"category\" required>\r\n                            <option value=\"\">Select ")
    ; __line = 591
    ; __append(escapeFn( (labels) ? (labels.category_field) : ('Category') ))
    ; __append("</option>\r\n                            ")
    ; __line = 592
    ;  if (labels and labels.categories) { 
    ; __append("\r\n                            ")
    ; __line = 593
    ;  if (labels.categories) { (labels.categories).forEach(cat => { 
    ; __append("\r\n                            <option value=\"")
    ; __line = 594
    ; __append(escapeFn( cat ))
    ; __append("\">")
    ; __append(escapeFn( cat ))
    ; __append("</option>\r\n                            ")
    ; __line = 595
    ;  }); } 
    ; __append("\r\n                            ")
    ; __line = 596
    ;  } else { 
    ; __append("\r\n                            <option value=\"Veg\">Vegetarian</option>\r\n                            <option value=\"Non-Veg\">Non-Vegetarian</option>\r\n                            <option value=\"Beverages\">Beverages</option>\r\n                            <option value=\"Desserts\">Desserts</option>\r\n                            <option value=\"Snacks\">Snacks</option>\r\n                            ")
    ; __line = 602
    ;  } 
    ; __append("\r\n                        </select>\r\n                    </div>\r\n                    <div class=\"form-group\">\r\n                        <label for=\"itemPrice\">")
    ; __line = 606
    ; __append(escapeFn( (labels) ? (labels.price_label) : ('Price') ))
    ; __append(" (₹) *</label>\r\n                        <input type=\"number\" id=\"itemPrice\" name=\"price\" placeholder=\"180\" min=\"1\" step=\"0.01\" required>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"form-group\">\r\n                    <label for=\"itemImage\">")
    ; __line = 612
    ; __append(escapeFn( (labels) ? ('item') : ('Item') ))
    ; __append(" Photo</label>\r\n                    <div class=\"file-input-container\">\r\n                        <input type=\"file\" id=\"itemImage\" name=\"image\" accept=\"image/*\" class=\"file-input\">\r\n                        <div class=\"file-input-display\">\r\n                            <i class=\"fa-solid fa-camera\"></i>\r\n                            <span class=\"file-text\">Choose photo from device</span>\r\n                        </div>\r\n                        <div id=\"imagePreview\" class=\"image-preview\"></div>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"modal-buttons\">\r\n                    <button type=\"button\" class=\"btn-cancel\" onclick=\"closeModal()\">Cancel</button>\r\n                    <button type=\"submit\" class=\"btn-save\" id=\"saveBtn\">\r\n                        <i class=\"fa-solid fa-plus\"></i> ")
    ; __line = 626
    ; __append(escapeFn( (labels) ? ('Add Item') : ('Add Item') ))
    ; __append("\r\n                    </button>\r\n                </div>\r\n            </form>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<!-- Reject Order Modal -->\r\n<div id=\"rejectModal\" class=\"modal\">\r\n    <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n            <h3>Reject Order</h3>\r\n            <span class=\"close\" onclick=\"closeRejectModal()\">&times;</span>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <p>Please provide a reason for rejecting this order:</p>\r\n            <div style=\"margin-bottom: 15px;\">\r\n                <div style=\"display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;\">\r\n                    <button type=\"button\" class=\"quick-reason-btn\"\r\n                        onclick=\"setRejectionReason('Items not available')\">Items not available</button>\r\n                    <button type=\"button\" class=\"quick-reason-btn\" onclick=\"setRejectionReason('Shop is closed')\">Shop\r\n                        is closed</button>\r\n                    <button type=\"button\" class=\"quick-reason-btn\"\r\n                        onclick=\"setRejectionReason('Too busy right now')\">Too busy right now</button>\r\n                    <button type=\"button\" class=\"quick-reason-btn\" onclick=\"setRejectionReason('Payment issue')\">Payment\r\n                        issue</button>\r\n                </div>\r\n            </div>\r\n            <form id=\"rejectForm\" onsubmit=\"submitReject(event)\">\r\n                <input type=\"hidden\" id=\"rejectOrderId\">\r\n                <textarea id=\"rejectionReason\" placeholder=\"Enter rejection reason...\" required\r\n                    style=\"width: 100%; min-height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;\"></textarea>\r\n                <div class=\"modal-buttons\">\r\n                    <button type=\"button\" class=\"btn-cancel\" onclick=\"closeRejectModal()\">Cancel</button>\r\n                    <button type=\"submit\" class=\"btn-delete-confirm\">Reject Order</button>\r\n                </div>\r\n            </form>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<!-- Delete Confirmation Modal -->\r\n<div id=\"deleteModal\" class=\"modal\">\r\n    <div class=\"modal-content delete-modal\">\r\n        <div class=\"modal-header\">\r\n            <h3>Delete Menu Item</h3>\r\n            <span class=\"close\" onclick=\"closeDeleteModal()\">&times;</span>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <div class=\"delete-icon\">\r\n                <i class=\"fa-solid fa-trash-can\"></i>\r\n            </div>\r\n            <p>Are you sure you want to delete this menu item?</p>\r\n            <p class=\"delete-warning\">This action cannot be undone.</p>\r\n\r\n            <div class=\"modal-buttons\">\r\n                <button type=\"button\" class=\"btn-cancel\" onclick=\"closeDeleteModal()\">Cancel</button>\r\n                <button type=\"button\" class=\"btn-delete-confirm\" id=\"confirmDeleteBtn\">\r\n                    <i class=\"fa-solid fa-trash\"></i> Delete Item\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n")
    ; __line = 691
  }
  return __output;
