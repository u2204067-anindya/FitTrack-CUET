// ===========================
// AI Instructor Functions
// ===========================

// Fallback AI responses (used when API is unavailable)
const fallbackResponses = {
    workout_plan: "Here's a personalized workout plan for chest and triceps:\n\n**Warm-up (5-10 minutes):**\n- Light cardio (treadmill/bike)\n- Dynamic stretches\n\n**Main Workout:**\n1. Barbell Bench Press - 4 sets x 8-10 reps\n2. Incline Dumbbell Press - 3 sets x 10-12 reps\n3. Cable Flyes - 3 sets x 12-15 reps\n4. Tricep Dips - 3 sets x 10-12 reps\n5. Tricep Pushdowns - 3 sets x 12-15 reps\n6. Overhead Tricep Extension - 3 sets x 12 reps\n\n**Cool-down:**\n- Light stretching for chest and arms\n\nRemember to rest 60-90 seconds between sets!",
    
    default: "I'm here to help with your fitness journey! I can assist you with:\n\n• Creating workout plans\n• Explaining proper exercise form\n• Equipment usage guidance\n• Injury prevention tips\n• Warm-up and cool-down routines\n• Progressive overload strategies\n• Workout programming\n\nWhat specific fitness topic would you like to discuss?"
};

let chatHistory = [];
let currentContext = 'general';

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    setupChatForm();
    setupQuickPrompts();
    setupContextSelector();
    adjustTextareaHeight();
    loadChatHistory();
});

async function loadChatHistory() {
    try {
        const response = await api.getAIChatHistory({ limit: 20 });
        if (response.messages && response.messages.length > 0) {
            // Display recent messages
            response.messages.reverse().forEach(msg => {
                addMessageToChat(msg.user_message, 'user', new Date(msg.created_at), false);
                addMessageToChat(msg.ai_response, 'ai', new Date(msg.created_at), false);
            });
        }
    } catch (error) {
        console.log('Could not load chat history:', error.message);
    }
}

function setupContextSelector() {
    const contextSelect = document.getElementById('chatContext');
    if (contextSelect) {
        contextSelect.addEventListener('change', function() {
            currentContext = this.value;
        });
    }
}

function setupChatForm() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    
    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = chatInput.value.trim();
            
            if (message) {
                sendMessage(message);
                chatInput.value = '';
                chatInput.style.height = 'auto';
            }
        });
        
        // Auto-resize textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

function setupQuickPrompts() {
    const promptButtons = document.querySelectorAll('.prompt-btn');
    
    promptButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            sendQuickPrompt(message);
        });
    });
}

function sendQuickPrompt(message) {
    sendMessage(message);
}

async function sendMessage(message) {
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable input while waiting
    const chatInput = document.getElementById('chatInput');
    const submitBtn = document.querySelector('#chatForm button[type="submit"]');
    if (chatInput) chatInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        // Call backend AI API
        const response = await api.chatWithAI(message, currentContext, true);
        hideTypingIndicator();
        
        if (response && response.ai_response) {
            addMessageToChat(response.ai_response, 'ai');
        } else {
            throw new Error('Invalid response from AI');
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('AI API error:', error);
        
        // Fallback to static response
        const fallbackResponse = generateFallbackResponse(message);
        addMessageToChat(fallbackResponse, 'ai');
        
        // Show notification about fallback
        if (typeof showNotification === 'function') {
            showNotification('Using offline mode - AI features limited', 'info');
        }
    } finally {
        // Re-enable input
        if (chatInput) chatInput.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        if (chatInput) chatInput.focus();
    }
}

function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('workout plan') || lowerMessage.includes('exercise plan')) {
        return fallbackResponses.workout_plan;
    }
    
    return fallbackResponses.default;
}

function addMessageToChat(message, sender, timestamp = null, scrollToBottom = true) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const now = timestamp || new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${sender === 'ai' ? 'AI Instructor' : 'You'}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-text">
                ${formatMessageText(message)}
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    if (scrollToBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Store in local history
    chatHistory.push({
        role: sender,
        message: message,
        timestamp: now
    });
}

function formatMessageText(text) {
    // Convert line breaks to paragraphs
    let formatted = text.split('\n\n').map(para => {
        if (para.trim().startsWith('**') && para.includes(':**')) {
            // Bold headers
            return '<p><strong>' + para.replace(/\*\*/g, '') + '</strong></p>';
        } else if (para.trim().match(/^\d+\./)) {
            // Numbered lists
            const items = para.split('\n').map(line => {
                if (line.trim().match(/^\d+\./)) {
                    return '<li>' + line.replace(/^\d+\.\s*/, '') + '</li>';
                }
                return line;
            }).join('');
            return '<ol>' + items + '</ol>';
        } else if (para.trim().startsWith('-') || para.trim().startsWith('•')) {
            // Bullet lists
            const items = para.split('\n').map(line => {
                if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return '<li>' + line.replace(/^[-•]\s*/, '') + '</li>';
                }
                return line;
            }).join('');
            return '<ul>' + items + '</ul>';
        } else {
            return '<p>' + para + '</p>';
        }
    }).join('');
    
    // Bold text with **
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    return formatted;
}

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = 'flex';
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function adjustTextareaHeight() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.style.height = 'auto';
    }
}
