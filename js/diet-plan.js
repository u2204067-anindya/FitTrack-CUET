// ===========================
// Diet Plan Functions
// ===========================

// Diet plan data loaded from API
let currentDietPlan = null;

// Sample meal data (fallback/default)
const sampleMeals = {
    breakfast: {
        name: 'Breakfast',
        time: '7:00 AM',
        icon: 'fa-mug-hot',
        calories: 450,
        items: [
            '3 eggs (scrambled or boiled)',
            '2 slices whole wheat toast',
            '1 banana',
            'Green tea or black coffee'
        ],
        macros: { protein: 25, carbs: 45, fats: 15 }
    },
    midMorning: {
        name: 'Mid-Morning Snack',
        time: '10:00 AM',
        icon: 'fa-apple-alt',
        calories: 200,
        items: [
            'Greek yogurt (200g)',
            'Mixed nuts (30g)',
            '1 apple'
        ],
        macros: { protein: 15, carbs: 20, fats: 12 }
    },
    lunch: {
        name: 'Lunch',
        time: '1:00 PM',
        icon: 'fa-utensils',
        calories: 650,
        items: [
            'Grilled chicken breast (150g)',
            'Brown rice (1 cup)',
            'Mixed vegetables',
            'Side salad with olive oil'
        ],
        macros: { protein: 45, carbs: 70, fats: 18 }
    },
    afternoon: {
        name: 'Afternoon Snack',
        time: '4:00 PM',
        icon: 'fa-cookie',
        calories: 250,
        items: [
            'Protein shake',
            'Oatmeal cookies (2)',
            '1 orange'
        ],
        macros: { protein: 20, carbs: 30, fats: 8 }
    },
    dinner: {
        name: 'Dinner',
        time: '7:30 PM',
        icon: 'fa-drumstick-bite',
        calories: 600,
        items: [
            'Grilled fish (150g)',
            'Sweet potato (medium)',
            'Steamed broccoli',
            'Quinoa (1/2 cup)'
        ],
        macros: { protein: 40, carbs: 65, fats: 15 }
    },
    evening: {
        name: 'Evening Snack',
        time: '9:30 PM',
        icon: 'fa-cheese',
        calories: 250,
        items: [
            'Cottage cheese (150g)',
            'Mixed berries',
            'Almonds (20g)'
        ],
        macros: { protein: 20, carbs: 15, fats: 12 }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    loadDietPlanFromAPI();
    setupPreferencesForm();
    setupWeekTabs();
});

async function loadDietPlanFromAPI() {
    try {
        currentDietPlan = await api.getDietPlan();
        loadDietPreferences();
        loadMealPlan();
        updateNutritionGoalsDisplay();
    } catch (error) {
        // Diet plan might not exist yet, use defaults
        console.log('No diet plan found, using defaults');
        loadDietPreferences();
        loadMealPlan();
        updateNutritionGoalsDisplay();
    }
}

