import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://ognyvbpuccecvjmqjnjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnl2YnB1Y2NlY3ZqbXFqbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEzNTksImV4cCI6MjA2NTg2NzM1OX0.rYnBV_CFotw0Z-FysCvqGhTbmrmJE9_gQ44N3F_u8CU';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUserData = null;

window.addEventListener('DOMContentLoaded', async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    
    // Load user profile
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error || !data) return;
    
    // Store user data globally
    currentUserData = data;
    
    // Update profile fields
    document.querySelector('.user-name').textContent = data.name || '';
    
    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${data.name || 'User'}!`;
    }
    
    document.querySelector('.info-content h4').textContent = 'Full Name';
    document.querySelector('.info-content p').textContent = data.name || '';
    const infoItems = document.querySelectorAll('.info-item');
    if (infoItems[1]) infoItems[1].querySelector('p').textContent = data.location || '';
    if (infoItems[2]) infoItems[2].querySelector('p').textContent = data.phone || '';
    if (infoItems[3]) infoItems[3].querySelector('p').textContent = data.email || '';
    
    // Load hired lawyers
    console.log('User data:', data);
    console.log('Hired lawyers phone numbers:', data.hired_lawyers);
    await loadHiredLawyers(data.hired_lawyers);
    
    // Load user cases
    await loadUserCases(data.id);
    
    // Setup navigation link with user data
    setupHireLawyerNavigation();
    setupChatBotNavigation();
    setupCaseTrackerNavigation();
    setupUserDropdown();
    setupLogout();
    
    // Listen for page visibility changes to refresh cases when user returns
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && currentUserData) {
            loadUserCases(currentUserData.id);
        }
    });
});

async function loadUserCases(userId) {
    const casesList = document.getElementById('casesList');
    
    try {
        // Fetch cases for the current user
        const { data: cases, error } = await supabase
            .from('cases')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Error fetching cases:', error);
            casesList.innerHTML = `
                <div class="case-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="case-content">
                        <h4>Error Loading Cases</h4>
                        <p>Unable to load your cases at this time.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        if (!cases || cases.length === 0) {
            casesList.innerHTML = `
                <div class="no-cases">
                    <i class="fas fa-folder-open"></i>
                    <h4>No Cases Found</h4>
                    <p>You haven't added any cases yet. Visit the <a href="track.html" style="color: #3498db;">Case Tracker</a> to add your first case.</p>
                </div>
            `;
            return;
        }
        
        // Render cases
        casesList.innerHTML = cases.map(caseItem => {
            const formattedDate = new Date(caseItem.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const statusClass = caseItem.status === 'solved' ? 'solved' : 'ongoing';
            const statusIcon = caseItem.status === 'solved' ? 'fas fa-check-circle' : 'fas fa-clock';
            const caseIcon = getCaseTypeIcon(caseItem.case_type);
            
            return `
                <div class="case-item">
                    <i class="${caseIcon}"></i>
                    <div class="case-content">
                        <h4>${caseItem.case_type}</h4>
                        <p class="case-date">Filed on ${formattedDate}</p>
                        <div class="case-status ${statusClass}">
                            <i class="${statusIcon}"></i>
                            ${caseItem.status === 'solved' ? 'Solved' : 'Ongoing'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading cases:', error);
        casesList.innerHTML = `
            <div class="case-item">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="case-content">
                    <h4>Error</h4>
                    <p>Failed to load cases. Please try again later.</p>
                </div>
            </div>
        `;
    }
}

function getCaseTypeIcon(caseType) {
    const iconMap = {
        'Family Law': 'fas fa-home',
        'Criminal Law': 'fas fa-gavel',
        'Civil Law': 'fas fa-balance-scale',
        'Corporate Law': 'fas fa-building',
        'Employment Law': 'fas fa-briefcase',
        'Immigration Law': 'fas fa-passport',
        'Property Law': 'fas fa-key',
        'Tax Law': 'fas fa-calculator',
        'Environmental Law': 'fas fa-leaf',
        'Constitutional Law': 'fas fa-landmark',
        'Administrative Law': 'fas fa-university',
        'Contract Law': 'fas fa-handshake'
    };
    
    return iconMap[caseType] || 'fas fa-file-alt';
}

function setupHireLawyerNavigation() {
    const hireLawyerLink = document.getElementById('hireLawyerLink');
    if (hireLawyerLink && currentUserData) {
        hireLawyerLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Store user data for lawyer page
            sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
            // Navigate to lawyer page
            window.location.href = 'lawyer.html';
        });
    }
}

function setupCaseTrackerNavigation() {
    const caseTrackerLink = document.querySelector('a[href="#case-tracker"]');
    if (caseTrackerLink && currentUserData) {
        caseTrackerLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Store user data for track page
            sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
            localStorage.setItem('userEmail', currentUserData.email);
            // Navigate to track page
            window.location.href = 'track.html';
        });
    }
}

function setupChatBotNavigation() {
    const chatBotLink = document.getElementById('chatBotLink');
    const topChatBotLink = document.getElementById('topChatBotLink');
    
    const handleChatBotNavigation = (e) => {
        e.preventDefault();
        if (currentUserData) {
            // Store user data for chatBot page
            sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
            localStorage.setItem('userEmail', currentUserData.email);
        }
        // Navigate to chatBot page
        window.location.href = 'chatBot.html';
    };
    
    if (chatBotLink) {
        chatBotLink.addEventListener('click', handleChatBotNavigation);
    }
    
    if (topChatBotLink) {
        topChatBotLink.addEventListener('click', handleChatBotNavigation);
    }
}

async function loadHiredLawyers(hiredLawyerPhone) {
    const lawyersGrid = document.getElementById('lawyersGrid');
    
    console.log('Loading hired lawyer with phone number:', hiredLawyerPhone);
    console.log('Type:', typeof hiredLawyerPhone);
    
    // For integer schema, hired_lawyers is a single integer phone number or null
    if (hiredLawyerPhone === null || hiredLawyerPhone === undefined) {
        console.log('No hired lawyer found');
        lawyersGrid.innerHTML = `
            <div class="lawyer-card placeholder">
                <i class="fas fa-user-tie"></i>
                <p>No lawyers hired yet. Visit the <a href="lawyer.html">Find Lawyers</a> page to hire a lawyer.</p>
            </div>
        `;
        return;
    }
    
    try {
        console.log('Fetching lawyer with phone number:', hiredLawyerPhone);
        
        // Query lawyer using integer phone number
        const { data: lawyers, error } = await supabase
            .from('lawyer')
            .select('*')
            .eq('phone', hiredLawyerPhone);
        
        console.log('Query result:', { lawyers, error });
        
        if (error) {
            console.error('Error fetching hired lawyer:', error);
            lawyersGrid.innerHTML = `
                <div class="lawyer-card placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading hired lawyer information.</p>
                </div>
            `;
            return;
        }
        
        if (!lawyers || lawyers.length === 0) {
            console.log('No lawyer found with phone:', hiredLawyerPhone);
            lawyersGrid.innerHTML = `
                <div class="lawyer-card placeholder">
                    <i class="fas fa-user-tie"></i>
                    <p>Hired lawyer not found. They may have been removed from the system.</p>
                </div>
            `;
            return;
        }
        
        // Display the hired lawyer
        const lawyer = lawyers[0];
        console.log('Found hired lawyer:', lawyer);
        
        lawyersGrid.innerHTML = `
            <div class="lawyer-card">
                <div class="lawyer-info">
                    <h3>${lawyer.name || 'Unknown'}</h3>
                    <p><strong>Phone:</strong> ${lawyer.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${lawyer.email || 'N/A'}</p>
                    <p><strong>Gender:</strong> ${lawyer.gender || 'N/A'}</p>
                    <p><strong>Location:</strong> ${lawyer.location || 'N/A'}</p>
                    <p><strong>Category:</strong> ${lawyer.category || 'N/A'}</p>
                </div>
            </div>
        `;
        
    } catch (err) {
        console.error('Error in loadHiredLawyers:', err);
        lawyersGrid.innerHTML = `
            <div class="lawyer-card placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading hired lawyer information.</p>
            </div>
        `;
    }
}

function setupUserDropdown() {
    const userProfileIcon = document.getElementById('userProfileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (userProfileIcon && dropdownMenu) {
        userProfileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                dropdownMenu.classList.remove('show');
            }
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
    // Clear all stored user data
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('currentUser');
    
    // Show confirmation message
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        // Redirect to home page or login page
        window.location.href = 'homePage.html';
    }
}