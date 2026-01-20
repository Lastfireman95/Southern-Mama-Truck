// Southern Mommas Delight - Events Page

// Setup event request form when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupEventForm();
});

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
