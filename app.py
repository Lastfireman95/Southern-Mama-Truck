from flask import Flask, jsonify, request, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')

# Path to data files
SCHEDULE_FILE = 'data/schedule.json'
REQUESTS_FILE = 'data/event_requests.json'
PRODUCTS_FILE = 'data/products.json'

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Initialize data files if they don't exist
if not os.path.exists(SCHEDULE_FILE):
    with open(SCHEDULE_FILE, 'w') as f:
        json.dump({'schedule': []}, f)

if not os.path.exists(REQUESTS_FILE):
    with open(REQUESTS_FILE, 'w') as f:
        json.dump({'requests': []}, f)

if not os.path.exists(PRODUCTS_FILE):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump({'products': []}, f)


@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')


@app.route('/products.html')
def products():
    """Serve the products page"""
    return send_from_directory('.', 'products.html')


@app.route('/events.html')
def events():
    """Serve the events page"""
    return send_from_directory('.', 'events.html')


@app.route('/api/products', methods=['GET'])
def get_products():
    """Get the list of products"""
    try:
        with open(PRODUCTS_FILE, 'r') as f:
            data = json.load(f)
        
        return jsonify({'products': data.get('products', [])})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """Get the schedule of upcoming locations"""
    try:
        with open(SCHEDULE_FILE, 'r') as f:
            data = json.load(f)
        
        # Sort schedule by date
        schedule = data.get('schedule', [])
        schedule.sort(key=lambda x: x['date'])
        
        # Filter out past dates
        today = datetime.now().date().isoformat()
        upcoming_schedule = [item for item in schedule if item['date'] >= today]
        
        return jsonify({'schedule': upcoming_schedule})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/event-request', methods=['POST'])
def submit_event_request():
    """Submit an event booking request"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'event_date', 'location', 'event_type', 'guest_count']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Add timestamp
        data['submitted_at'] = datetime.now().isoformat()
        data['status'] = 'pending'
        
        # Load existing requests
        with open(REQUESTS_FILE, 'r') as f:
            requests_data = json.load(f)
        
        # Add new request
        requests_data['requests'].append(data)
        
        # Save updated requests
        with open(REQUESTS_FILE, 'w') as f:
            json.dump(requests_data, f, indent=2)
        
        return jsonify({
            'message': 'Thank you for your event request! We will contact you soon.',
            'status': 'success'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/schedule', methods=['POST'])
def add_schedule_item():
    """Add a new schedule item (admin endpoint)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['date', 'time', 'location']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Load existing schedule
        with open(SCHEDULE_FILE, 'r') as f:
            schedule_data = json.load(f)
        
        # Add new item
        schedule_data['schedule'].append(data)
        
        # Save updated schedule
        with open(SCHEDULE_FILE, 'w') as f:
            json.dump(schedule_data, f, indent=2)
        
        return jsonify({
            'message': 'Schedule item added successfully',
            'status': 'success'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # For production, set debug=False and use a WSGI server like gunicorn
    app.run(debug=True, host='0.0.0.0', port=8000)
