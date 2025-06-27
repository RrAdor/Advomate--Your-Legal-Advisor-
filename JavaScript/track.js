       import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

        // --- Supabase Configuration ---
        const supabaseUrl = 'https://ognyvbpuccecvjmqjnjs.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnl2YnB1Y2NlY3ZqbXFqbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEzNTksImV4cCI6MjA2NTg2NzM1OX0.rYnBV_CFotw0Z-FysCvqGhTbmrmJE9_gQ44N3F_u8CU';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // --- DOM Elements ---
        const caseTypeSelect = document.getElementById('caseType');
        const addCaseBtn = document.getElementById('addCaseBtn');
        const casesContainer = document.getElementById('casesContainer');
        const emptyState = document.getElementById('emptyState');

        // --- User Data Handling ---
        let currentUser = null;

        // Check for user data from sessionStorage or localStorage
        function loadUserData() {
            const sessionUserData = sessionStorage.getItem('currentUser');
            const userEmail = localStorage.getItem('userEmail');
            
            if (sessionUserData) {
                currentUser = JSON.parse(sessionUserData);
                updateUIForUser(currentUser);
            } else if (userEmail) {
                // Fetch user data from Supabase if we only have email
                fetchUserByEmail(userEmail);
            }
        }

        // Fetch user data by email
        async function fetchUserByEmail(email) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (error || !data) {
                    console.error('Error fetching user:', error);
                    return;
                }

                currentUser = data;
                updateUIForUser(currentUser);
            } catch (err) {
                console.error('Error in fetchUserByEmail:', err);
            }
        }

        // Update UI with user information
        function updateUIForUser(user) {
            const authSection = document.getElementById('authSection');
            const welcomeText = document.getElementById('welcomeText');
            
            if (authSection && user) {
                // Replace login/register with user profile
                authSection.innerHTML = `
                    <div class="user-profile-section">
                        <span class="welcome-message">Welcome, ${user.name || 'User'}!</span>
                        <div class="user-icon" onclick="goToProfile()">
                            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                `;
            }
            
            if (welcomeText && user) {
                welcomeText.textContent = `Welcome back, ${user.name}! Track your legal cases and mark them as solved or ongoing.`;
            }
        }

        // Function to navigate back to profile
        function goToProfile() {
            if (currentUser) {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                window.location.href = 'userProfile.html';
            }
        }

        // Make goToProfile globally available
        window.goToProfile = goToProfile;

        // --- Functions ---

        /**
         * Fetches all cases from the Supabase 'cases' table and renders them.
         */
        async function fetchCases() {
            try {
                let query = supabase
                    .from('cases')
                    .select('*');

                // Filter by user_id if user is logged in
                if (currentUser && currentUser.id) {
                    query = query.eq('user_id', currentUser.id);
                }

                const { data: cases, error } = await query.order('date', { ascending: false });

                if (error) {
                    console.error('Error fetching cases:', error);
                    alert('Could not fetch cases. Please check the console for errors.');
                    return;
                }

                renderCases(cases);
            } catch (err) {
                console.error('An unexpected error occurred:', err);
            }
        }

        /**
         * Renders the provided cases to the page.
         * @param {Array} cases - An array of case objects.
         */
        function renderCases(cases) {
            casesContainer.innerHTML = ''; // Clear existing cases

            if (!cases || cases.length === 0) {
                casesContainer.style.display = 'none';
                emptyState.classList.add('show');
                return;
            }

            casesContainer.style.display = 'flex';
            emptyState.classList.remove('show');

            cases.forEach(caseItem => {
                const isSolved = caseItem.status === 'solved';
                const caseElement = document.createElement('div');
                caseElement.className = `case-item ${isSolved ? 'completed' : ''}`;
                caseElement.innerHTML = `
                    <div class="case-header">
                        <div class="case-title">${caseItem.case_type} Case</div>
                        <div class="case-type">${caseItem.case_type}</div>
                        <div class="case-actions">
                            ${isSolved
                                ? `<button class="undo-btn" data-id="${caseItem.id}" title="Mark as ongoing">
                                     <i class="fas fa-undo"></i>
                                   </button>`
                                : `<button class="complete-btn" data-id="${caseItem.id}" title="Mark as solved">
                                     <i class="fas fa-check"></i>
                                   </button>`
                            }
                            <button class="delete-btn" data-id="${caseItem.id}" title="Delete case">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="case-date">
                        Date: ${new Date(caseItem.date).toLocaleDateString()} 
                        <span class="case-status ${isSolved ? 'solved' : 'ongoing'}">
                            ${isSolved ? '✓ Solved' : '⏳ Ongoing'}
                        </span>
                    </div>
                `;
                casesContainer.appendChild(caseElement);
            });
        }

        /**
         * Adds a new case to the Supabase 'cases' table.
         */
        async function addCase() {
            const case_type = caseTypeSelect.value;

            if (!case_type) {
                alert('Please select a case type.');
                return;
            }

            // Check if user is logged in
            if (!currentUser || !currentUser.id) {
                alert('Please log in to add cases.');
                window.location.href = 'login.html';
                return;
            }
            
            const user_id = currentUser.id;
            const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

            try {
                const { error } = await supabase
                    .from('cases')
                    .insert([{ 
                        case_type: case_type, 
                        user_id: user_id,
                        date: date,
                        status: 'ongoing'
                    }]);

                if (error) {
                    console.error('Error adding case:', error);
                    alert(`Failed to add case: ${error.message}`);
                    return;
                }

                // Clear form and refresh the list
                caseTypeSelect.value = '';
                fetchCases();
            } catch (err) {
                console.error('An unexpected error occurred:', err);
                alert('A critical error occurred while adding the case.');
            }
        }

        /**
         * Toggles the status of a case between 'ongoing' and 'solved'.
         * @param {number} id - The ID of the case to update.
         */
        async function toggleCaseStatus(id) {
            try {
                // First, fetch the current status of the case
                const { data: currentCase, error: fetchError } = await supabase
                    .from('cases')
                    .select('status')
                    .eq('id', id)
                    .single();

                if (fetchError) {
                    console.error('Error fetching case status:', fetchError);
                    alert('Failed to get case details for update.');
                    return;
                }
                
                // Determine the new status
                const newStatus = currentCase.status === 'solved' ? 'ongoing' : 'solved';

                const { error: updateError } = await supabase
                    .from('cases')
                    .update({ status: newStatus })
                    .eq('id', id);

                if (updateError) {
                    console.error('Error updating case status:', updateError);
                    alert('Failed to update case status.');
                    return;
                }

                fetchCases(); // Refresh the list
            } catch (err) {
                console.error('An unexpected error occurred:', err);
                alert('A critical error occurred while updating the case.');
            }
        }

        /**
         * Deletes a case from the Supabase 'cases' table.
         * @param {number} id - The ID of the case to delete.
         */
        async function deleteCase(id) {
            if (!confirm('Are you sure you want to delete this case?')) {
                return;
            }

            try {
                const { error } = await supabase
                    .from('cases')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting case:', error);
                    alert('Failed to delete case.');
                    return;
                }

                fetchCases(); // Refresh the list
            } catch (err) {
                console.error('An unexpected error occurred:', err);
            }
        }

        // Initial load
        document.addEventListener('DOMContentLoaded', () => {
            loadUserData();
            fetchCases();
        });

        // Add case button
        addCaseBtn.addEventListener('click', addCase);

        // Event delegation for toggle and delete buttons
        casesContainer.addEventListener('click', function(e) {
            const button = e.target.closest('button');
            if (!button) return;

            const id = button.dataset.id;
            if (button.classList.contains('complete-btn') || button.classList.contains('undo-btn')) {
                toggleCaseStatus(id);
            } else if (button.classList.contains('delete-btn')) {
                deleteCase(id);
            }
        });
