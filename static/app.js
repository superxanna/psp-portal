// Handle login and trigger MFA
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

    // Clear previous messages
    loginMessage.textContent = '';

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.mfa_required) {
            // Show the MFA field if password is correct
            document.getElementById('mfa-token-container').style.display = 'block';
            document.getElementById('login-btn').style.display = 'none'; // Hide the login button
            loginMessage.textContent = 'Password accepted. Please enter your MFA token.';
        } else {
            loginMessage.textContent = data.error || 'Login failed. Please try again.';
        }
    })
    .catch(error => {
        loginMessage.textContent = 'An error occurred. Please try again.';
        console.error('Error during login request:', error);
    });
}

// Handle MFA token verification
function verifyMFA() {
    const mfaToken = document.getElementById('mfa-token').value;
    const mfaMessage = document.getElementById('mfa-message');

    // Clear previous messages
    mfaMessage.textContent = '';

    fetch('/verify_mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mfaMessage.style.color = 'green';
            mfaMessage.textContent = 'Login successful! Redirecting to payment portal...';
            setTimeout(() => {
                window.location.href = '/payment'; // Redirect to the payment page after successful MFA
            }, 1000);
        } else {
            mfaMessage.textContent = 'Invalid MFA token. Please try again.';
        }
    })
    .catch(error => {
        mfaMessage.textContent = 'An error occurred during MFA verification. Please try again.';
        console.error('Error during MFA verification:', error);
    });
}


// Handle payment submission
function sendPayment() {
    fetch('/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            // Display success message
            document.getElementById('payment-message').textContent = data.message;
        } else {
            document.getElementById('payment-message').textContent = "Payment failed. Please try again.";
        }
    })
    .catch(error => {
        console.error('Error during payment:', error);
        document.getElementById('payment-message').textContent = "An error occurred. Please try again.";
    });
}


// Handle logout
function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            // If logout is successful, redirect to the home (login) page
            console.log("Logout successful! Redirecting to home page.");
            window.location.href = '/'; // Redirect to the login page
        } else {
            console.log("Logout failed:", data.error);
        }
    })
    .catch(error => {
        console.error('Error during logout request:', error);
    });
}
