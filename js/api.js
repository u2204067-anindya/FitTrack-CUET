// ===========================
// API Configuration & Helper Functions
// ===========================

//const API_BASE_URL = 'http://localhost:8000/api';

const API_BASE_URL = '/api';
// API Endpoints
const API_ENDPOINTS = {
    // Auth
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`,
    logout: `${API_BASE_URL}/auth/logout`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
    
    // Users
    users: `${API_BASE_URL}/users/`,
    profile: `${API_BASE_URL}/users/me`,
    settings: `${API_BASE_URL}/users/me/settings`,

    // Workouts
    workouts: `${API_BASE_URL}/workouts/`,

    // Diet
    diet: `${API_BASE_URL}/diet/`,

    // Medical Profile
    medicalProfile: `${API_BASE_URL}/medical-profile/`,
    // Equipment
    equipment: `${API_BASE_URL}/equipment/`,
    equipmentCategories: `${API_BASE_URL}/equipment/categories`,
    
    // AI Instructor
    aiChat: `${API_BASE_URL}/ai-instructor/chat`,
    aiHistory: `${API_BASE_URL}/ai-instructor/history`,
    
    // Admin
    gymStatus: `${API_BASE_URL}/admin/gym-status`,
    announcements: `${API_BASE_URL}/admin/announcements`,
    adminUsers: `${API_BASE_URL}/users/`,
    adminStats: `${API_BASE_URL}/admin/stats`,
    
    // Notifications
    notifications: `${API_BASE_URL}/notifications/`,
    notificationStats: `${API_BASE_URL}/notifications/stats`,
};

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token in localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Remove auth token from localStorage
function removeAuthToken() {
    localStorage.clear(); // Complete wipe for security and data isolation
}

// Check if user is logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// Get stored user data
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Set user data in localStorage
function setUserData(user) {
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
}

// API Request Helper with Authentication
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
            removeAuthToken();
            window.location.href = 'index.html';
            throw new Error('Session expired. Please login again.');
        }
        
        // Parse response
        const data = await response.json();
        
        if (!response.ok) {
            // Handle validation errors from FastAPI
            if (data.detail && Array.isArray(data.detail)) {
                // FastAPI validation errors
                const errors = data.detail.map(err => {
                    const field = err.loc ? err.loc.join('.') : 'Unknown field';
                    return `${field}: ${err.msg}`;
                }).join('; ');
                throw new Error(errors);
            } else if (typeof data.detail === 'string') {
                throw new Error(data.detail);
            } else if (data.detail && typeof data.detail === 'object') {
                // Handle object detail
                throw new Error(JSON.stringify(data.detail));
            } else {
                throw new Error('An error occurred');
            }
        }
        
        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to server. Please ensure the backend is running.');
        }
        throw error;
    }
}

// API Methods
const api = {
    // Auth
    async login(studentId, password) {
        // Clear old session's local storage data securely before starting a new session
        localStorage.clear();
        
        const response = await apiRequest(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({ student_id: studentId, password: password })
        });
        
        setAuthToken(response.access_token);
        setUserData(response.user);
        
        return response;
    },
    
    async register(userData) {
        // Clear old session's local storage data securely
        localStorage.clear();
        
        const response = await apiRequest(API_ENDPOINTS.register, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        // No longer setting auth token automatically as email verification is required.
        return response;
    },
    
    async getCurrentUser() {
        return await apiRequest(API_ENDPOINTS.profile);
    },
    
    async updateCurrentUser(userData) {
        return await apiRequest(API_ENDPOINTS.profile, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    async getUserSettings() {
        return await apiRequest(API_ENDPOINTS.settings);
    },

    async updateUserSettings(settingsData) {
        return await apiRequest(API_ENDPOINTS.settings, {
            method: 'PUT',
            body: JSON.stringify(settingsData)
        });
    },

    async changePassword(passwordData) {
        return await apiRequest(`${API_ENDPOINTS.profile}/change-password`, {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    },
    
    async logout() {
        try {
            // Call backend logout endpoint to update last_active_at
            await apiRequest(API_ENDPOINTS.logout, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error calling logout API:', error);
        } finally {
            // Always remove auth token locally, even if API call fails
            removeAuthToken();
        }
    },
    
    // Workouts
    async getWorkouts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_ENDPOINTS.workouts}?${queryString}` : API_ENDPOINTS.workouts;
        return await apiRequest(url);
    },
    
    async getWorkout(id) {
        return await apiRequest(`${API_ENDPOINTS.workouts}${id}`);
    },

    async createWorkout(workoutData) {
        return await apiRequest(API_ENDPOINTS.workouts, {
            method: 'POST',
            body: JSON.stringify(workoutData)
        });
    },

    async updateWorkout(id, workoutData) {
        return await apiRequest(`${API_ENDPOINTS.workouts}${id}`, {
            method: 'PUT',
            body: JSON.stringify(workoutData)
        });
    },

    async deleteWorkout(id) {
        return await apiRequest(`${API_ENDPOINTS.workouts}${id}`, {
            method: 'DELETE'
        });
    },

    async startWorkout(id) {
        return await apiRequest(`${API_ENDPOINTS.workouts}${id}/start`, {
            method: 'POST'
        });
    },

    async completeWorkout(id, data = {}) {
        return await apiRequest(`${API_ENDPOINTS.workouts}${id}/complete`, {
            body: JSON.stringify(data)
        });
    },
    
    // Diet Plan
    async getDietPlan() {
        return await apiRequest(API_ENDPOINTS.diet);
    },
    
    async createDietPlan(dietData) {
        return await apiRequest(API_ENDPOINTS.diet, {
            method: 'POST',
            body: JSON.stringify(dietData)
        });
    },
    
    async updateDietPlan(dietData) {
        return await apiRequest(API_ENDPOINTS.diet, {
            method: 'PUT',
            body: JSON.stringify(dietData)
        });
    },

    async generateDietPlan() {
        return await apiRequest(`${API_ENDPOINTS.diet}generate`, {
            method: 'POST'
        });
    },

    async deleteDietPlan() {
        return await apiRequest(API_ENDPOINTS.diet, {
            method: 'DELETE'
        });
    },
    
    // Medical Profile
    async getMedicalProfile() {
        return await apiRequest(API_ENDPOINTS.medicalProfile);
    },
    
    async createMedicalProfile(profileData) {
        return await apiRequest(API_ENDPOINTS.medicalProfile, {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    },
    
    async updateMedicalProfile(profileData) {
        return await apiRequest(API_ENDPOINTS.medicalProfile, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },
    
    async getHealthMetrics() {
        return await apiRequest(`${API_ENDPOINTS.medicalProfile}/health-metrics`);
    },
    
    // Equipment
    async getEquipment(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_ENDPOINTS.equipment}?${queryString}` : API_ENDPOINTS.equipment;
        return await apiRequest(url);
    },
    
    async getEquipmentById(id) {
        return await apiRequest(`${API_ENDPOINTS.equipment}${id}`);
    },
    
    async getEquipmentCategories() {
        return await apiRequest(API_ENDPOINTS.equipmentCategories);
    },
    
    async createEquipment(equipmentData) {
        return await apiRequest(API_ENDPOINTS.equipment, {
            method: 'POST',
            body: JSON.stringify(equipmentData)
        });
    },

    async updateEquipment(id, equipmentData) {
        return await apiRequest(`${API_ENDPOINTS.equipment}${id}`, {
            method: 'PUT',
            body: JSON.stringify(equipmentData)
        });
    },

    async deleteEquipment(id) {
        return await apiRequest(`${API_ENDPOINTS.equipment}${id}`, {
            method: 'DELETE'
        });
    },
    
    // AI Instructor
    async chatWithAI(question, context = 'general', includeHistory = true) {
        return await apiRequest(API_ENDPOINTS.aiChat, {
            method: 'POST',
            body: JSON.stringify({ 
                question: question, 
                context: context,
                include_history: includeHistory
            })
        });
    },
    
    async getAIChatHistory(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_ENDPOINTS.aiHistory}?${queryString}` : API_ENDPOINTS.aiHistory;
        return await apiRequest(url);
    },
    
    async deleteAIChatHistory() {
        return await apiRequest(API_ENDPOINTS.aiHistory, {
            method: 'DELETE'
        });
    },
    
    // Admin - Gym Status
    async getGymStatus() {
        return await apiRequest(API_ENDPOINTS.gymStatus);
    },
    
    async updateGymStatus(statusData) {
        return await apiRequest(API_ENDPOINTS.gymStatus, {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    },
    
    async toggleGymStatus() {
        return await apiRequest(`${API_ENDPOINTS.gymStatus}/toggle`, {
            method: 'POST'
        });
    },
    
    // Admin - Announcements
    async getAnnouncements(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_ENDPOINTS.announcements}?${queryString}` : API_ENDPOINTS.announcements;
        return await apiRequest(url);
    },
    
    async createAnnouncement(announcementData) {
        return await apiRequest(API_ENDPOINTS.announcements, {
            method: 'POST',
            body: JSON.stringify(announcementData)
        });
    },
    
    async updateAnnouncement(id, announcementData) {
        return await apiRequest(`${API_ENDPOINTS.announcements}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(announcementData)
        });
    },
    
    async deleteAnnouncement(id) {
        return await apiRequest(`${API_ENDPOINTS.announcements}/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Admin - Users
    async getAllUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_ENDPOINTS.adminUsers}?${queryString}` : API_ENDPOINTS.adminUsers;
        return await apiRequest(url);
    },
    
    async toggleUserStatus(userId) {
        return await apiRequest(`${API_ENDPOINTS.adminUsers}/${userId}/toggle-active`, {
            method: 'POST'
        });
    },
    
    async toggleUserAdmin(userId) {
        // Get current admin status from table data
        const isCurrentlyAdmin = document.querySelector(`button[onclick="toggleUserAdmin(${userId})"]`)?.title.includes('Remove');
        return await apiRequest(`${API_ENDPOINTS.adminUsers}/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ is_admin: !isCurrentlyAdmin })
        });
    },
    
    // Admin - Stats
    async getAdminStats() {
        return await apiRequest(API_ENDPOINTS.adminStats);
    },
    
    // Notifications
    async getNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${API_ENDPOINTS.notifications}?${queryString}` : API_ENDPOINTS.notifications;
        return await apiRequest(url);
    },
    
    async getNotificationStats() {
        return await apiRequest(API_ENDPOINTS.notificationStats);
    },
    
    async getNotification(id) {
        return await apiRequest(`${API_ENDPOINTS.notifications}${id}`);
    },

    async markNotificationAsRead(id) {
        return await apiRequest(`${API_ENDPOINTS.notifications}${id}`, {
            method: 'PUT',
            body: JSON.stringify({ is_read: true })
        });
    },

    async markAllNotificationsAsRead() {
        return await apiRequest(`${API_ENDPOINTS.notifications}mark-all-read`, {
            method: 'POST'
        });
    },

    async deleteNotification(id) {
        return await apiRequest(`${API_ENDPOINTS.notifications}${id}`, {
            method: 'DELETE'
        });
    },

    async deleteAllNotifications() {
        return await apiRequest(API_ENDPOINTS.notifications, {
            method: 'DELETE'
        });
    }
};

// Export for use in other modules
window.api = api;
window.API_BASE_URL = API_BASE_URL;
window.isLoggedIn = isLoggedIn;
window.getUserData = getUserData;
window.setUserData = setUserData;
window.removeAuthToken = removeAuthToken;

