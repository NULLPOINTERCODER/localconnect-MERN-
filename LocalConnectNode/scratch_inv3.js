  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<!DOCTYPE html>\r\n<html lang=\"en\">\r\n\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>Invoice #")
    ; __line = 7
    ; __append(escapeFn( order.id ))
    ; __append(" - LocalConnect</title>\r\n    <link rel=\"stylesheet\" href=\"/static/css/customer/invoice.css\">\r\n    <link href=\"https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap\" rel=\"stylesheet\">\r\n</head>\r\n\r\n<body>\r\n    <div class=\"invoice-container\">\r\n        <!-- Header Section -->\r\n        <div class=\"invoice-header\">\r\n            <div class=\"company-info\">\r\n                <h1>LocalConnect</h1>\r\n                <p class=\"tagline\">Connecting You Locally</p>\r\n            </div>\r\n            <div class=\"invoice-info\">\r\n                <h2>INVOICE</h2>\r\n                <p class=\"invoice-number\">#")
    ; __line = 22
    ; __append(escapeFn( order.id ))
    ; __append("</p>\r\n                <p class=\"invoice-date\">")
    ; __line = 23
    ; __append(escapeFn( order.created_at.toLocaleDateString() ))
    ; __append("</p>\r\n            </div>\r\n        </div>\r\n\r\n        <!-- Order Summary Cards -->\r\n        <div class=\"summary-cards\">\r\n            <div class=\"summary-card\">\r\n                <div class=\"card-icon\">📅</div>\r\n                <div class=\"card-content\">\r\n                    <p class=\"card-label\">Order Date</p>\r\n                    <p class=\"card-value\">")
    ; __line = 33
    ; __append(escapeFn( order.created_at.toLocaleDateString() ))
    ; __append("</p>\r\n                </div>\r\n            </div>\r\n            <div class=\"summary-card\">\r\n                <div class=\"card-icon\">✅</div>\r\n                <div class=\"card-content\">\r\n                    <p class=\"card-label\">Status</p>\r\n                    <p class=\"card-value\">Delivered</p>\r\n                </div>\r\n            </div>\r\n            <div class=\"summary-card\">\r\n                <div class=\"card-icon\">💳</div>\r\n                <div class=\"card-content\">\r\n                    <p class=\"payment-method\">")
    ; __line = 46
    ; __append(escapeFn( (order.payment_type == 'online') ? 'Online Payment' : ('Cash on ' + (order.delivery_type == 'delivery' ? 'Delivery' : 'Pickup')) ))
    ; __append("</p>\r\n                </div>\r\n            </div>\r\n            <div class=\"summary-card\">\r\n                <div class=\"card-icon\">🛍️</div>\r\n                <div class=\"card-content\">\r\n                    <p class=\"card-label\">Total Items</p>\r\n                    <p class=\"card-value\">")
    ; __line = 53
    ; __append(escapeFn( item_count ))
    ; __append("</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <!-- Party Details -->\r\n        <div class=\"party-details\">\r\n            <div class=\"party-card vendor-card\">\r\n                <h3>From (Vendor)</h3>\r\n                <div class=\"party-info\">\r\n                    <p class=\"party-name\">")
    ; __line = 63
    ; __append(escapeFn( vendor.business_name ))
    ; __append("</p>\r\n                    <p>")
    ; __line = 64
    ; __append(escapeFn( vendor.business_address ))
    ; __append("</p>\r\n                    <p><strong>Phone:</strong> ")
    ; __line = 65
    ; __append(escapeFn( vendor.phone ))
    ; __append("</p>\r\n                    <p><strong>Email:</strong> ")
    ; __line = 66
    ; __append(escapeFn( vendor.email ))
    ; __append("</p>\r\n                </div>\r\n            </div>\r\n            <div class=\"party-card customer-card\">\r\n                <h3>To (Customer)</h3>\r\n                <div class=\"party-info\">\r\n                    <p class=\"party-name\">")
    ; __line = 72
    ; __append(escapeFn( customer.full_name ))
    ; __append("</p>\r\n                    ")
    ; __line = 73
    ;  if (customer.address) { 
    ; __append("\r\n                    <p>")
    ; __line = 74
    ; __append(escapeFn( customer.address ))
    ;  if (customer.city) { 
    ; __append(", ")
    ; __append(escapeFn( customer.city ))
    ;  } 
    ; __append("</p>\r\n                    ")
    ; __line = 75
    ;  if (customer.state || customer.pincode) { 
    ; __append("\r\n                    <p>")
    ; __line = 76
    ;  if (customer.state) { 
    ; __append(escapeFn( customer.state ))
    ;  } 
    ;  if (customer.pincode) { 
    ; __append(" - ")
    ; __append(escapeFn( customer.pincode ))
    ;  } 
    ; __append("</p>\r\n                    ")
    ; __line = 77
    ;  } 
    ; __append("\r\n                    ")
    ; __line = 78
    ;  }); } else { 
    ; __append("\r\n                    <p>Address not provided</p>\r\n                    ")
    ; __line = 80
    ;  } 
    ; __append("\r\n                    <p><strong>Phone:</strong> ")
    ; __line = 81
    ; __append(escapeFn( customer.phone ))
    ; __append("</p>\r\n                    <p><strong>Email:</strong> ")
    ; __line = 82
    ; __append(escapeFn( customer.email ))
    ; __append("</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <!-- Items Table -->\r\n        <div class=\"items-section\">\r\n            <h3>Order Items</h3>\r\n            <table class=\"items-table\">\r\n                <thead>\r\n                    <tr>\r\n                        <th>Item Name</th>\r\n                        <th>Quantity</th>\r\n                        <th>Unit Price</th>\r\n                        <th>Total</th>\r\n                    </tr>\r\n                </thead>\r\n                <tbody>\r\n                    ")
    ; __line = 100
    ;  if (items && items.length) { items.forEach(function(item) { 
    ; __append("\r\n                    <tr>\r\n                        <td>\r\n                            <span class=\"item-name\">")
    ; __line = 103
    ; __append(escapeFn( item.name ))
    ; __append("</span>\r\n                            ")
    ; __line = 104
    ;  if (item.sub_name) { 
    ; __append("\r\n                            <span class=\"item-subname\">")
    ; __line = 105
    ; __append(escapeFn( item.sub_name ))
    ; __append("</span>\r\n                            ")
    ; __line = 106
    ;  } 
    ; __append("\r\n                        </td>\r\n                        <td>")
    ; __line = 108
    ; __append(escapeFn( item.qty ))
    ; __append("</td>\r\n                        <td>₹")
    ; __line = 109
    ; __append(escapeFn( item.price ))
    ; __append("</td>\r\n                        <td>₹")
    ; __line = 110
    ; __append(escapeFn( item.price * item.qty ))
    ; __append("</td>\r\n                    </tr>\r\n                    ")
    ; __line = 112
    ;  }); } 
    ; __append("\r\n                    ")
    ; __line = 113
    ;  if (order.discount_amount && order.discount_amount > 0) { 
    ; __append("\r\n                    <tr class=\"discount-row\">\r\n                        <td colspan=\"3\">\r\n                            <span class=\"discount-label\">Discount Applied (")
    ; __line = 116
    ; __append(escapeFn( order.offer_title || 'Special Offer' ))
    ; __append(")</span>\r\n                        </td>\r\n                        <td class=\"discount-amount\">-₹")
    ; __line = 118
    ; __append(escapeFn( order.discount_amount ))
    ; __append("</td>\r\n                    </tr>\r\n                    ")
    ; __line = 120
    ;  } 
    ; __append("\r\n                    ")
    ; __line = 121
    ;  if (order.delivery_type == 'delivery') { 
    ; __append("\r\n                    <tr class=\"delivery-row\">\r\n                        <td colspan=\"3\">\r\n                            <span class=\"delivery-label\">Home Delivery Charge</span>\r\n                        </td>\r\n                        <td class=\"delivery-amount\">₹30.00</td>\r\n                    </tr>\r\n                    ")
    ; __line = 128
    ;  } 
    ; __append("\r\n                </tbody>\r\n            </table>\r\n        </div>\r\n\r\n        <!-- Total Section -->\r\n        <div class=\"total-section\">\r\n            <div class=\"total-card\">\r\n                <div class=\"total-row grand-total\">\r\n                    <span class=\"total-label\">Grand Total</span>\r\n                    <span class=\"total-amount\">₹")
    ; __line = 138
    ; __append(escapeFn( order.total ))
    ; __append("</span>\r\n                </div>\r\n                <div class=\"amount-words\">\r\n                    <p>Amount in words:</p>\r\n                    <p class=\"words-text\">")
    ; __line = 142
    ; __append(escapeFn( amount_words ))
    ; __append("</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <!-- Footer -->\r\n        <div class=\"invoice-footer\">\r\n            <div class=\"footer-note\">\r\n                <p><strong>Note:</strong> This is a computer-generated invoice and does not require a signature.</p>\r\n                <p>Thank you for choosing LocalConnect!</p>\r\n            </div>\r\n        </div>\r\n\r\n        <!-- Print Button (hidden in PDF) -->\r\n        <div class=\"print-button-container no-print\">\r\n            <button onclick=\"window.print()\" class=\"print-btn\">\r\n                <span>🖨️</span> Download Invoice (PDF)\r\n            </button>\r\n        </div>\r\n    </div>\r\n\r\n    <script>\r\n        // Auto-focus for better UX\r\n        window.onload = function () {\r\n            document.body.classList.add('loaded');\r\n        };\r\n    </script>\r\n</body>\r\n\r\n</html>")
    ; __line = 171
  }
  return __output;
