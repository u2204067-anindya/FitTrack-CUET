// ===========================
// Main JavaScript Functions
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    // Check authentication
    checkAuth();
    
    // Setup navigation
    setupNavigation();
    
    // Setup user dropdown
    setupUserInfo();
    
    // Logout handler
    setupLogout();
});

function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Allow access to login and register pages without authentication
    const publicPages = ['index.html', 'register.html', ''];
    
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
    }
}

function setupNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        // Close menu on link click (mobile)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

function setupUserInfo() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update user name in navigation
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        if (userData.name) {
            el.textContent = userData.name;
        }
    });
    
    // Update welcome message
    const userNameDisplay = document.getElementById('userName');
    if (userNameDisplay && userData.firstName) {
        userNameDisplay.textContent = userData.firstName;
    }
    
    // Update user avatar
    const userAvatars = document.querySelectorAll('.user-dropdown img');
    userAvatars.forEach(img => {
        if (userData.name) {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4f46e5&color=fff`;
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userData');
                window.location.href = 'index.html';
            }
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility function to get current user preferences securely
function getUserPreferences() {
    try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.preferences) {
                return parsed.preferences;
            }
        }
    } catch(e) {
        console.error('Error fetching preferences:', e);
    }
    return {
        timeFormat: '12',
        dateFormat: 'MM/DD/YYYY',
        workoutDuration: '60',
        workoutIntensity: 'moderate'
    };
}

// Utility function to format date
function formatDate(date) {
    const prefs = getUserPreferences();
    const dt = new Date(date);
    
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    
    if (prefs.dateFormat === 'DD/MM/YYYY') {
        return `${dd}/${mm}/${yyyy}`;
    } else if (prefs.dateFormat === 'YYYY-MM-DD') {
        return `${yyyy}-${mm}-${dd}`;
    } else {
        // default MM/DD/YYYY
        return `${mm}/${dd}/${yyyy}`;
    }
}

// Utility function to format time
function formatTime(date) {
    const prefs = getUserPreferences();
    const dt = new Date(date);
    
    const hour12 = prefs.timeFormat !== '24';
    
    return dt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: hour12
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (savedTheme === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        }
    } else if (!savedTheme) {
        // Default to not dark, or check system
    }
}
