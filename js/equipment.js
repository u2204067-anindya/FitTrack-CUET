// Equipment functionality
document.addEventListener('DOMContentLoaded', () => {
    // Only load equipment if we are on the equipment or equipment-guide page
    const equipmentGrid = document.getElementById('equipmentCatalog') || document.querySelector('.equipment-grid');
    const categoryButtons = document.querySelectorAll('.filter-btn, .category-btn');
    const equipmentCount = document.getElementById('equipmentCount');
    const searchInput = document.getElementById('equipmentSearch');
    
    if (!equipmentGrid) return;
    
    let allEquipment = [];

    // Fetch equipment from backend database
    async function loadEquipment() {
        try {
            // Show loading state
            equipmentGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align:center; padding: 3rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading equipment database...</p></div>';
            
            const response = await api.getEquipment();
            
            const dataToProcess = response.data ? response.data : (response.equipment || response);
            
            // The API groups by category, we need to flatten it for our grid filtering
            allEquipment = [];
            
            if (Array.isArray(dataToProcess)) {
                dataToProcess.forEach(item => {
                    allEquipment.push(formatEquipmentItem(item));
                });
            }
            
            function formatEquipmentItem(item) {
                return {
                    id: item.id,
                    name: item.name,
                    category: (item.category || 'Other').toLowerCase(), // Ensure lowercase for filtering
                    icon: getIconForCategory(item.category || ''),
                    status: item.is_available ? 'Available' : 'Maintenance',
                    description: item.description || 'No description available.',
                    muscles: item.muscle_groups || "Multiple muscle groups",
                    difficulty: item.difficulty_level || "All Levels",
                    capacity: "1 person",
                    sessionTime: "Varies",
                    instructions: item.instructions || "No specific instructions.",
                    safety_tips: item.safety_tips || "Follow general gym safety guidelines.",
                    quantity: item.quantity || 1,
                    available_quantity: item.available_quantity || 0,
                    is_available: item.is_available,
                    location: item.location || "General Area",
                    last_maintenance: item.last_maintenance || "N/A",
                    next_maintenance: item.next_maintenance || "N/A",
                    image_url: item.image_url || null
                };
            }
            
            if (allEquipment.length > 0) {
                renderEquipmentGrid(allEquipment);
                setupFiltering();
                if (searchInput) setupSearch();
            } else {
                equipmentGrid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; text-align:center;"><p>No equipment found in database.</p></div>';
            }
        } catch (error) {
            console.error('Error loading equipment:', error);
            equipmentGrid.innerHTML = `
                <div class="error-state" style="grid-column: 1/-1; text-align:center; padding: 2rem;">
                    <i class="fas fa-exclamation-circle fa-2x" style="color: #dc3545; margin-bottom: 1rem;"></i>
                    <p>Failed to retrieve equipment from the PostgreSQL database.</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">Retry Connection</button>
                </div>
            `;
        }
    }

    // Map categories to FontAwesome icons
    function getIconForCategory(category) {
        const cat = category.toLowerCase();
        if (cat.includes('cardio')) return 'fa-person-running';
        if (cat.includes('strength')) return 'fa-dumbbell';
        if (cat.includes('machine')) return 'fa-cogs';
        if (cat.includes('bodyweight')) return 'fa-child-reaching';
        return 'fa-dumbbell'; // default
    }

    // Render the grid cards
    function renderEquipmentGrid(items) {
        equipmentGrid.innerHTML = '';
        
        if (items.length === 0) {
            equipmentGrid.innerHTML = '<div class="no-results"><p>No equipment found matching your criteria.</p></div>';
            return;
        }

        items.forEach(eq => {
            const statusClass = eq.status === 'Available' || eq.status === 'available' ? 'status-available' : 'status-maintenance';
            const statusText = (eq.status || 'Available').charAt(0).toUpperCase() + (eq.status || 'Available').slice(1);
            
            const card = document.createElement('div');
            card.className = `equipment-card fade-in`;
            card.dataset.category = eq.category;
            
            card.innerHTML = `
                <div class="equipment-header">
                    <div class="equipment-icon">
                        <i class="fas ${eq.icon}"></i>
                    </div>
                    <span class="equipment-status ${statusClass}">
                        <i class="fas ${statusClass === 'status-available' ? 'fa-check-circle' : 'fa-wrench'}"></i>
                        ${statusText}
                    </span>
                </div>
                <div class="equipment-body">
                    <h3>${eq.name}</h3>
                    <p class="equipment-category">${eq.category.charAt(0).toUpperCase() + eq.category.slice(1)}</p>
                    <p class="equipment-desc">${eq.description || 'No description available.'}</p>
                </div>
                <div class="equipment-footer">
                    <button class="btn btn-outline" onclick="window.showEquipmentGuide(${eq.id})">
                        <i class="fas fa-book-open"></i> Usage Guide
                    </button>
                </div>
            `;
            equipmentGrid.appendChild(card);
        });
    }

    // Modal popup for equipment guide
    window.showEquipmentGuide = function(id) {
        const eq = allEquipment.find(item => item.id === id);
        if (!eq) return;

        // Remove existing modal if any
        const existing = document.getElementById('equipmentModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'equipmentModal';
        modal.dataset.testid = 'equipment-details-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
        modal.style.backdropFilter = 'blur(4px)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.padding = '20px';
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';

        const statusClass = eq.status === 'Available' || eq.status === 'available' ? 'status-available' : 'status-maintenance';
        
        // Format dates if available
        const lastMaint = eq.last_maintenance && eq.last_maintenance !== 'N/A' ? formatDate(eq.last_maintenance) : 'N/A';
        const nextMaint = eq.next_maintenance && eq.next_maintenance !== 'N/A' ? formatDate(eq.next_maintenance) : 'N/A';

        modal.innerHTML = `
            <div style="background: var(--bg-card, #fff); color: var(--text-color, #333); width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 0; position: relative; box-shadow: 0 15px 40px rgba(0,0,0,0.3); transform: scale(0.95); transition: transform 0.3s ease;" class="modal-content-box">
                
                <!-- HEADER -->
                <div style="background: var(--primary-color, #004aad); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; font-size: 1.5rem; display:flex; align-items:center; justify-content:center;">
                            <i class="fas ${eq.icon}"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem; color: white;">${eq.name}</h2>
                            <div style="display: flex; gap: 10px; margin-top: 5px; align-items: center;">
                                <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem;">${eq.category.charAt(0).toUpperCase() + eq.category.slice(1)}</span>
                                <span class="equipment-status ${statusClass}" style="font-size: 0.85rem; padding: 4px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border: 2px solid rgba(255,255,255,0.8);">${eq.status}</span>
                            </div>
                        </div>
                    </div>
                    <button id="closeModalBtn" style="background: none; border: none; color: white; font-size: 1.8rem; cursor: pointer; transition: transform 0.2s;"><i class="fas fa-times"></i></button>
                </div>

                <!-- BODY -->
                <div style="padding: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
                    
                    <!-- Basic Info & Maintenance -->
                    <div style="display: flex; flex-direction: column; gap: 25px;">
                        <div style="background: var(--bg-hover, #f8f9fa); padding: 20px; border-radius: 12px; border: 1px solid var(--border-color, #eee);">
                            <h4 style="margin-top: 0; color: var(--primary-color, #004aad); font-size: 1.2rem; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;"><i class="fas fa-info-circle"></i> Basic Info</h4>
                            <p style="margin-bottom: 12px; line-height: 1.5;"><strong><i class="fas fa-align-left" style="width:20px; color:#6c757d"></i> Description:</strong><br>${eq.description}</p>
                            <p style="margin-bottom: 12px;"><strong><i class="fas fa-dumbbell" style="width:20px; color:#6c757d"></i> Target Muscles:</strong> ${eq.muscles}</p>
                            <p style="margin-bottom: 12px;"><strong><i class="fas fa-tachometer-alt" style="width:20px; color:#6c757d"></i> Difficulty:</strong> ${eq.difficulty}</p>
                            <p style="margin-bottom: 0;"><strong><i class="fas fa-map-marker-alt" style="width:20px; color:#6c757d"></i> Location:</strong> ${eq.location}</p>
                        </div>
                        
                        <div style="background: var(--bg-hover, #f8f9fa); padding: 20px; border-radius: 12px; border-left: 4px solid var(--primary-color, #004aad); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h4 style="margin-top: 0; color: var(--text-color, #333); font-size: 1.1rem; margin-bottom: 15px;"><i class="fas fa-box-open" style="color:var(--primary-color, #004aad);"></i> Inventory & Maintenance</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 3px;">Total Units</div>
                                    <div style="font-size: 1.2rem; font-weight: bold;">${eq.quantity}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 3px;">Available Units</div>
                                    <div style="font-size: 1.2rem; font-weight: bold; color: ${eq.available_quantity > 0 ? '#28a745' : '#dc3545'};">${eq.available_quantity}</div>
                                </div>
                                <div style="grid-column: 1 / -1; height: 1px; background: #dee2e6; margin: 5px 0;"></div>
                                <div>
                                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 3px;">Last Maintenance</div>
                                    <div style="font-size: 0.95rem; font-weight: 500;">${lastMaint}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 3px;">Next Maintenance</div>
                                    <div style="font-size: 0.95rem; font-weight: 500;">${nextMaint}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Usage & Safety -->
                    <div style="display: flex; flex-direction: column; gap: 25px;">
                        <div style="background: rgba(40, 167, 69, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(40, 167, 69, 0.2);">
                            <h4 style="margin-top: 0; color: #28a745; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;"><i class="fas fa-clipboard-list"></i> Usage Instructions</h4>
                            <p style="margin-bottom: 0; line-height: 1.6; white-space: pre-wrap;">${eq.instructions}</p>
                        </div>
                        
                        <div style="background: rgba(220, 53, 69, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(220, 53, 69, 0.2);">
                            <h4 style="margin-top: 0; color: #dc3545; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;"><i class="fas fa-shield-alt"></i> Safety Tips</h4>
                            <p style="margin-bottom: 0; line-height: 1.6; white-space: pre-wrap;">${eq.safety_tips}</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content-box').style.transform = 'scale(1)';
        });

        const closeFunc = () => {
            modal.style.opacity = '0';
            modal.querySelector('.modal-content-box').style.transform = 'scale(0.95)';
            setTimeout(() => modal.remove(), 300);
        };

        // Close events
        document.getElementById('closeModalBtn').addEventListener('click', closeFunc);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeFunc();
        });
    }

    // Setup category filtering
    function setupFiltering() {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                categoryButtons.forEach(b => b.classList.remove('active'));
                e.target.closest('button').classList.add('active');

                // Filter equipment
                const category = e.target.closest('button').dataset.category;
                const filtered = category === 'all' 
                    ? allEquipment 
                    : allEquipment.filter(eq => eq.category.includes(category) || category.includes(eq.category));
                
                renderEquipmentGrid(filtered);
            });
        });
    }

    // Setup search filtering
    function setupSearch() {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (!term) {
                // Re-apply current category filter
                const activeBtn = document.querySelector('.filter-btn.active, .category-btn.active');
                const category = activeBtn ? activeBtn.dataset.category : 'all';
                const filtered = category === 'all' 
                    ? allEquipment 
                    : allEquipment.filter(eq => eq.category.includes(category) || category.includes(eq.category));
                renderEquipmentGrid(filtered);
                return;
            }
            
            const filtered = allEquipment.filter(eq => 
                eq.name.toLowerCase().includes(term) || 
                (eq.description && eq.description.toLowerCase().includes(term)) ||
                eq.category.toLowerCase().includes(term)
            );
            renderEquipmentGrid(filtered);
        });
    }

    // Load data on page init
    loadEquipment();
});

// Guide Page specific functionality
document.addEventListener('DOMContentLoaded', async () => {
    const guideContainer = document.getElementById('equipmentGuide');
    if (!guideContainer) return; // Only run on equipment-guide.html
    
    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const equipmentId = urlParams.get('id');
    
    if (!equipmentId) {
        window.location.href = 'equipment.html';
        return;
    }

    try {
        guideContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading guide...</p></div>';
        
        // Use realistic dummy data for the detailed guide sections 
        // since the backend only stores basic name/description currently
        const response = await api.getEquipmentById(equipmentId);
        
        const dbData = response.data || response;
        
        if (dbData && dbData.id) {
            const icon = (dbData.category || '').toLowerCase().includes('cardio') ? 'fa-person-running' : 'fa-dumbbell';
            const statusClass = dbData.is_available ? 'status-available' : 'status-maintenance';
            
            renderGuide({
                id: dbData.id,
                name: dbData.name,
                category: dbData.category || 'Equipment',
                icon: icon,
                status: dbData.is_available ? 'Available' : 'Maintenance',
                description: dbData.description || 'Professional fitness equipment designed for effective workouts.',
                muscles: dbData.muscle_groups || 'Multiple muscle groups based on usage',
                difficulty: dbData.difficulty_level || 'All Levels',
                capacity: "1 person",
                sessionTime: "15-45 minutes",
                
                // Generic details using backend's instructions
                guidelines: dbData.instructions ? dbData.instructions.split('. ').filter(n=>n) : [
                    "Adjust the equipment to fit your body size and proportions.",
                    "Start with a light warm-up set before adding working weight or resistance.",
                    "Maintain proper form and control throughout the entire movement.",
                    "Breathe naturally: exhale on exertion, inhale on the return phase.",
                    "Wipe down equipment after completing your sets."
                ],
                proTips: [
                    "Focus on the mind-muscle connection during each repetition.",
                    "Quality of movement is more important than quantity of weight.",
                    "Keep your core engaged for stability and safety.",
                    "If you feel sharp pain, stop immediately."
                ],
                benefits: [
                    { icon: "fa-heart", text: "Improves overall fitness" },
                    { icon: "fa-dumbbell", text: "Builds strength and endurance" },
                    { icon: "fa-person-running", text: "Supports your fitness journey at any level" }
                ],
                safety: dbData.safety_tips ? dbData.safety_tips.split('. ').filter(n=>n) : [
                    "Check for any broken or loose parts before use.",
                    "Do not exceed the machine's maximum weight limit.",
                    "Use safety clips or spotters when using heavy free weights."
                ]
            });
        } else {
            throw new Error('Equipment not found');
        }
    } catch (error) {
        console.error('Error loading guide:', error);
        guideContainer.innerHTML = `
            <div class="alert alert-danger" style="margin-top: 2rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Error</strong>
                    <p>Failed to load equipment details from database. Please return to the equipment page.</p>
                </div>
            </div>
            <a href="equipment.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Equipment</a>
        `;
    }

    function renderGuide(eq) {
        // Find existing elements and update them
        // Update header
        document.querySelector('.guide-header h1').innerHTML = `<i class="fas ${eq.icon}"></i> ${eq.name}`;
        
        // Render content
        guideContainer.innerHTML = `
            <div class="guide-grid">
                <!-- Overview Section -->
                <div class="guide-card guide-overview">
                    <div class="equipment-meta">
                        <span class="category-badge">${eq.category}</span>
                        <span class="status-badge ${eq.status.toLowerCase() === 'available' ? 'status-available' : 'status-maintenance'}">
                            <i class="fas ${eq.status.toLowerCase() === 'available' ? 'fa-check-circle' : 'fa-wrench'}"></i> ${eq.status}
                        </span>
                    </div>
                    
                    <p class="guide-description">${eq.description}</p>
                    
                    <div class="quick-stats">
                        <div class="stat-item">
                            <i class="fas fa-child"></i>
                            <div class="stat-info">
                                <strong>Target Muscles</strong>
                                <span>${eq.muscles}</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-signal"></i>
                            <div class="stat-info">
                                <strong>Difficulty</strong>
                                <span>${eq.difficulty}</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-stopwatch"></i>
                            <div class="stat-info">
                                <strong>Typical Session</strong>
                                <span>${eq.sessionTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Guidelines Section -->
                <div class="guide-card">
                    <h3><i class="fas fa-list-ol"></i> How to Use</h3>
                    <ul class="step-list">
                        ${eq.guidelines.map(step => `
                            <li>
                                <i class="fas fa-check-circle text-primary"></i>
                                <span>${step}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Tips & Safety Grid -->
                <div class="guide-tips-grid">
                    <div class="guide-card tip-card">
                        <h3><i class="fas fa-lightbulb"></i> Pro Tips</h3>
                        <ul>
                            ${eq.proTips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="guide-card safety-card">
                        <h3><i class="fas fa-shield-alt"></i> Safety Rules</h3>
                        <ul>
                            ${eq.safety.map(rule => `<li>${rule}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Benefits Section -->
                <div class="guide-card benefits-section">
                    <h3><i class="fas fa-star"></i> Key Benefits</h3>
                    <div class="benefits-grid">
                        ${eq.benefits.map(benefit => `
                            <div class="benefit-item">
                                <i class="fas ${benefit.icon}"></i>
                                <span>${benefit.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
});
