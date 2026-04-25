// ===========================
// Authentication Functions
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Password Toggle
    setupPasswordToggles();
});

async function handleLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Basic validation
    if (!studentId || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        // Call backend API
        await api.login(studentId, password);
        
        // Fetch user settings and apply theme
        try {
            const settings = await api.getUserSettings();
            const theme = settings.dark_mode ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        } catch (settingsError) {
            console.error('Failed to load user settings:', settingsError);
        }

        // Changed timeout from 800 to just immediately redirect to dashboard since there's no reason to wait
        window.location.href = 'dashboard.html';
    } catch (error) {
        showNotification(error.message || 'Login failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login <i class="fas fa-arrow-right"></i>';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const studentId = document.getElementById('regStudentId').value;
    const email = document.getElementById('email').value;
    const department = document.getElementById('department').value;
    const level = document.getElementById('level').value;
    const term = document.getElementById('term').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.querySelector('input[name="terms"]').checked;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validation
    if (!firstName || !lastName || !studentId || !email || !department || !level || !term || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept the terms of service', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Password strength check
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    
    try {
        // Prepare user data for API
        const userData = {
            email: email,
            full_name: `${firstName} ${lastName}`,
            student_id: studentId,
            department: department,
            level: level,
            term: term,
            password: password
        };
        
        // Call backend API
        const responseData = await api.register(userData);
        
        showNotification(responseData.message || 'Registration successful! Please check your email for the OTP to sign in.', 'success');
        submitBtn.innerHTML = 'Account Created <i class="fas fa-check"></i>';
        
        setTimeout(() => {
            // Redirect to verify email page
            window.location.href = 'verify-email.html';
        }, 3000);
    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account <i class="fas fa-user-plus"></i>';
    }
}

function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#0ea5e9'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
