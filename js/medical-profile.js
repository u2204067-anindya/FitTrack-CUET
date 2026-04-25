// ===========================
// Medical Profile Functions
// ===========================

// Medical profile data from API
let currentMedicalProfile = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    loadMedicalProfile();
    setupBMICalculator();
    setupAllergyToggle();
    setupFormSubmission();
});

async function loadMedicalProfile() {
    try {
        currentMedicalProfile = await api.getMedicalProfile();
        if (currentMedicalProfile) {
            populateForm(currentMedicalProfile);
        }
    } catch (error) {
        console.error('Failed to load medical profile:', error);
    }
}

function populateForm(profile) {
    // Basic info (from API response)
    if (profile.age) document.getElementById('age').value = profile.age;
    if (profile.gender) document.getElementById('gender').value = profile.gender;
    if (profile.height) document.getElementById('height').value = profile.height;
    if (profile.weight) document.getElementById('weight').value = profile.weight;
    if (profile.blood_group) document.getElementById('bloodGroup').value = profile.blood_group;
    
    // Medical history
    if (profile.medical_conditions && profile.medical_conditions.length > 0) {
        profile.medical_conditions.forEach(condition => {
            const checkbox = document.querySelector(`input[name="conditions"][value="${condition}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (profile.conditions_details) document.getElementById('conditionsDetails').value = profile.conditions_details;
    if (profile.past_injuries) document.getElementById('pastInjuries').value = profile.past_injuries;
    if (profile.current_medications) document.getElementById('currentMedications').value = profile.current_medications;
    
    // Allergies
    if (profile.allergies && profile.allergies.length > 0) {
        document.querySelector('input[name="hasAllergies"][value="yes"]').checked = true;
        document.getElementById('allergyDetailsGroup').style.display = 'block';
        document.getElementById('allergyDetails').value = profile.allergies.join(', ');
    } else {
        document.querySelector('input[name="hasAllergies"][value="no"]').checked = true;
    }
    
    // Fitness goals
    if (profile.fitness_goal) document.getElementById('fitnessGoal').value = profile.fitness_goal;
    if (profile.physical_limitations) document.getElementById('physicalLimitations').value = profile.physical_limitations;
    if (profile.activity_level) document.getElementById('fitnessLevel').value = profile.activity_level;
        if (profile.target_weight) document.getElementById('targetWeight').value = profile.target_weight;

        // Emergency contact
        if (profile.emergency_contact) {
            if (profile.emergency_contact.name) document.getElementById('emergencyName').value = profile.emergency_contact.name;
            if (profile.emergency_contact.relation) document.getElementById('emergencyRelation').value = profile.emergency_contact.relation;
            if (profile.emergency_contact.phone) document.getElementById('emergencyPhone').value = profile.emergency_contact.phone;
        }

        // Doctor info
        if (profile.doctor_name) document.getElementById('doctorName').value = profile.doctor_name;
        if (profile.doctor_phone) document.getElementById('doctorPhone').value = profile.doctor_phone;
        
        const heightInput = document.getElementById('height');
        if(heightInput) heightInput.dispatchEvent(new Event('input'));
    }


function populateFormFromLocal(profile) {
    // Basic info
    if (profile.age) document.getElementById('age').value = profile.age;
    if (profile.gender) document.getElementById('gender').value = profile.gender;
    if (profile.height) document.getElementById('height').value = profile.height;
    if (profile.weight) document.getElementById('weight').value = profile.weight;
    if (profile.bloodGroup) document.getElementById('bloodGroup').value = profile.bloodGroup;
    
    // Medical history
    if (profile.conditions) {
        profile.conditions.forEach(condition => {
            const checkbox = document.querySelector(`input[name="conditions"][value="${condition}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (profile.conditionsDetails) document.getElementById('conditionsDetails').value = profile.conditionsDetails;
    if (profile.pastInjuries) document.getElementById('pastInjuries').value = profile.pastInjuries;
    if (profile.currentMedications) document.getElementById('currentMedications').value = profile.currentMedications;
    
    // Allergies
    if (profile.hasAllergies) {
        document.querySelector(`input[name="hasAllergies"][value="${profile.hasAllergies}"]`).checked = true;
        if (profile.hasAllergies === 'yes') {
            document.getElementById('allergyDetailsGroup').style.display = 'block';
            if (profile.allergyDetails) document.getElementById('allergyDetails').value = profile.allergyDetails;
        }
    }
    
    // Fitness goals
    if (profile.fitnessGoal) document.getElementById('fitnessGoal').value = profile.fitnessGoal;
    if (profile.physicalLimitations) document.getElementById('physicalLimitations').value = profile.physicalLimitations;
    if (profile.fitnessLevel) document.getElementById('fitnessLevel').value = profile.fitnessLevel;
    if (profile.targetWeight) document.getElementById('targetWeight').value = profile.targetWeight;

    // Emergency contact
    if (profile.emergencyName) document.getElementById('emergencyName').value = profile.emergencyName;
    if (profile.emergencyRelation) document.getElementById('emergencyRelation').value = profile.emergencyRelation;
    if (profile.emergencyPhone) document.getElementById('emergencyPhone').value = profile.emergencyPhone;

    // Doctor info
    if (profile.doctorName) document.getElementById('doctorName').value = profile.doctorName;
    if (profile.doctorPhone) document.getElementById('doctorPhone').value = profile.doctorPhone;
    
    const heightInput = document.getElementById('height');
    if(heightInput) heightInput.dispatchEvent(new Event('input'));
}

function setupBMICalculator() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiInput = document.getElementById('bmi');

    function calculateBMI() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);

        if (height && weight && height > 0 && weight > 0) {
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

            let category = '';
            if (bmi < 18.5) category = 'Underweight';
            else if (bmi < 25) category = 'Normal';
            else if (bmi < 30) category = 'Overweight';
            else category = 'Obese';

            if(bmiInput) bmiInput.value = `${bmi} (${category})`;
        } else {
            if(bmiInput) bmiInput.value = '';
        }
    }

    if (heightInput && weightInput) {
        heightInput.addEventListener('input', calculateBMI);
        weightInput.addEventListener('input', calculateBMI);
    }
}

function setupAllergyToggle() {
    const allergyRadios = document.querySelectorAll('input[name="hasAllergies"]');
    const allergyDetailsGroup = document.getElementById('allergyDetailsGroup');
    
    allergyRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                allergyDetailsGroup.style.display = 'block';
            } else {
                allergyDetailsGroup.style.display = 'none';
            }
        });
    });
}

