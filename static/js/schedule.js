// Southern Mommas Delight - Schedule Page

// Load schedule data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSchedule();
});

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
