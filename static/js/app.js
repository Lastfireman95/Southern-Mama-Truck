// Southern Mommas Delight - Frontend JavaScript

// Load schedule data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadSchedule();
    setupEventForm();
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

// Load schedule data when page loads

// Load and display schedule
async function loadSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '<div class="loading">Loading schedule...</div>';

    try {
        const response = await fetch('/api/schedule');
        const data = await response.json();

        if (data.schedule && data.schedule.length > 0) {
            displaySchedule(data.schedule);
        } else {
            scheduleList.innerHTML = '<p class="empty-state">No upcoming locations scheduled. Check back soon!</p>';
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
        scheduleList.innerHTML = '<p class="error-state">Unable to load schedule. Please try again later.</p>';
    }
}

// Display schedule items
function displaySchedule(schedule) {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';

    schedule.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        scheduleItem.innerHTML = `
            <div class="schedule-date">${formattedDate}</div>
            <div class="schedule-time">⏰ ${item.time}</div>
            <div class="schedule-location">📍 ${item.location}</div>
        `;

        scheduleList.appendChild(scheduleItem);
    });
}

// Setup event request form
function setupEventForm() {
    const form = document.getElementById('event-form');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous messages
        messageDiv.className = 'form-message';
        messageDiv.textContent = '';

        // Get form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch('/api/event-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.className = 'form-message success';
                messageDiv.textContent = result.message || 'Thank you for your event request! We will contact you soon.';
                form.reset();
                
                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = result.error || 'Failed to submit request. Please try again.';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'An error occurred. Please try again later.';
        }
    });
}
