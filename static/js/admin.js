// Admin Dashboard JavaScript

let currentEditId = null;

// Load schedule on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSchedule();
    loadRequests();
});

// Load all schedule items
async function loadSchedule() {
    try {
        const response = await fetch('/api/admin/schedule');
        if (response.status === 401) {
            window.location.href = '/admin.html';
            return;
        }
        
        const data = await response.json();
        displaySchedule(data.schedule || []);
    } catch (error) {
        console.error('Error loading schedule:', error);
        showMessage('Error loading schedule', 'error');
    }
}

// Display schedule in table
function displaySchedule(schedule) {
    const tbody = document.getElementById('schedule-tbody');
    tbody.innerHTML = '';
    
    if (schedule.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; font-style: italic;">No events scheduled</td></tr>';
        return;
    }
    
    // Sort by date
    schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    schedule.forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${item.time}</td>
            <td>${item.location}</td>
            <td class="action-btns">
                <button class="edit-btn" onclick="editEvent('${item.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteEvent('${item.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Open add modal
function openAddModal() {
    currentEditId = null;
    document.getElementById('modal-title').textContent = 'Add New Event';
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('eventModal').style.display = 'block';
}

// Open edit modal
async function editEvent(id) {
    try {
        const response = await fetch('/api/admin/schedule');
        const data = await response.json();
        const event = data.schedule.find(e => e.id === id);
        
        if (event) {
            currentEditId = id;
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-id').value = id;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('eventModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading event:', error);
        showMessage('Error loading event', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('event-form').reset();
    currentEditId = null;
}

// Handle form submission
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventData = {
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        location: document.getElementById('event-location').value
    };
    
    try {
        let response;
        if (currentEditId) {
            // Update existing event
            response = await fetch(`/api/admin/schedule/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
        } else {
            // Add new event
            response = await fetch('/api/admin/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
        }
        
        if (response.ok) {
            showMessage(currentEditId ? 'Event updated successfully' : 'Event added successfully', 'success');
            closeModal();
            loadSchedule();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showMessage('Error saving event', 'error');
    }
});

// Delete event
async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/schedule/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Event deleted successfully', 'success');
            loadSchedule();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showMessage('Error deleting event', 'error');
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `form-message ${type}`;
    
    setTimeout(() => {
        messageDiv.className = 'form-message';
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeModal();
 

// Load event booking requests
async function loadRequests() {
    try {
        const response = await fetch('/api/admin/requests');
        if (response.status === 401) {
            window.location.href = '/admin.html';
            return;
        }
        
        const data = await response.json();
        displayRequests(data.requests || []);
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Display requests in table
function displayRequests(requests) {
    const tbody = document.getElementById('requests-tbody');
    tbody.innerHTML = '';
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; font-style: italic;">No booking requests</td></tr>';
        return;
    }
    
    requests.forEach((request, index) => {
        const row = document.createElement('tr');
        const eventDate = new Date(request.event_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const submittedDate = new Date(request.submitted_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td><strong>${request.name}</strong></td>
            <td>${eventDate}</td>
            <td>${request.location}</td>
            <td>${request.event_type}</td>
            <td>${request.guest_count}</td>
            <td>
                <div style="font-size: 0.85rem;">
                    <div>${request.email}</div>
                    <div>${request.phone}</div>
                </div>
            </td>
            <td style="font-size: 0.85rem;">${submittedDate}</td>
            <td class="action-btns">
                <button class="delete-btn" onclick="deleteRequest(${index})">Delete</button>
            </td>
        `;
        
        // Add details row if there are additional details
        if (request.details) {
            const detailsRow = document.createElement('tr');
            detailsRow.innerHTML = `
                <td colspan="8" style="background: rgba(200, 90, 23, 0.05); padding: 0.5rem 1rem; font-style: italic;">
                    <strong>Details:</strong> ${request.details}
                </td>
            `;
            tbody.appendChild(row);
            tbody.appendChild(detailsRow);
        } else {
            tbody.appendChild(row);
        }
    });
}

// Delete request
async function deleteRequest(index) {
    if (!confirm('Are you sure you want to delete this booking request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/requests/${index}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Request deleted successfully', 'success');
            loadRequests();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        showMessage('Error deleting request', 'error');
    }
}   }
}
