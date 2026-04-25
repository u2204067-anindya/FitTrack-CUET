/**
 * Notifications JavaScript
 * Handles notification dropdown, badge updates, and interactions
 */

// Global state
let notificationsData = [];
let unreadCount = 0;
let notificationDropdownOpen = false;

// Initialize notifications when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        return;
    }

    initializeNotifications();
});

/**
 * Initialize notification system
 */
async function initializeNotifications() {
    // Setup notification icon click handler
    setupNotificationIcon();
    
    // Load notifications
    await loadNotifications();
    
    // Poll for new notifications every 30 seconds
    setInterval(loadNotifications, 30000);
}

/**
 * Setup notification icon click handler
 */
function setupNotificationIcon() {
    const notificationIcon = document.querySelector('.notification-icon');
    if (!notificationIcon) return;

    // Create dropdown if it doesn't exist
    if (!document.querySelector('.notification-dropdown')) {
        const dropdown = createNotificationDropdown();
        notificationIcon.appendChild(dropdown);
    }

    // Toggle dropdown on click
    notificationIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotificationDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationIcon.contains(e.target)) {
            closeNotificationDropdown();
        }
    });
}

/**
 * Create notification dropdown HTML
 */
function createNotificationDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <div class="notification-actions">
                <button class="btn-icon" id="markAllReadBtn" title="Mark all as read">
                    <i class="fas fa-check-double"></i>
                </button>
                <button class="btn-icon" id="clearAllNotificationsBtn" title="Clear all">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="notification-list" id="notificationList">
            <div class="loading-notifications">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading notifications...</p>
            </div>
        </div>
        <div class="notification-footer">
            <a href="#" id="viewAllNotifications">View All Notifications</a>
        </div>
    `;

    // Add event listeners
    setTimeout(() => {
        const markAllBtn = dropdown.querySelector('#markAllReadBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
            });
        }

        const clearAllBtn = dropdown.querySelector('#clearAllNotificationsBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleClearAll();
            });
        }
    }, 0);

    return dropdown;
}

/**
 * Toggle notification dropdown
 */
function toggleNotificationDropdown() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (!dropdown) return;

    if (notificationDropdownOpen) {
        closeNotificationDropdown();
    } else {
        openNotificationDropdown();
    }
}

/**
 * Open notification dropdown
 */
function openNotificationDropdown() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (!dropdown) return;

    dropdown.classList.add('show');
    notificationDropdownOpen = true;
    
    // Refresh notifications when opened
    loadNotifications();
}

/**
 * Close notification dropdown
 */
function closeNotificationDropdown() {
    const dropdown = document.querySelector('.notification-dropdown');
    if (!dropdown) return;

    dropdown.classList.remove('show');
    notificationDropdownOpen = false;
}

/**
 * Load notifications from API
 */
async function loadNotifications() {
    try {
        // Get notifications (unread + recent read)
        const notifications = await api.getNotifications({ limit: 10 });
        notificationsData = notifications;

        // Get stats for unread count
        const stats = await api.getNotificationStats();
        unreadCount = stats.unread;

        // Update UI
        updateNotificationBadge();
        updateNotificationDropdown();

    } catch (error) {
        console.error('Error loading notifications:', error);
        // Don't show error to user, just log it
    }
}

/**
 * Update notification badge count
 */
function updateNotificationBadge() {
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

/**
 * Update notification dropdown content
 */
function updateNotificationDropdown() {
    const notificationList = document.querySelector('#notificationList');
    if (!notificationList) return;

    if (notificationsData.length === 0) {
        notificationList.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }

    notificationList.innerHTML = notificationsData.map(notification => `
        <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" 
             data-notification-id="${notification.id}"
             data-action-url="${notification.action_url || '#'}">
            <div class="notification-icon notification-${notification.type}">
                <i class="${getNotificationIcon(notification.category)}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <span class="notification-time">${formatNotificationTime(notification.created_at)}</span>
            </div>
            <div class="notification-actions-inline">
                ${!notification.is_read ? `
                    <button class="btn-icon-small mark-read-btn" title="Mark as read">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="btn-icon-small delete-notif-btn" title="Delete">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to notification items
    setupNotificationItemListeners();
}

/**
 * Setup event listeners for notification items
 */
function setupNotificationItemListeners() {
    const notificationItems = document.querySelectorAll('.notification-item');
    
    notificationItems.forEach(item => {
        const notificationId = item.getAttribute('data-notification-id');
        const actionUrl = item.getAttribute('data-action-url');
        
        // Click on notification item
        item.addEventListener('click', async (e) => {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.notification-actions-inline')) {
                return;
            }

            // Mark as read if unread
            if (item.classList.contains('unread')) {
                await handleMarkAsRead(notificationId);
            }

            // Navigate to action URL if exists
            if (actionUrl && actionUrl !== '#') {
                closeNotificationDropdown();
                window.location.href = actionUrl;
            }
        });

        // Mark as read button
        const markReadBtn = item.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await handleMarkAsRead(notificationId);
            });
        }

        // Delete button
        const deleteBtn = item.querySelector('.delete-notif-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await handleDeleteNotification(notificationId);
            });
        }
    });
}

/**
 * Handle mark as read
 */
async function handleMarkAsRead(notificationId) {
    try {
        await api.markNotificationAsRead(notificationId);
        await loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Handle mark all as read
 */
async function handleMarkAllAsRead() {
    try {
        await api.markAllNotificationsAsRead();
        await loadNotifications();
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

/**
 * Handle delete notification
 */
async function handleDeleteNotification(notificationId) {
    try {
        await api.deleteNotification(notificationId);
        await loadNotifications();
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
}

/**
 * Handle clear all notifications
 */
async function handleClearAll() {
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
        return;
    }

    try {
        await api.deleteAllNotifications();
        await loadNotifications();
    } catch (error) {
        console.error('Error clearing all notifications:', error);
    }
}

/**
 * Get icon class for notification category
 */
function getNotificationIcon(category) {
    const icons = {
        workout: 'fas fa-dumbbell',
        diet: 'fas fa-utensils',
        medical: 'fas fa-heartbeat',
        system: 'fas fa-info-circle',
        achievement: 'fas fa-trophy'
    };
    return icons[category] || 'fas fa-bell';
}

/**
 * Format notification time
 */
function formatNotificationTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else {
        return formatDate(date);
    }
}

// Export functions for use in other modules
window.loadNotifications = loadNotifications;
window.updateNotificationBadge = updateNotificationBadge;
