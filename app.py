from flask import Flask, jsonify, request, send_from_directory, session, redirect, url_for
import json
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__, static_folder='static')
app.secret_key = 'southern-mama-secret-key-change-in-production'  # Change this in production!

# Path to data files
SCHEDULE_FILE = 'data/schedule.json'
REQUESTS_FILE = 'data/event_requests.json'
PRODUCTS_FILE = 'data/products.json'
ADMIN_FILE = 'data/admin.json'

# Admin credentials (in production, use proper password hashing)
DEFAULT_ADMIN = {
    'username': 'admin',
    'password': 'barnwood123'  # Change this!
}

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Initialize admin file
if not os.path.exists(ADMIN_FILE):
    with open(ADMIN_FILE, 'w') as f:
        json.dump(DEFAULT_ADMIN, f)

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


# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function


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


@app.route('/admin.html')
def admin_login():
    """Serve the admin login page"""
    return send_from_directory('.', 'admin.html')


@app.route('/admin_dashboard.html')
def admin_dashboard():
    """Serve the admin dashboard page"""
    if 'logged_in' not in session:
        return redirect('/admin.html')
    return send_from_directory('.', 'admin_dashboard.html')


@app.route('/api/admin/login', methods=['POST'])
def admin_login_api():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        with open(ADMIN_FILE, 'r') as f:
            admin_data = json.load(f)
        
        if username == admin_data['username'] and password == admin_data['password']:
            session['logged_in'] = True
            session['username'] = username
            return jsonify({'message': 'Login successful', 'status': 'success'}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    """Admin logout endpoint"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


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


@app.route('/api/admin/schedule', methods=['GET'])
@login_required
def get_all_schedule():
    """Get all schedule items for admin"""
    try:
        with open(SCHEDULE_FILE, 'r') as f:
            data = json.load(f)
        return jsonify({'schedule': data.get('schedule', [])})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/schedule', methods=['POST'])
@login_required
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
        
        # Add ID and new item
        data['id'] = str(len(schedule_data['schedule']) + 1)
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


@app.route('/api/admin/schedule/<schedule_id>', methods=['PUT'])
@login_required
def update_schedule_item(schedule_id):
    """Update a schedule item"""
    try:
        data = request.get_json()
        
        with open(SCHEDULE_FILE, 'r') as f:
            schedule_data = json.load(f)
        
        # Find and update the item
        for item in schedule_data['schedule']:
            if item.get('id') == schedule_id:
                item.update(data)
                item['id'] = schedule_id  # Preserve ID
                break
        else:
            return jsonify({'error': 'Schedule item not found'}), 404
        
        # Save updated schedule
        with open(SCHEDULE_FILE, 'w') as f:
            json.dump(schedule_data, f, indent=2)
        
        return jsonify({'message': 'Schedule updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/schedule/<schedule_id>', methods=['DELETE'])
@login_required
def delete_schedule_item(schedule_id):
    """Delete a schedule item"""
    try:
        with open(SCHEDULE_FILE, 'r') as f:
            schedule_data = json.load(f)
        
        # Filter out the item to delete
        original_length = len(schedule_data['schedule'])
        schedule_data['schedule'] = [item for item in schedule_data['schedule'] if item.get('id') != schedule_id]
        
        if len(schedule_data['schedule']) == original_length:
            return jsonify({'error': 'Schedule item not found'}), 404
        
        # Save updated schedule
        with open(SCHEDULE_FILE, 'w') as f:
            json.dump(schedule_data, f, indent=2)
        
        return jsonify({'message': 'Schedule deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # For production, set debug=False and use a WSGI server like gunicorn
    app.run(debug=True, host='0.0.0.0', port=8000)
