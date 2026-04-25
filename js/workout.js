// ===========================
// Workout History Functions
// ===========================

// Workouts data loaded from API
let workouts = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    loadWorkouts();
    setupFilters();
    
    // Set today's date as default
    const dateInput = document.getElementById('workoutDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});

async function loadWorkouts(filters = {}) {
    const workoutList = document.getElementById('workoutList');
    
    if (!workoutList) return;
    
    // Show loading
    workoutList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading workouts...</div>';
    
    try {
        const response = await api.getWorkouts(filters);
        workouts = response.workouts || [];
        
        // Update the dashboard statistics
        updateWorkoutStats(response);

        if (workouts.length === 0) {
            workoutList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748b;">
                    <i class="fas fa-dumbbell" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>No workouts logged yet. Start tracking your fitness journey!</p>
                </div>
            `;
            return;
        }
        
        const html = workouts.map(workout => `
            <div class="workout-item">
                <div class="workout-header">
                    <div class="workout-title">
                        <div class="workout-type-icon">
                            <i class="fas fa-${workout.workout_type === 'cardio' ? 'running' : 'dumbbell'}"></i>
                        </div>
                        <div class="workout-title-text">
                            <h3>${capitalizeFirst(workout.focus_area || 'General')} ${capitalizeFirst(workout.workout_type || 'Workout')}</h3>
                            <span class="workout-date">${formatDate(workout.created_at)}</span>
                        </div>
                    </div>
                    <div class="workout-actions">
                        <button class="btn-icon" onclick="viewWorkout(${workout.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteWorkout(${workout.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="workout-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span><strong>${workout.duration || 0}</strong> minutes</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-fire"></i>
                        <span>Intensity: <strong>${capitalizeFirst(workout.intensity || 'medium')}</strong></span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-list"></i>
                        <span><strong>${(workout.exercises || []).length}</strong> exercises</span>
                    </div>
                </div>
                
                <div class="workout-exercises">
                    ${(workout.exercises || []).map(ex => `
                        <span class="exercise-tag">${ex.name}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        workoutList.innerHTML = html;
    } catch (error) {
        console.error('Error loading workouts:', error);
        workoutList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #dc2626;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Failed to load workouts. Please try again.</p>
                <p style="font-size: 0.8rem; margin-top: 1rem; color: #ef4444; opacity: 0.8;">Debug: ${error.message}</p>
            </div>
        `;
    }
}

function setupFilters() {
    const dateFilter = document.getElementById('dateFilter');
    const typeFilter = document.getElementById('typeFilter');
    const searchInput = document.getElementById('searchWorkout');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function applyFilters() {
    // This is a simplified version - in production, you'd filter the workouts array
    showNotification('Filters applied', 'success');
}

function openWorkoutModal() {
    const modal = document.getElementById('workoutModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeWorkoutModal() {
    const modal = document.getElementById('workoutModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function addExerciseField() {
    const exerciseList = document.getElementById('exerciseList');
    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-item';
    newExercise.innerHTML = `
        <input type="text" placeholder="Exercise name" class="exercise-name" required>
        <input type="number" placeholder="Sets" class="exercise-sets" min="1" required>
        <input type="number" placeholder="Reps" class="exercise-reps" min="1" required>
        <input type="number" placeholder="Weight (kg)" class="exercise-weight" min="0">
    `;
    exerciseList.appendChild(newExercise);
}

function closeWorkoutDetailsModal() {
    const modal = document.getElementById('workoutDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function viewWorkout(id) {
    try {
        const workout = await api.getWorkout(id);
        if (workout) {
            const content = document.getElementById('workoutDetailsContent');
            if (!content) return;
            
            const exerciseList = (workout.exercises || [])
                .map(ex => `
                    <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                        <strong>${ex.name}</strong><br>
                        <span style="color: #64748b; font-size: 0.9em;">
                            ${ex.sets} sets &times; ${ex.reps} reps
                            ${ex.weight ? ` @ ${ex.weight}kg` : ''}
                        </span>
                    </div>
                `).join('');

            content.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="margin-bottom: 10px; color: var(--primary-color);">${workout.name || 'Unnamed Workout'}</h3>
                    <p><strong>Date:</strong> ${formatDate(workout.created_at)}</p>
                    <p><strong>Type:</strong> <span style="text-transform: capitalize;">${workout.workout_type || 'General'}</span></p>
                    <p><strong>Duration:</strong> ${workout.duration || 0} minutes</p>
                    <p><strong>Intensity:</strong> <span style="text-transform: capitalize;">${workout.intensity || 'Medium'}</span></p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Exercises</h4>
                    ${exerciseList || '<p style="color: #64748b; font-style: italic;">No exercises recorded</p>'}
                </div>
                <div>
                    <h4 style="margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Notes</h4>
                    <p style="background: #f8fafc; padding: 10px; border-radius: 6px; color: #475569;">
                        ${workout.notes ? workout.notes.replace(/\n/g, '<br>') : '<em>No notes added.</em>'}
                    </p>
                </div>
            `;
            
            const modal = document.getElementById('workoutDetailsModal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    } catch (error) {
        showNotification('Failed to load workout details', 'error');
    }
}

async function deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            await api.deleteWorkout(id);
            await loadWorkouts();
            showNotification('Workout deleted successfully', 'success');
        } catch (error) {
            showNotification('Failed to delete workout', 'error');
        }
    }
}

// Handle workout form submission
document.addEventListener('DOMContentLoaded', function() {
    const workoutForm = document.getElementById('workoutForm');
    
    if (workoutForm) {
        // Pre-fill form from user preferences when opening it
        const logWorkoutModalBtn = document.querySelector('[onclick*="logWorkoutModal"]'); 
        // Just prefill immediately since the form is on the dom
        const prefs = window.getUserPreferences ? window.getUserPreferences() : {workoutDuration: '60', workoutIntensity: 'moderate'};
        const durationInput = document.getElementById('duration');
        if (durationInput && (!durationInput.value || durationInput.value === '')) {
            durationInput.value = prefs.workoutDuration || '60';
        }
        
        let intensityRb = document.getElementById('intensity' + (prefs.workoutIntensity ? prefs.workoutIntensity.charAt(0).toUpperCase() + prefs.workoutIntensity.slice(1) : 'Moderate'));
        if(!intensityRb) intensityRb = document.querySelector(`input[name="intensity"][value="${prefs.workoutIntensity}"]`)
        if (intensityRb) {
            intensityRb.checked = true;
        }

        workoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = workoutForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            try {
                // Collect form data
                const formData = {
                    name: document.getElementById('workoutName')?.value || `${document.getElementById('focusArea')?.value || 'Custom'} Workout`,
                    workout_type: document.getElementById('workoutType')?.value || 'mixed',
                    focus_area: document.getElementById('focusArea')?.value || 'full-body',
                    duration: parseInt(document.getElementById('duration').value) || 0,
                    intensity: document.querySelector('input[name="intensity"]:checked')?.value || 'medium',
                    notes: document.getElementById('notes')?.value || '',
                    exercises: []
                };

                // Collect exercises
                const exerciseItems = document.querySelectorAll('.exercise-item');
                exerciseItems.forEach((item, idx) => {
                    const name = item.querySelector('.exercise-name').value;
                    const sets = parseInt(item.querySelector('.exercise-sets').value) || 0;
                    const reps = parseInt(item.querySelector('.exercise-reps').value) || 0;
                    const weightVal = item.querySelector('.exercise-weight').value;
                    const weightStr = weightVal ? String(weightVal) : "0";

                    if (name && sets > 0 && reps > 0) {
                        formData.exercises.push({ name, sets, reps, weight: weightStr, order: idx });
                    }
                });

                // Call API
                await api.createWorkout(formData);
                
                // Reload workouts
                await loadWorkouts();
                
                // Close modal and reset form
                closeWorkoutModal();
                workoutForm.reset();
                
                showNotification('Workout logged successfully!', 'success');
            } catch (error) {
                showNotification(error.message || 'Failed to save workout', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update workout statistics dashboard
function updateWorkoutStats(response) {
    const workoutsList = response.workouts || [];
    const total = response.total || workoutsList.length;
    
    // Updates UI
    const totalElem = document.getElementById('statTotalWorkouts');
    const monthElem = document.getElementById('statThisMonth');
    const streakElem = document.getElementById('statCurrentStreak');
    const durationElem = document.getElementById('statTotalDuration');
    
    if (totalElem) totalElem.textContent = total;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let thisMonthCount = 0;
    let totalDuration = 0;
    let activeDates = new Set();
    
    workoutsList.forEach(w => {
        const d = new Date(w.created_at);
        
        // This Month calculation
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            thisMonthCount++;
        }
        
        // Total Duration (summing recent fetched limit limit/all)
        totalDuration += (w.duration || 0);
        
        // Prepare data for streak
        
        // Format helper to YYYY-MM-DD local
        const offset = d.getTimezoneOffset();
        const localD = new Date(d.getTime() - (offset*60*1000));
        activeDates.add(localD.toISOString().split('T')[0]);
    });
    
    if (monthElem) monthElem.textContent = thisMonthCount;
    if (durationElem) {
        // Format duration into hours and minutes
        const hours = Math.floor(totalDuration / 60);
        const minutes = totalDuration % 60;
        if (hours > 0) {
            durationElem.textContent = hours + 'h ' + minutes + 'm';
        } else {
            durationElem.textContent = minutes + 'm';
        }
    }
    
    // Calculate Current Streak
    let streak = 0;
    let checkDate = new Date();
    
    // Format helper for YYYY-MM-DD local time
    const _toDateStr = (dateObj) => {
        const offset = dateObj.getTimezoneOffset();
        dateObj = new Date(dateObj.getTime() - (offset*60*1000));
        return dateObj.toISOString().split('T')[0];
    };

    let dateStr = _toDateStr(checkDate);
    
    // If user didn't workout today, streak might still be active if they worked out yesterday
    if (!activeDates.has(dateStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = _toDateStr(checkDate);
    }
    
    while(activeDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = _toDateStr(checkDate);
    }
    
    if (streakElem) streakElem.textContent = streak;
}
