// ===========================
// Rules & Safety Functions
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    setupAcknowledgment();
    checkPreviousAcknowledgment();
});

function setupAcknowledgment() {
    const checkbox = document.getElementById('rulesAcknowledge');
    const acknowledgeBtn = document.getElementById('acknowledgeBtn');
    
    if (checkbox && acknowledgeBtn) {
        checkbox.addEventListener('change', function() {
            acknowledgeBtn.disabled = !this.checked;
        });
        
        acknowledgeBtn.addEventListener('click', function() {
            if (checkbox.checked) {
                const acknowledgment = {
                    acknowledged: true,
                    date: new Date().toISOString(),
                    studentId: JSON.parse(localStorage.getItem('userData') || '{}').studentId
                };
                
                localStorage.setItem('rulesAcknowledgment', JSON.stringify(acknowledgment));
                
                showNotification('Thank you for acknowledging the gym rules and safety guidelines!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    }
}

function checkPreviousAcknowledgment() {
    const acknowledgment = localStorage.getItem('rulesAcknowledgment');
    
    if (acknowledgment) {
        const ackData = JSON.parse(acknowledgment);
        const ackDate = new Date(ackData.date);
        const formattedDate = ackDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Show acknowledgment status
        const acknowledgmentSection = document.querySelector('.acknowledgment-section');
        if (acknowledgmentSection && ackData.acknowledged) {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'alert alert-info';
            statusDiv.style.marginBottom = '1.5rem';
            statusDiv.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Rules Acknowledged</strong>
                    <p>You acknowledged the gym rules and safety guidelines on ${formattedDate}.</p>
                </div>
            `;
            acknowledgmentSection.insertBefore(statusDiv, acknowledgmentSection.firstChild);
        }
    }
}

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
