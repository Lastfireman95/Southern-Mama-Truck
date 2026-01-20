# Southern Mommas Delight 🍴

A mobile food truck storefront website for Southern Mommas Delight. This application allows customers to view upcoming locations and times where the food truck will be, and submit requests for the truck to attend private events.

## Features

- **Schedule Display**: View upcoming dates, times, and locations where the food truck will be
- **Event Booking**: Submit requests for the food truck to attend your events
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern Stack**: Built with HTML, CSS, JavaScript, and Python (Flask)

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python 3.x with Flask
- **Data Storage**: JSON files

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Lastfireman95/Southern-Mama-Truck.git
   cd Southern-Mama-Truck
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

The application will be running and ready to use!

## Usage

### Viewing the Schedule

The homepage automatically displays all upcoming locations where Southern Mommas Delight will be. The schedule shows:
- Date (formatted as day of week, month, day, year)
- Time range
- Location address or venue name

### Booking an Event

To request Southern Mommas Delight for your event:

1. Scroll down to the "Book Us for Your Event" section
2. Fill out the event request form with:
   - Your name
   - Email address
   - Phone number
   - Event date
   - Location
   - Event type (Birthday, Wedding, Corporate, Festival, or Other)
   - Expected guest count
   - Any additional details
3. Click "Submit Request"
4. You'll receive a confirmation message upon successful submission

Event requests are stored in `data/event_requests.json` for the business owner to review.

## Managing Schedule (For Admins)

To add new locations to the schedule, you can either:

1. **Manually edit the schedule file**:
   - Open `data/schedule.json`
   - Add new entries following the existing format:
     ```json
     {
       "date": "2026-02-15",
       "time": "11:00 AM - 3:00 PM",
       "location": "Your Location Here"
     }
     ```

2. **Use the API endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/schedule \
     -H "Content-Type: application/json" \
     -d '{
       "date": "2026-02-15",
       "time": "11:00 AM - 3:00 PM",
       "location": "Your Location Here"
     }'
   ```

## Project Structure

```
Southern-Mama-Truck/
├── app.py                  # Flask backend server
├── index.html              # Main homepage
├── requirements.txt        # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css      # Styling
│   └── js/
│       └── app.js         # Frontend JavaScript
├── data/
│   ├── schedule.json      # Schedule data
│   └── event_requests.json # Event booking requests
└── README.md
```

## API Endpoints

- `GET /` - Serve the main webpage
- `GET /api/schedule` - Get upcoming schedule
- `POST /api/event-request` - Submit an event booking request
- `POST /api/schedule` - Add a new schedule item (admin)

## License

All rights reserved © 2026 Southern Mommas Delight