function loadDietPreferences() {
    // Try to load from API data first
    if (currentDietPlan) {
        if (currentDietPlan.diet_type) {
            const dietTypeEl = document.getElementById('dietType');
            if (dietTypeEl) dietTypeEl.value = currentDietPlan.diet_type;
        }
        if (currentDietPlan.meal_frequency) {
            const mealsEl = document.getElementById('mealsPerDay');
            if (mealsEl) mealsEl.value = currentDietPlan.meal_frequency;
        }
        if (currentDietPlan.target_calories) {
            const caloriesEl = document.getElementById('targetCalories');
            if (caloriesEl) caloriesEl.value = currentDietPlan.target_calories;
        }
        if (currentDietPlan.goal) {
            const dietGoalEl = document.getElementById('dietGoal');
            if (dietGoalEl) dietGoalEl.value = currentDietPlan.goal;
        }
        if (currentDietPlan.protein_target) {
            const proteinTargetEl = document.getElementById('proteinTarget');
            if (proteinTargetEl) proteinTargetEl.value = currentDietPlan.protein_target;
        }
        if (currentDietPlan.carbs_target) {
            const carbsTargetEl = document.getElementById('carbsTarget');
            if (carbsTargetEl) carbsTargetEl.value = currentDietPlan.carbs_target;
        }
        if (currentDietPlan.fat_target) {
            const fatTargetEl = document.getElementById('fatTarget');
            if (fatTargetEl) fatTargetEl.value = currentDietPlan.fat_target;
        }
        if (currentDietPlan.water_goal) {
            const waterGoalEl = document.getElementById('waterGoal');
            if (waterGoalEl) waterGoalEl.value = currentDietPlan.water_goal;
        }
        
        if (currentDietPlan.meals && currentDietPlan.meals.length > 0) {
            const manualBEl = document.getElementById('manualBreakfast');
            const manualLEl = document.getElementById('manualLunch');
            const manualDEl = document.getElementById('manualDinner');
            const manualSEl = document.getElementById('manualSnacks');
            
            currentDietPlan.meals.forEach(m => {
                const itemsStr = (m.items || []).map(i => i.name).join(', ');
                if (m.meal_type === 'breakfast' && manualBEl) manualBEl.value = itemsStr;
                if (m.meal_type === 'lunch' && manualLEl) manualLEl.value = itemsStr;
                if (m.meal_type === 'dinner' && manualDEl) manualDEl.value = itemsStr;
                if (m.meal_type === 'snacks' && manualSEl) manualSEl.value = itemsStr;
            });
        }
        
        if (currentDietPlan.preferences) {
            const foodDislikesEl = document.getElementById('foodDislikes');
            if (foodDislikesEl) foodDislikesEl.value = currentDietPlan.preferences.food_dislikes || '';
            
            if (currentDietPlan.preferences.restrictions) {
                currentDietPlan.preferences.restrictions.forEach(restriction => {
                    const checkbox = document.querySelector(`input[name="restrictions"][value="${restriction}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
        return;
    }
}

function updateNutritionGoalsDisplay() {
    let targetCalories = 2400;
    let totalProtein = 150;
    let totalCarbs = 280;
    let totalFats = 65;

    if (currentDietPlan) {
        targetCalories = currentDietPlan.target_calories || targetCalories;
        totalProtein = currentDietPlan.protein_target || totalProtein;
        totalCarbs = currentDietPlan.carbs_target || totalCarbs;
        totalFats = currentDietPlan.fat_target || totalFats;
    } else {
        const inputCalories = parseInt(document.getElementById('targetCalories')?.value);
        if(!isNaN(inputCalories)) targetCalories = inputCalories;
        
        const inputProtein = parseInt(document.getElementById('proteinTarget')?.value);
        if(!isNaN(inputProtein)) totalProtein = inputProtein;
        
        const inputCarbs = parseInt(document.getElementById('carbsTarget')?.value);
        if(!isNaN(inputCarbs)) totalCarbs = inputCarbs;
        
        const inputFats = parseInt(document.getElementById('fatTarget')?.value);
        if(!isNaN(inputFats)) totalFats = inputFats;
    }

    const dC = document.getElementById('displayTargetCalories');
    if (dC) dC.textContent = targetCalories.toLocaleString();

    const dP = document.getElementById('displayProtein');
    if (dP) dP.textContent = totalProtein + 'g';

    const dCbs = document.getElementById('displayCarbs');
    if (dCbs) dCbs.textContent = totalCarbs + 'g';

    const dF = document.getElementById('displayFats');
    if (dF) dF.textContent = totalFats + 'g';
}

// Generate a customized meal plan based on preferences
function generateMeals(targetCalories, mealsPerDay, proteinTarget, carbsTarget, fatTarget) {
    const customizedMeals = [];
    const mealKeys = Object.keys(sampleMeals).slice(0, mealsPerDay);
    
    // Default sample meals total calories is around 2450
    const totalSampleCalories = mealKeys.reduce((sum, key) => sum + sampleMeals[key].calories, 0);
    const scalingFactor = targetCalories / totalSampleCalories;
    
    // Using user's macro targets if provided instead of scaling blindly
    // Sample macros sum up differently, so we distribute user's targets proportionally
    let totalSampleProtein = mealKeys.reduce((sum, key) => sum + sampleMeals[key].macros.protein, 0);
    let totalSampleCarbs = mealKeys.reduce((sum, key) => sum + sampleMeals[key].macros.carbs, 0);
    let totalSampleFats = mealKeys.reduce((sum, key) => sum + sampleMeals[key].macros.fats, 0);
    
    const proteinScale = proteinTarget ? proteinTarget / totalSampleProtein : scalingFactor;
    const carbsScale = carbsTarget ? carbsTarget / totalSampleCarbs : scalingFactor;
    const fatsScale = fatTarget ? fatTarget / totalSampleFats : scalingFactor;

    mealKeys.forEach(key => {
        const meal = sampleMeals[key];
        const scaledCalories = Math.round(meal.calories * scalingFactor);
        const scaledProtein = Math.round(meal.macros.protein * proteinScale);
        const scaledCarbs = Math.round(meal.macros.carbs * carbsScale);
        const scaledFats = Math.round(meal.macros.fats * fatsScale);

        customizedMeals.push({
            meal_type: key,
            name: meal.name,
            time: meal.time,
            icon: meal.icon,
            calories: scaledCalories,
            items: meal.items.map(item => ({ name: item })), // Stored as items list of dicts
            macros: {
                protein: scaledProtein,
                carbs: scaledCarbs,
                fats: scaledFats
            }
        });
    });

    return customizedMeals;
}

function loadMealPlan() {
    const container = document.getElementById('mealPlanContainer');
    
    if (!container) return;
    
    let mealsToShow = [];
    
    // Read from API or fallback
    if (currentDietPlan && currentDietPlan.meals && currentDietPlan.meals.length > 0) {
        mealsToShow = currentDietPlan.meals;
    } else {
        const mealsPerDay = parseInt(document.getElementById('mealsPerDay')?.value || 5);
        const targetCalories = parseInt(document.getElementById('targetCalories')?.value || 2500);
        const proteinTarget = parseFloat(document.getElementById('proteinTarget')?.value || 150);
        const carbsTarget = parseFloat(document.getElementById('carbsTarget')?.value || 280);
        const fatTarget = parseFloat(document.getElementById('fatTarget')?.value || 65);
        mealsToShow = generateMeals(targetCalories, mealsPerDay, proteinTarget, carbsTarget, fatTarget);
    }
    
    const html = mealsToShow.map(meal => `
        <div class="meal-card">
            <div class="meal-header">
                <div class="meal-time">
                    <i class="fas ${meal.icon || 'fa-utensils'}"></i>
                    <div class="meal-time-info">
                        <h3>${meal.name || meal.meal_type}</h3>
                        <p>${meal.time || ''}</p>
                    </div>
                </div>
                <div class="meal-calories">
                    <h4>${meal.calories || 0}</h4>
                    <p>calories</p>
                </div>
            </div>
            <div class="meal-content">
                <h4>Food Items:</h4>
                <ul>
                    ${(meal.items || []).map(item => `
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>${typeof item === 'string' ? item : item.name}</span>
                        </li>
                    `).join('')}
                </ul>
                <div class="meal-macros">
                    <div class="macro-item">
                        <i class="fas fa-drumstick-bite"></i>
                        <span>Protein: <strong>${meal.macros?.protein || 0}g</strong></span>
                    </div>
                    <div class="macro-item">
                        <i class="fas fa-bread-slice"></i>
                        <span>Carbs: <strong>${meal.macros?.carbs || 0}g</strong></span>
                    </div>
                    <div class="macro-item">
                        <i class="fas fa-cheese"></i>
                        <span>Fats: <strong>${meal.macros?.fats || 0}g</strong></span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function getManualMeals(targetCalories, proteinTarget, carbsTarget, fatTarget) {
    const b = document.getElementById('manualBreakfast')?.value.trim();
    const l = document.getElementById('manualLunch')?.value.trim();
    const d = document.getElementById('manualDinner')?.value.trim();
    const s = document.getElementById('manualSnacks')?.value.trim();
    
    if(!b && !l && !d && !s) return null;
    
    let meals = [];
    const bItems = b ? b.split(',').map(i=>({name: i.trim()})).filter(i=>i.name) : null;
    const lItems = l ? l.split(',').map(i=>({name: i.trim()})).filter(i=>i.name) : null;
    const dItems = d ? d.split(',').map(i=>({name: i.trim()})).filter(i=>i.name) : null;
    const sItems = s ? s.split(',').map(i=>({name: i.trim()})).filter(i=>i.name) : null;
    
    let parts = (bItems?1:0) + (lItems?1:0) + (dItems?1:0) + (sItems?0.5:0);
    if(parts === 0) return null;
    
    const calPart = Math.round(targetCalories / parts);
    const pPart = Math.round(proteinTarget / parts);
    const cPart = Math.round(carbsTarget / parts);
    const fPart = Math.round(fatTarget / parts);

    if(bItems) meals.push({meal_type: 'breakfast', name: 'Breakfast', time: '8:00 AM', icon: 'fa-mug-hot', calories: calPart, items: bItems, macros: {protein: pPart, carbs: cPart, fats: fPart}});
    if(lItems) meals.push({meal_type: 'lunch', name: 'Lunch', time: '1:00 PM', icon: 'fa-utensils', calories: calPart, items: lItems, macros: {protein: pPart, carbs: cPart, fats: fPart}});
    if(dItems) meals.push({meal_type: 'dinner', name: 'Dinner', time: '7:30 PM', icon: 'fa-drumstick-bite', calories: calPart, items: dItems, macros: {protein: pPart, carbs: cPart, fats: fPart}});
    if(sItems) meals.push({meal_type: 'snacks', name: 'Snacks', time: '4:00 PM', icon: 'fa-cookie', calories: Math.round(calPart*0.5), items: sItems, macros: {protein: Math.round(pPart*0.5), carbs: Math.round(cPart*0.5), fats: Math.round(fPart*0.5)}});
    
    return meals;
}

function setupPreferencesForm() {
    const form = document.getElementById('dietPreferencesForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn?.innerHTML || 'Save';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }
            
            const mealFrequency = parseInt(document.getElementById('mealsPerDay').value);
            const targetCalories = parseInt(document.getElementById('targetCalories').value);
            
            const dietGoal = document.getElementById('dietGoal')?.value || 'maintenance';
            const proteinTarget = parseFloat(document.getElementById('proteinTarget')?.value || 150);
            const carbsTarget = parseFloat(document.getElementById('carbsTarget')?.value || 280);
            const fatTarget = parseFloat(document.getElementById('fatTarget')?.value || 65);
            const waterGoal = parseFloat(document.getElementById('waterGoal')?.value || 3.0);
            
            const formData = {
                diet_type: document.getElementById('dietType').value,
                goal: dietGoal,
                meal_frequency: mealFrequency,
                target_calories: targetCalories,
                protein_target: proteinTarget,
                carbs_target: carbsTarget,
                fat_target: fatTarget,
                water_goal: waterGoal,
                preferences: {
                    restrictions: Array.from(document.querySelectorAll('input[name="restrictions"]:checked')).map(cb => cb.value),
                    food_dislikes: document.getElementById('foodDislikes').value
                },
                meals: getManualMeals(targetCalories, proteinTarget, carbsTarget, fatTarget) || generateMeals(targetCalories, mealFrequency, proteinTarget, carbsTarget, fatTarget)
            };

            try {
                // Try to update first, then create if it doesn't exist
                if (currentDietPlan) {
                    currentDietPlan = await api.updateDietPlan(formData);
                } else {
                    currentDietPlan = await api.createDietPlan(formData);
                }
                
                // Also save to localStorage as backup
                localStorage.setItem('dietPreferences', JSON.stringify({
                    dietType: formData.diet_type,
                    mealsPerDay: formData.meal_frequency,
                    targetCalories: formData.target_calories,
                    restrictions: formData.preferences.restrictions,
                    foodDislikes: formData.preferences.food_dislikes,
                    lastUpdated: new Date().toISOString()
                }));
                
                showNotification('Diet preferences saved successfully!', 'success');
                
                // Reload meal plan with new preferences
                loadMealPlan();
                updateNutritionGoalsDisplay();
            } catch (error) {
                showNotification(error.message || 'Failed to save diet preferences', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
        });
        
        // Update meal plan when meals per day changes
        document.getElementById('mealsPerDay').addEventListener('change', loadMealPlan);
    }
}

function setupWeekTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const dayPlanContent = document.getElementById('dayPlanContent');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Load day plan
            const day = this.dataset.day;
            loadDayPlan(day);
        });
    });
    
    // Load Monday by default
    if (dayPlanContent) {
        loadDayPlan('monday');
    }
}

function loadDayPlan(day) {
    const dayPlanContent = document.getElementById('dayPlanContent');
    
    if (!dayPlanContent) return;
    
    const dayName = capitalizeFirst(day);
    
    // Calculate total macros dynamically from current plan if exists
    let targetCalories = 2400, totalProtein = 150, totalCarbs = 280, totalFats = 65;
    
    if (currentDietPlan && currentDietPlan.meals && currentDietPlan.meals.length > 0) {
        targetCalories = currentDietPlan.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        totalProtein = currentDietPlan.meals.reduce((sum, meal) => sum + (meal.macros?.protein || 0), 0);
        totalCarbs = currentDietPlan.meals.reduce((sum, meal) => sum + (meal.macros?.carbs || 0), 0);
        totalFats = currentDietPlan.meals.reduce((sum, meal) => sum + (meal.macros?.fats || 0), 0);
    } else {
        const inputCalories = parseInt(document.getElementById('targetCalories')?.value || 2400);
        targetCalories = inputCalories;
        totalProtein = parseFloat(document.getElementById('proteinTarget')?.value || Math.round(inputCalories * 0.25 / 4));
        totalCarbs = parseFloat(document.getElementById('carbsTarget')?.value || Math.round(inputCalories * 0.50 / 4));
        totalFats = parseFloat(document.getElementById('fatTarget')?.value || Math.round(inputCalories * 0.25 / 9));
    }
    
    dayPlanContent.innerHTML = `
        <h3>${dayName}'s Meal Plan</h3>
        <div style="margin-top: 1.5rem;">
            <div style="background: var(--bg-light); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.75rem; color: var(--text-dark);">Daily Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <strong style="color: var(--primary-color);">${targetCalories.toLocaleString()}</strong>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Total Calories</p>
                    </div>
                    <div>
                        <strong style="color: var(--success-color);">${totalProtein}g</strong>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Protein</p>
                    </div>
                    <div>
                        <strong style="color: var(--warning-color);">${totalCarbs}g</strong>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Carbs</p>
                    </div>
                    <div>
                        <strong style="color: var(--info-color);">${totalFats}g</strong>
                        <p style="color: var(--text-light); font-size: 0.9rem;">Fats</p>
                    </div>
                </div>
            </div>
            
            <div class="empty-state" style="margin-top: 2rem;">
                <i class="fas fa-calendar-day" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem; display: block;"></i>
                <h4>Meal schedule for ${dayName}</h4>
                <p>Follow your meal plan strictly for best results. Keep track of your progress.</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="document.querySelector('.tab-btn[data-tab=\\'mealPlan\\']')?.click()"><i class="fas fa-list"></i> View Daily Plan Details</button>
            </div>
        </div>
    `;
}

async function generateDietPlan() {
    const btn = document.querySelector('button[onclick="generateDietPlan()"]');
    const originalContent = btn ? btn.innerHTML : null;
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating your personalized plan...';
        btn.disabled = true;
    }
    showNotification('AI is calculating your ideal diet constraints...', 'info');

    try {
        const formData = {
            diet_type: document.getElementById('dietType').value || 'balanced',
            goal: document.getElementById('dietGoal')?.value || 'maintenance',
            meal_frequency: parseInt(document.getElementById('mealsPerDay').value || 5),
            target_calories: parseInt(document.getElementById('targetCalories').value || 2500),
            protein_target: parseFloat(document.getElementById('proteinTarget')?.value || 150),
            carbs_target: parseFloat(document.getElementById('carbsTarget')?.value || 280),
            fat_target: parseFloat(document.getElementById('fatTarget')?.value || 65),
            water_goal: parseFloat(document.getElementById('waterGoal')?.value || 3.0),
            preferences: {
                restrictions: Array.from(document.querySelectorAll('input[name="restrictions"]:checked')).map(cb => cb.value),
                food_dislikes: document.getElementById('foodDislikes')?.value || ''
            },
            meals: currentDietPlan ? currentDietPlan.meals : []
        };

        if (currentDietPlan) {
            currentDietPlan = await api.updateDietPlan(formData);
        } else {
            currentDietPlan = await api.createDietPlan(formData);
        }

        // Now call the AI endpoint
        currentDietPlan = await api.generateDietPlan();

        loadMealPlan();
        updateNutritionGoalsDisplay();

        // Try to reload current tab day to refresh macro numbers
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.dataset.day) {
            loadDayPlan(activeTab.dataset.day);
        }

        showNotification('Personalized AI diet plan generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating plan:', error);
        showNotification(error.message || 'Failed to generate AI diet plan.', 'error');
    } finally {
        if (btn && originalContent) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
