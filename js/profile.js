/**
 * Profile Page JavaScript
 * Handles profile display, editing, and password changes
 */

// State
let currentUser = null;
let isEditMode = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Load user profile
    loadUserProfile();

    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Edit personal info
    const editPersonalBtn = document.getElementById('editPersonalBtn');
    if (editPersonalBtn) {
        editPersonalBtn.addEventListener('click', toggleEditMode);
    }

    // Cancel edit
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            toggleEditMode();
            populateEditForm();
        });
    }

    // Save personal info
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handleUpdateProfile);
    }

    // Change password
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }

    // Password toggle buttons
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Change avatar button (placeholder functionality)
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            showToast('Avatar upload feature coming soon!', 'info');
        });
    }
}

/**
 * Load user profile from API
 */
async function loadUserProfile() {
    showLoading();
    
    try {
        const user = await api.getCurrentUser();
        currentUser = user;
        
        // Display profile information
        displayProfile(user);
        
        // Load workout stats
        await loadWorkoutStats();
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Display profile information
 */
function displayProfile(user) {
    // Update page title and header
    document.title = `${user.full_name} - Profile - FitTrack CUET`;
    
    // Profile header
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = user.full_name;
    
    const profileStudentId = document.getElementById('profileStudentId');
    if (profileStudentId) profileStudentId.textContent = `Student ID: ${user.student_id}`;
    
    // Update badge
    const profileBadge = document.getElementById('profileBadge');
    if (profileBadge) {
        profileBadge.textContent = user.is_admin ? 'Admin' : 'Student';
        profileBadge.className = user.is_admin ? 'profile-badge badge-admin' : 'profile-badge';
    }
    
    // Update avatars
    const avatarUrl = user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=4f46e5&color=fff&size=200`;
    
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) profileAvatar.src = avatarUrl;
    
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) userAvatar.src = avatarUrl;
    
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) userNameDisplay.textContent = user.full_name.split(' ')[0];
    
    // Personal information display
    document.getElementById('displayFullName').textContent = user.full_name;
    document.getElementById('displayEmail').textContent = user.email;
    document.getElementById('displayStudentId').textContent = user.student_id;
    document.getElementById('displayPhone').textContent = user.phone || 'Not provided';
    document.getElementById('displayDepartment').textContent = user.department || 'Not provided';
    document.getElementById('displayLevel').textContent = user.level ? `Level ${user.level}` : 'Not provided';
    document.getElementById('displayTerm').textContent = user.term ? `Term ${user.term}` : 'Not provided';
    
    // Account status
    const statusElement = document.getElementById('displayStatus');
    if (statusElement) {
        statusElement.innerHTML = user.is_active 
            ? '<span class="status-badge status-active">Active</span>'
            : '<span class="status-badge status-inactive">Inactive</span>';
    }
    
    // Account timestamps
    const createdAt = new Date(user.created_at);
    document.getElementById('displayCreatedAt').textContent = createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('displayUpdatedAt').textContent = 'Recently';
    
    // Member since
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        memberSince.textContent = createdAt.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    }
    
    // Populate edit form
    populateEditForm();
}

/**
 * Populate edit form with current user data
 */
function populateEditForm() {
    if (!currentUser) return;
    
    document.getElementById('editFullName').value = currentUser.full_name || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editDepartment').value = currentUser.department || '';
    document.getElementById('editLevel').value = currentUser.level || '';
    document.getElementById('editTerm').value = currentUser.term || '';
}

/**
 * Toggle edit mode
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const displaySection = document.getElementById('personalInfoDisplay');
    const editForm = document.getElementById('personalInfoForm');
    const editBtn = document.getElementById('editPersonalBtn');
    
    if (isEditMode) {
        displaySection.style.display = 'none';
        editForm.style.display = 'block';
        editBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    } else {
        displaySection.style.display = 'grid';
        editForm.style.display = 'none';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    }
}

/**
 * Handle profile update
 */
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const formData = {
        full_name: document.getElementById('editFullName').value.trim(),
        phone: document.getElementById('editPhone').value.trim() || null,
        department: document.getElementById('editDepartment').value || null,
        level: document.getElementById('editLevel').value || null,
        term: document.getElementById('editTerm').value || null
    };
    
    // Validation
    if (!formData.full_name) {
        showToast('Full name is required', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const updatedUser = await api.updateCurrentUser(formData);
        currentUser = updatedUser;
        
        // Update display
        displayProfile(updatedUser);
        
        // Exit edit mode
        toggleEditMode();
        
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast(error.message || 'Failed to update profile', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Handle password change
 */
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('All password fields are required', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        showToast('New password must be different from current password', 'error');
        return;
    }
    
    showLoading();
    
    try {
        await api.changePassword({
            current_password: currentPassword,
            new_password: newPassword
        });
        
        // Clear form
        document.getElementById('changePasswordForm').reset();
        
        showToast('Password changed successfully!', 'success');
    } catch (error) {
        console.error('Error changing password:', error);
        showToast(error.message || 'Failed to change password', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Load workout statistics
 */
async function loadWorkoutStats() {
    try {
        const workouts = await api.getWorkouts();
        const totalWorkouts = document.getElementById('totalWorkouts');
        if (totalWorkouts) {
            totalWorkouts.textContent = workouts.length;
        }
    } catch (error) {
        console.error('Error loading workout stats:', error);
        // Don't show error toast for stats, just log it
    }
}

/**
 * Show loading spinner
 */
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
