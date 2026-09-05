  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append( include("vendor/base.ejs") )
    ; __append("\r\n\r\n")
    ; __line = 3
    ; __append(escapeFn( (labels) ? (labels.inventory) : ('Menu') ))
    ; __append(" Management\r\n\r\n\r\n<link rel=\"stylesheet\" href=\"/static/css/vendor/menu.css\">\r\n\r\n\r\n\r\n<script src=\"/static/js/vendor/menu.js\"></script>\r\n\r\n\r\n\r\n<div class=\"menu-container\">\r\n    <div class=\"menu-header-actions\">\r\n        <h3>Your ")
    ; __line = 16
    ; __append(escapeFn( (labels) ? ((labels.inventory + ' Items')) : ('Menu Items') ))
    ; __append("</h3>\r\n        <button class=\"btn-add-item\" onclick=\"openAddModal()\">\r\n            <i class=\"fa-solid fa-plus\"></i> ")
    ; __line = 18
    ; __append(escapeFn( (labels) ? ('Add Item') : ('Add New Item') ))
    ; __append("\r\n        </button>\r\n    </div>\r\n\r\n    <div class=\"menu-items-grid\">\r\n        ")
    ; __line = 23
    ;  if (items && items.length) { items.forEach(function(item) { 
    ; __append("\r\n        <div class=\"menu-item-card ")
    ; __line = 24
    ;  if (not item.is_available) { 
    ; __append("unavailable")
    ;  } 
    ; __append("\" data-item-id=\"")
    ; __append(escapeFn( item.id ))
    ; __append("\">\r\n            <div class=\"item-image-container\">\r\n                <img src=\"")
    ; __line = 26
    ; __append(escapeFn( (item.image_file) ? (url_for('static', filename='images/food/' + (item.image_file) : ('default.jpg'))) ))
    ; __append("\"\r\n                    class=\"item-image\" alt=\"")
    ; __line = 27
    ; __append(escapeFn( item.name ))
    ; __append("\"\r\n                    onerror=\"this.src='https://via.placeholder.com/300x200?text=No+Image'\">\r\n                <div class=\"availability-toggle\">\r\n                    <label class=\"switch\">\r\n                        <input type=\"checkbox\" ")
    ; __line = 31
    ;  if (item.is_available) { 
    ; __append("checked")
    ;  } 
    ; __append("\r\n                            onchange=\"toggleAvailability(")
    ; __line = 32
    ; __append(escapeFn( item.id ))
    ; __append(", this)\">\r\n                        <span class=\"slider round\"></span>\r\n                    </label>\r\n                </div>\r\n            </div>\r\n\r\n            <div class=\"item-details\">\r\n                <div class=\"item-header\">\r\n                    <h4 class=\"item-name\">")
    ; __line = 40
    ; __append(escapeFn( item.name ))
    ; __append("</h4>\r\n                    <span class=\"category-badge ")
    ; __line = 41
    ; __append(escapeFn( item.category.toLowerCase() ))
    ; __append("\">\r\n                        ")
    ; __line = 42
    ; __append(escapeFn( item.category ))
    ; __append("\r\n                    </span>\r\n                </div>\r\n\r\n                ")
    ; __line = 46
    ;  if (item.sub_name) { 
    ; __append("\r\n                <p class=\"item-description\">")
    ; __line = 47
    ; __append(escapeFn( item.sub_name ))
    ; __append("</p>\r\n                ")
    ; __line = 48
    ;  } 
    ; __append("\r\n\r\n                <div class=\"item-footer\">\r\n                    <div class=\"price-section\">\r\n                        <span class=\"price\">₹")
    ; __line = 52
    ; __append(escapeFn( item.price ))
    ; __append("</span>\r\n                    </div>\r\n\r\n                    <div class=\"action-buttons\">\r\n                        <button class=\"btn-edit\" onclick=\"openEditModal(")
    ; __line = 56
    ; __append(escapeFn( item.id ))
    ; __append(")\" title=\"Edit Item\">\r\n                            <i class=\"fa-solid fa-pen\"></i>\r\n                        </button>\r\n                        <button class=\"btn-delete\" onclick=\"deleteItem(")
    ; __line = 59
    ; __append(escapeFn( item.id ))
    ; __append(")\" title=\"Delete Item\">\r\n                            <i class=\"fa-solid fa-trash\"></i>\r\n                        </button>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        ")
    ; __line = 66
    ;  }); } else { 
    ; __append("\r\n        <div class=\"empty-state\">\r\n            <i class=\"fa-solid ")
    ; __line = 68
    ; __append(escapeFn( (labels) ? (labels.icon) : ('fa-utensils') ))
    ; __append("\"></i>\r\n            <h4>No ")
    ; __line = 69
    ; __append(escapeFn( (labels) ? ((labels.inventory + ' Items')) : ('Menu Items') ))
    ; __append(" Yet</h4>\r\n            <p>Start building your ")
    ; __line = 70
    ; __append(escapeFn( (labels) ? (labels.inventory.toLowerCase()) : ('menu') ))
    ; __append(" by adding your first ")
    ; __append(escapeFn( (labels) ? ('item'.toLowerCase()) : ('item') ))
    ; __append("!</p>\r\n            <button class=\"btn-add-first\" onclick=\"openAddModal()\">\r\n                <i class=\"fa-solid fa-plus\"></i> ")
    ; __line = 72
    ; __append(escapeFn( (labels) ? ('Add Item') : ('Add Your First Item') ))
    ; __append("\r\n            </button>\r\n        </div>\r\n        ")
    ; __line = 75
    ;  } 
    ; __append("\r\n    </div>\r\n</div>\r\n\r\n<!-- Add/Edit Item Modal -->\r\n<div id=\"itemModal\" class=\"modal\">\r\n    <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n            <h3 id=\"modalTitle\">")
    ; __line = 83
    ; __append(escapeFn( (labels) ? ('Add Item') : ('Add New Menu Item') ))
    ; __append("</h3>\r\n            <span class=\"close\" onclick=\"closeModal()\">&times;</span>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <form id=\"itemForm\" method=\"POST\" enctype=\"multipart/form-data\">\r\n                <div class=\"form-group\">\r\n                    <label for=\"itemName\">")
    ; __line = 89
    ; __append(escapeFn( (labels) ? (labels.item_name_label) : ('Item Name') ))
    ; __append(" *</label>\r\n                    <input type=\"text\" id=\"itemName\" name=\"name\" placeholder=\"e.g., Paneer Tikka\" required>\r\n                </div>\r\n\r\n                <div class=\"form-group\">\r\n                    <label for=\"itemDescription\">")
    ; __line = 94
    ; __append(escapeFn( (labels) ? (labels.item_description_label) : ('Description') ))
    ; __append("</label>\r\n                    <input type=\"text\" id=\"itemDescription\" name=\"sub_name\"\r\n                        placeholder=\"e.g., Spicy grilled paneer with herbs\">\r\n                </div>\r\n\r\n                <div class=\"form-row\">\r\n                    <div class=\"form-group\">\r\n                        <label for=\"itemCategory\">")
    ; __line = 101
    ; __append(escapeFn( (labels) ? (labels.category_field) : ('Category') ))
    ; __append(" *</label>\r\n                        <select id=\"itemCategory\" name=\"category\" required>\r\n                            <option value=\"\">Select ")
    ; __line = 103
    ; __append(escapeFn( (labels) ? (labels.category_field) : ('Category') ))
    ; __append("</option>\r\n                            ")
    ; __line = 104
    ;  if (labels and labels.categories) { 
    ; __append("\r\n                            ")
    ; __line = 105
    ;  if (labels.categories) { (labels.categories).forEach(cat => { 
    ; __append("\r\n                            <option value=\"")
    ; __line = 106
    ; __append(escapeFn( cat ))
    ; __append("\">")
    ; __append(escapeFn( cat ))
    ; __append("</option>\r\n                            ")
    ; __line = 107
    ;  }); } 
    ; __append("\r\n                            ")
    ; __line = 108
    ;  } else { 
    ; __append("\r\n                            <option value=\"Veg\">Vegetarian</option>\r\n                            <option value=\"Non-Veg\">Non-Vegetarian</option>\r\n                            <option value=\"Beverages\">Beverages</option>\r\n                            <option value=\"Desserts\">Desserts</option>\r\n                            <option value=\"Snacks\">Snacks</option>\r\n                            ")
    ; __line = 114
    ;  } 
    ; __append("\r\n                        </select>\r\n                    </div>\r\n                    <div class=\"form-group\">\r\n                        <label for=\"itemPrice\">")
    ; __line = 118
    ; __append(escapeFn( (labels) ? (labels.price_label) : ('Price') ))
    ; __append(" (₹) *</label>\r\n                        <input type=\"number\" id=\"itemPrice\" name=\"price\" placeholder=\"180\" min=\"1\" step=\"0.01\" required>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"form-group\">\r\n                    <label for=\"itemImage\">")
    ; __line = 124
    ; __append(escapeFn( (labels) ? ('item') : ('Item') ))
    ; __append(" Photo</label>\r\n                    <div class=\"file-input-container\">\r\n                        <input type=\"file\" id=\"itemImage\" name=\"image\" accept=\"image/*\" class=\"file-input\">\r\n                        <div class=\"file-input-display\">\r\n                            <i class=\"fa-solid fa-camera\"></i>\r\n                            <span class=\"file-text\">Choose photo from device</span>\r\n                        </div>\r\n                        <div id=\"imagePreview\" class=\"image-preview\"></div>\r\n                    </div>\r\n                </div>\r\n\r\n                <div class=\"modal-buttons\">\r\n                    <button type=\"button\" class=\"btn-cancel\" onclick=\"closeModal()\">Cancel</button>\r\n                    <button type=\"submit\" class=\"btn-save\" id=\"saveBtn\">\r\n                        <i class=\"fa-solid fa-plus\"></i> ")
    ; __line = 138
    ; __append(escapeFn( (labels) ? ('Add Item') : ('Add Item') ))
    ; __append("\r\n                    </button>\r\n                </div>\r\n            </form>\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n<!-- Delete Confirmation Modal -->\r\n<div id=\"deleteModal\" class=\"modal\">\r\n    <div class=\"modal-content delete-modal\">\r\n        <div class=\"modal-header\">\r\n            <h3>Delete ")
    ; __line = 150
    ; __append(escapeFn( (labels) ? ('item') : ('Menu Item') ))
    ; __append("</h3>\r\n            <span class=\"close\" onclick=\"closeDeleteModal()\">&times;</span>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n            <div class=\"delete-icon\">\r\n                <i class=\"fa-solid fa-trash-can\"></i>\r\n            </div>\r\n            <p>Are you sure you want to delete this ")
    ; __line = 157
    ; __append(escapeFn( (labels) ? ('item'.toLowerCase()) : ('menu item') ))
    ; __append("?</p>\r\n            <p class=\"delete-warning\">This action cannot be undone.</p>\r\n\r\n            <div class=\"modal-buttons\">\r\n                <button type=\"button\" class=\"btn-cancel\" onclick=\"closeDeleteModal()\">Cancel</button>\r\n                <button type=\"button\" class=\"btn-delete-confirm\" id=\"confirmDeleteBtn\">\r\n                    <i class=\"fa-solid fa-trash\"></i> Delete ")
    ; __line = 163
    ; __append(escapeFn( (labels) ? ('item') : ('Item') ))
    ; __append("\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n")
    ; __line = 169
  }
  return __output;
