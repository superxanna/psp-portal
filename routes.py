from flask import Blueprint, request, jsonify, session, render_template
from backend.database import User

# Create a blueprint for the routes
api = Blueprint('api', __name__)

# Home route (login page)
@api.route('/')
def index():
    return render_template('login.html')


# Login route
@api.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Debugging: Check if username and password were sent to the backend
    print(f"Received login attempt for username: {username}")

    # Query the database for the user
    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
        # Store the user's username in session and trigger MFA request
        session['username'] = username
        session['mfa_required'] = True  # Indicate MFA is required
        print(f"Login successful for user: {username}, prompting for MFA.")

        return jsonify({"mfa_required": True, "message": "MFA required. Please enter your MFA token."}), 200
    else:
        # Log failed login attempt
        print(f"Login failed for user: {username}")
        return jsonify({"error": "Invalid username or password"}), 401


# MFA verification route
@api.route('/verify_mfa', methods=['POST'])
def verify_mfa():
    data = request.json
    mfa_token = data.get('mfaToken')

    # Ensure user is logged in and MFA is required
    if 'username' in session and session.get('mfa_required'):
        user = User.query.filter_by(username=session['username']).first()

        # Check if the entered MFA matches
        if user and user.mfa == mfa_token:
            session.pop('mfa_required', None)  # MFA passed, remove requirement
            print(f"MFA verification successful for user: {user.username}")
            return jsonify({"success": True, "message": "Login successful!"}), 200
        else:
            print(f"MFA verification failed for user: {user.username}")
            return jsonify({"error": "Invalid MFA token"}), 401
    else:
        return jsonify({"error": "Unauthorized or session expired"}), 401

# Payment route
@api.route('/payment', methods=['GET'])
def payment():
    # Check if user is logged in by verifying the session
    if 'username' not in session:
        # If the user is not logged in, redirect them to the login page
        return redirect(url_for('api.index'))

    # If the user is logged in, render the payment.html template
    return render_template('payment.html')

# Logout route
@api.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "Logged out successfully!"}), 200