function setupFormSubmission() {
    const form = document.getElementById('medicalProfileForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn?.innerHTML || 'Save';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }
            
            // Collect form data for API
            const allergiesText = document.getElementById('allergyDetails').value;
            const hasAllergies = document.querySelector('input[name="hasAllergies"]:checked')?.value === 'yes';
            
            const formData = {
                age: parseInt(document.getElementById('age').value) || null,
                gender: document.getElementById('gender').value,
                height: parseFloat(document.getElementById('height').value) || null,
                weight: parseFloat(document.getElementById('weight').value) || null,
                blood_group: document.getElementById('bloodGroup').value,
                medical_conditions: Array.from(document.querySelectorAll('input[name="conditions"]:checked')).map(cb => cb.value),
                conditions_details: document.getElementById('conditionsDetails').value,
                past_injuries: document.getElementById('pastInjuries').value,
                current_medications: document.getElementById('currentMedications').value,
                allergies: hasAllergies && allergiesText ? allergiesText.split(',').map(a => a.trim()) : [],
                fitness_goal: document.getElementById('fitnessGoal').value,
                physical_limitations: document.getElementById('physicalLimitations').value,
                activity_level: document.getElementById('fitnessLevel').value,
                target_weight: document.getElementById('targetWeight').value ? parseFloat(document.getElementById('targetWeight').value) : null,
                emergency_contact: {
                    name: document.getElementById('emergencyName').value,
                    relation: document.getElementById('emergencyRelation').value,
                    phone: document.getElementById('emergencyPhone').value
                },
                doctor_name: document.getElementById('doctorName').value,
                doctor_phone: document.getElementById('doctorPhone').value
            };
            
            try {
                // Try to update first, then create if it doesn't exist
                if (currentMedicalProfile) {
                    currentMedicalProfile = await api.updateMedicalProfile(formData);
                } else {
                    currentMedicalProfile = await api.createMedicalProfile(formData);
                }
                
                // Also save to localStorage as backup
                localStorage.setItem('medicalProfile', JSON.stringify({
                    age: formData.age,
                    gender: formData.gender,
                    height: formData.height,
                    weight: formData.weight,
                    bloodGroup: formData.blood_group,
                    conditions: formData.medical_conditions,
                    conditionsDetails: formData.conditions_details,
                    pastInjuries: formData.past_injuries,
                    currentMedications: formData.current_medications,
                    hasAllergies: hasAllergies ? 'yes' : 'no',
                    allergyDetails: allergiesText,
                    fitnessGoal: formData.fitness_goal,
                    physicalLimitations: formData.physical_limitations,
                    fitnessLevel: formData.activity_level,
                    targetWeight: formData.target_weight,
                    emergencyName: formData.emergency_contact.name,
                    emergencyRelation: formData.emergency_contact.relation,
                    emergencyPhone: formData.emergency_contact.phone,
                    doctorName: formData.doctor_name,
                    doctorPhone: formData.doctor_phone,
                    lastUpdated: new Date().toISOString()
                }));
                
                showNotification('Medical profile saved successfully!', 'success');
                
                // Optionally redirect
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                showNotification(error.message || 'Failed to save medical profile', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
        });
    }
}
