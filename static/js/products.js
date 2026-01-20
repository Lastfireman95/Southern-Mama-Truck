// Southern Mommas Delight - Products Page

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Load and display products
async function loadProducts() {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '<div class="loading">Loading menu...</div>';

    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            displayProducts(data.products);
        } else {
            productsList.innerHTML = '<p class="empty-state">Menu coming soon!</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsList.innerHTML = '<p class="error-state">Unable to load menu. Please try again later.</p>';
    }
}

// Display products
function displayProducts(products) {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        
        productItem.innerHTML = `
            <div class="product-image">${product.emoji || '🍽️'}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            </div>
        `;

        productsList.appendChild(productItem);
    });
}
