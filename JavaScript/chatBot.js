// User session management
let currentUser = null;

// Check for user session on page load
window.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    setupDropdownToggle();
    setupLogout();
});

function checkUserSession() {
    // Check for user data in sessionStorage (from userProfile navigation)
    const sessionUser = sessionStorage.getItem('currentUser');
    // Check for user email in localStorage (from login)
    const userEmail = localStorage.getItem('userEmail');
    
    if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
        showUserWelcome();
    } else if (userEmail) {
        loadUserDataFromEmail(userEmail);
    } else {
        showLoginRegister();
    }
}

async function loadUserDataFromEmail(email) {
    try {
        currentUser = { name: 'User', email: email };
        showUserWelcome();
        
        /*
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (!error && data) {
            currentUser = data;
            document.getElementById('welcomeUserName').textContent = data.name || 'User';
        }
        */
    } catch (error) {
        console.error('Error loading user data:', error);
        showLoginRegister();
    }
}

function showUserWelcome() {
    const userWelcomeSection = document.getElementById('userWelcomeSection');
    const loginRegisterSection = document.getElementById('loginRegisterSection');
    const welcomeUserName = document.getElementById('welcomeUserName');
    
    if (currentUser && currentUser.name) {
        welcomeUserName.textContent = currentUser.name;
    }
    
    userWelcomeSection.style.display = 'flex';
    loginRegisterSection.style.display = 'none';
}

function showLoginRegister() {
    const userWelcomeSection = document.getElementById('userWelcomeSection');
    const loginRegisterSection = document.getElementById('loginRegisterSection');
    
    userWelcomeSection.style.display = 'none';
    loginRegisterSection.style.display = 'flex';
}

function setupDropdownToggle() {
    const userProfileIcon = document.getElementById('userProfileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (userProfileIcon && dropdownMenu) {
        userProfileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
        
        // Prevent dropdown from closing when clicking inside it
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function logout() {
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    
    // Show login/register section
    showLoginRegister();
    
    // Optionally redirect to home page
}

const messagesContainer = document.querySelector('.chatbot-messages');
const input = document.querySelector('.message-input');
const sendBtn = document.querySelector('.send-btn');
const promptBtns = document.querySelectorAll('.prompt-btn');
const apiChoice = document.getElementById('api-choice');
const apiStatus = document.getElementById('api-status');

function appendMessage(text, sender = 'bot') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Use backend proxy for AI API calls
async function fetchLegalAnswer(question) {
    appendMessage(question, 'user');
    appendMessage('Thinking...', 'bot');
    const apiService = apiChoice.value;

    try {
        const endpoints = {
            'huggingface': '/huggingface-proxy',
            'together': '/together-proxy',
            'openai': '/openai-proxy'
        };
        
        const models = {
            'huggingface': 'deepseek-ai/DeepSeek-V3-0324',
            'together': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
            'openai': 'gpt-3.5-turbo'
        };

        const response = await fetch(`http://localhost:3001${endpoints[apiService]}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: models[apiService],
                messages: [
                    { role: 'system', content: 'You are an expert legal assistant with comprehensive knowledge of laws across multiple jurisdictions. You provide accurate, detailed legal guidance on any legal topic including but not limited to: corporate law, criminal law, civil law, family law, property law, employment law, constitutional law, international law, tax law, and more. Always provide clear, step-by-step advice with relevant legal principles and considerations. If a question is not legal in nature, politely redirect to legal topics.' },
                    { role: 'user', content: question }
                ],
                max_tokens: 800,
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        // Remove the 'Thinking...' message
        const thinkingMsg = messagesContainer.querySelector('.bot-message:last-child');
        if (thinkingMsg && thinkingMsg.textContent === 'Thinking...') thinkingMsg.remove();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            appendMessage(data.choices[0].message.content.trim(), 'bot');
        } else if (data.error && data.error.message) {
            appendMessage('Error: ' + data.error.message, 'bot');
        } else {
            appendMessage('Sorry, I could not get an answer. Please try again.', 'bot');
        }
    } catch (err) {
        const thinkingMsg = messagesContainer.querySelector('.bot-message:last-child');
        if (thinkingMsg && thinkingMsg.textContent === 'Thinking...') thinkingMsg.remove();
        appendMessage('Sorry, there was an error connecting to the legal assistant. ' + (err.message || err), 'bot');
    }
}

sendBtn.addEventListener('click', () => {
    const question = input.value.trim();
    if (question) {
        fetchLegalAnswer(question);
        input.value = '';
    }
});
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});
promptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        fetchLegalAnswer(btn.textContent);
    });
});
apiChoice.addEventListener('change', () => {
    const serviceName = apiChoice.options[apiChoice.selectedIndex].text;
    apiStatus.textContent = `Ready to use ${serviceName}`;
});
