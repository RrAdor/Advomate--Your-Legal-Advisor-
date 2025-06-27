import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

  const supabaseUrl = 'https://ognyvbpuccecvjmqjnjs.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnl2YnB1Y2NlY3ZqbXFqbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEzNTksImV4cCI6MjA2NTg2NzM1OX0.rYnBV_CFotw0Z-FysCvqGhTbmrmJE9_gQ44N3F_u8CU';
 
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for user data and update navigation
    window.addEventListener('DOMContentLoaded', () => {
        setupUserGreeting();
        setupLawyerSlider();
    });

    function setupUserGreeting() {
        const currentUser = sessionStorage.getItem('currentUser');
        const userEmail = localStorage.getItem('userEmail');
        const authSection = document.getElementById('authSection');
        const profileLink = document.getElementById('profileLink');
        
        if ((currentUser || userEmail) && authSection) {
            let userData = null;
            
            if (currentUser) {
                userData = JSON.parse(currentUser);
            } else if (userEmail) {
                // If we only have email, fetch user data from database
                fetchUserDataAndUpdateGreeting(userEmail, authSection, profileLink);
                return;
            }
            
            if (userData) {
                // Replace auth links with user greeting
                authSection.innerHTML = `
                    <div class="user-greeting">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <span class="user-name-display">Welcome, ${userData.name || 'User'}</span>
                        <a href="userProfile.html" class="back-to-profile">
                            <i class="fas fa-arrow-left"></i> Back to Profile
                        </a>
                    </div>
                `;
                
                // Show profile link in navigation
                if (profileLink) {
                    profileLink.style.display = 'block';
                }
                
                // Store user email in localStorage for hiring functionality
                localStorage.setItem('userEmail', userData.email);
            }
        }
    }

    async function fetchUserDataAndUpdateGreeting(email, authSection, profileLink) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
                
            if (!error && data) {
                // Replace auth links with user greeting
                authSection.innerHTML = `
                    <div class="user-greeting">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <span class="user-name-display">Welcome, ${data.name || 'User'}</span>
                        <a href="userProfile.html" class="back-to-profile">
                            <i class="fas fa-arrow-left"></i> Back to Profile
                        </a>
                    </div>
                `;
                
                // Show profile link in navigation
                if (profileLink) {
                    profileLink.style.display = 'block';
                }
                
                // Store complete user data in sessionStorage for future use
                sessionStorage.setItem('currentUser', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    }

    function setupLawyerSlider() {
        const lawyersContainer = document.getElementById('lawyersContainer');
        const lawyerCards = lawyersContainer.querySelectorAll('.lawyer-card');
        const totalLawyers = lawyerCards.length;
        const lawyersPerView = 3;
        let currentStart = 0;
        
        function updateLawyerSlider() {
            lawyerCards.forEach((card, idx) => {
                if (idx >= currentStart && idx < currentStart + lawyersPerView) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        updateLawyerSlider();

        const leftArrow = document.querySelector('.arrow-left');
        const rightArrow = document.querySelector('.arrow-right');

        leftArrow.addEventListener('click', () => {
            if (currentStart > 0) {
                currentStart--;
                updateLawyerSlider();
                updateDots();
            }
        });

        rightArrow.addEventListener('click', () => {
            if (currentStart < totalLawyers - lawyersPerView) {
                currentStart++;
                updateLawyerSlider();
                updateDots();
            }
        });

        // Dots logic
        const dots = document.querySelectorAll('.dot');
        function updateDots() {
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentStart);
            });
        }
        updateDots();

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                if (idx <= totalLawyers - lawyersPerView) {
                    currentStart = idx;
                    updateLawyerSlider();
                    updateDots();
                }
            });
        });
    }

    // Search functionality
    const searchButton = document.getElementById("searchButton");

    searchButton.addEventListener("click", async function() {
      const searchInput = document.getElementById("searchInput").value.trim();
      const locationSelect = document.getElementById("locationSelect").value;
      const genderSelect = document.getElementById("genderSelect").value;
      const resultsContainer = document.getElementById("searchResults");
      resultsContainer.innerHTML = ""; // Clear previous results
      const searchResultsContainer = document.getElementById("searchResultsContainer");

      let query = supabase.from('lawyer').select('*');

      // Apply filters conditionally
      if (searchInput) {
        query = query.ilike('name', `%${searchInput}%`);
      }
      if (genderSelect) {
        query = query.eq('gender', genderSelect);
      }
      if (locationSelect) {
        query = query.eq('location', locationSelect);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }
      
      if(data.length > 0) {
        searchResultsContainer.style.display= "block";
        data.forEach(lawyer => {
          const li = document.createElement("li");
          li.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 15px; 
            margin: 10px 0; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          `;
          
          const lawyerInfo = document.createElement("div");
          lawyerInfo.innerHTML = `
            <strong>${lawyer.name}</strong><br>
            <span style="color: #666;">Phone: ${lawyer.phone} | Gender: ${lawyer.gender} | Location: ${lawyer.location}</span><br>
            <span style="color: #666;">Email: ${lawyer.email} | Category: ${lawyer.category}</span>
          `;
          
          const hireButton = document.createElement("button");
          hireButton.textContent = "Hire Lawyer";
          hireButton.style.cssText = `
            background-color: #27ae60; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: 500;
          `;
          hireButton.onmouseover = () => hireButton.style.backgroundColor = "#219a52";
          hireButton.onmouseout = () => hireButton.style.backgroundColor = "#27ae60";
          
          // Since phone is the primary key, use phone as the identifier (convert to integer)
          const lawyerPhone = parseInt(lawyer.phone);
          
          if (!lawyerPhone || isNaN(lawyerPhone)) {
            console.error('No valid phone number found for lawyer:', lawyer);
            return; 
          }
          
          console.log('Lawyer data for hire button:', lawyer);
          console.log('Using lawyer phone (Primary Key):', lawyerPhone, 'Type:', typeof lawyerPhone);
          
          hireButton.onclick = () => hireLawyer(lawyerPhone, lawyer.name);
          
          li.appendChild(lawyerInfo);
          li.appendChild(hireButton);
          resultsContainer.appendChild(li);
        });
      }
      else{
        searchResultsContainer.style.display= "block";
        const li=document.createElement("li");
        li.textContent = "No results found";
        resultsContainer.appendChild(li);
      }
    });
     
    // Hire lawyer function
    async function hireLawyer(lawyerPhone, lawyerName) {
      console.log('Hiring lawyer with phone:', lawyerPhone, 'Type:', typeof lawyerPhone);
      console.log('Lawyer name:', lawyerName);
      
      // First, let's verify this lawyer exists using phone as primary key
      const { data: lawyerCheck, error: checkError } = await supabase
        .from('lawyer')
        .select('*')
        .eq('phone', lawyerPhone)
        .single();
      
      if (checkError || !lawyerCheck) {
        console.error('Lawyer not found with phone:', lawyerPhone, 'Error:', checkError);
        alert(`Lawyer not found in database with phone: ${lawyerPhone}. Please try again.`);
        return;
      }
      
      console.log('Found lawyer:', lawyerCheck);
      
      const userEmail = localStorage.getItem('userEmail');
      console.log('Checking user email from localStorage:', userEmail);
      
      if (!userEmail) {
        console.error('No userEmail found in localStorage');
        alert('Please log in to hire a lawyer. No user email found in session.');
        // Redirect to login page
        window.location.href = 'login.html';
        return;
      }
      
      console.log('User email found:', userEmail);

      try {
        // First, try to get current user data to see what we're working with
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('hired_lawyers')
          .eq('email', userEmail)
          .single();

        if (currentUserError) {
          console.error('Error fetching current user:', currentUserError);
          console.error('Error details:', {
            message: currentUserError.message,
            code: currentUserError.code,
            details: currentUserError.details,
            hint: currentUserError.hint
          });
          
          if (currentUserError.code === 'PGRST116') {
            alert('User not found in database. Please log in again or register a new account.');
            window.location.href = 'login.html';
          } else {
            alert(`Error accessing user data: ${currentUserError.message}. Please try logging in again.`);
            window.location.href = 'login.html';
          }
          return;
        }

        console.log('Current user hired_lawyers:', currentUserData.hired_lawyers);

        // Get current user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('hired_lawyers')
          .eq('email', userEmail)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          alert('Error accessing user data.');
          return;
        }

        console.log('Final hired lawyers data:', userData.hired_lawyers);
        
        // If null/undefined, no lawyer is hired yet
        let currentHiredLawyer = userData.hired_lawyers;
        
        console.log('Current hired lawyer (integer phone):', currentHiredLawyer);
        console.log('Type:', typeof currentHiredLawyer);
        
        const lawyerPhoneInt = parseInt(lawyerPhone);
        const isAlreadyHired = currentHiredLawyer === lawyerPhoneInt;
        
        console.log(`Comparing current hired lawyer: ${currentHiredLawyer} with lawyer phone: ${lawyerPhoneInt} - Already hired: ${isAlreadyHired}`);
        
        if (isAlreadyHired) {
          alert('You have already hired this lawyer.');
          return;
        }
        
        if (currentHiredLawyer !== null && currentHiredLawyer !== undefined) {
          const replaceConfirm = confirm(`You currently have a hired lawyer (phone: ${currentHiredLawyer}). Do you want to replace them with this new lawyer?`);
          if (!replaceConfirm) {
            return;
          }
        }

        // Set the new hired lawyer (integer phone number)
        const newHiredLawyer = lawyerPhoneInt;
        
        console.log('Setting new hired lawyer (integer):', newHiredLawyer);
        console.log('Type check:', typeof newHiredLawyer);

        // Update user table with new hired lawyer (integer)
        console.log('Attempting to update user with email:', userEmail);
        console.log('New hired lawyer (integer):', newHiredLawyer);
        
        let updateResult, updateError;
        
        // Update with integer value for hired_lawyers column
        try {
            const result = await supabase
                .from('users')
                .update({ hired_lawyers: newHiredLawyer })
                .eq('email', userEmail)
                .select();
                
            updateResult = result.data;
            updateError = result.error;
        } catch (err) {
            updateError = err;
        }

        console.log('Update result:', updateResult);
        console.log('Update error:', updateError);

        if (updateError) {
            console.error('Update failed:', updateError);
            alert(`Error hiring lawyer: ${updateError.message || 'Database update failed'}. Please try again.`);
            return;
        }

        if (!updateResult || updateResult.length === 0) {
          console.error('No rows were updated');
          alert('Error: User record was not updated. Please try again.');
          return;
        }

        console.log('Successfully updated user record:', updateResult[0]);
        
        // Verify the update by fetching the user data again
        const { data: verifyData, error: verifyError } = await supabase
          .from('users')
          .select('hired_lawyers')
          .eq('email', userEmail)
          .single();
          
        if (verifyError) {
          console.error('Error verifying update:', verifyError);
        } else {
          console.log('Verified hired lawyers after update:', verifyData.hired_lawyers);
        }
        
        alert(`Successfully hired ${lawyerName}! You can view them in your profile.`);
        
        // Update the button to show hired status
        const button = event.target;
        button.textContent = 'Hired';
        button.style.backgroundColor = '#95a5a6';
        button.style.cursor = 'not-allowed';
        button.disabled = true;

      } catch (err) {
        console.error('Error hiring lawyer:', err);
        alert('An error occurred. Please try again.');
      }
    }

    window.showUserState = async function() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            console.log('No user email in localStorage');
            alert('No user logged in');
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .single();
            
            if (error) {
                console.error('Error fetching user:', error);
                alert('Error fetching user data');
                return;
            }
            
            console.log('Current user data:', data);
            alert(`User: ${data.name}\nEmail: ${data.email}\nHired Lawyers: ${JSON.stringify(data.hired_lawyers)}`);
            
        } catch (err) {
            console.error('Error in showUserState:', err);
            alert('Error showing user state');
        }
    };

    if (window.location.search.includes('debug=true')) {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Show User State';
        debugButton.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            z-index: 9999;
            background: blue;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        debugButton.onclick = window.showUserState;
        document.body.appendChild(debugButton);
        
        const testInitButton = document.createElement('button');
        testInitButton.textContent = 'Test Init';
        testInitButton.style.cssText = `
            position: fixed;
            top: 120px;
            right: 10px;
            z-index: 9999;
            background: orange;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        testInitButton.onclick = window.testHiredLawyersInit;
        document.body.appendChild(testInitButton);
        
        const schemaButton = document.createElement('button');
        schemaButton.textContent = 'Check Schema';
        schemaButton.style.cssText = `
            position: fixed;
            top: 180px;
            right: 10px;
            z-index: 9999;
            background: purple;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        schemaButton.onclick = window.checkUserSchema;
        document.body.appendChild(schemaButton);
        
        const hireTestButton = document.createElement('button');
        hireTestButton.textContent = 'Test Hire';
        hireTestButton.style.cssText = `
            position: fixed;
            top: 240px;
            right: 10px;
            z-index: 9999;
            background: red;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        hireTestButton.onclick = window.quickHireTest;
        document.body.appendChild(hireTestButton);
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Hired';
        resetButton.style.cssText = `
            position: fixed;
            top: 300px;
            right: 10px;
            z-index: 9999;
            background: darkred;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        resetButton.onclick = window.resetHiredLawyers;
        document.body.appendChild(resetButton);
    }

    async function testDatabaseConnection() {
        console.log('Testing database connection...');
        
        try {
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('*')
                .limit(1);
            
            console.log('Users test:', { users, usersError });
            
            const { data: lawyers, error: lawyersError } = await supabase
                .from('lawyer')
                .select('*')
                .limit(1);
            
            console.log('Lawyers test:', { lawyers, lawyersError });
            
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                const { data: currentUser, error: currentUserError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', userEmail)
                    .single();
                
                console.log('Current user test:', { currentUser, currentUserError });
            }
            
        } catch (err) {
            console.error('Database test error:', err);
        }
    }


    // Test hiring functionality (for debugging)
    window.testHiring = async function() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            console.log('No user email found in localStorage');
            return;
        }
        
        console.log('Testing hiring functionality for user:', userEmail);
        
        // Test with a dummy lawyer ID
        const testLawyerId = 1;
        await hireLawyer(testLawyerId, 'Test Lawyer');
    };

    // Add test button to page (for debugging - remove in production)
    if (window.location.search.includes('debug=true')) {
        const testButton = document.createElement('button');
        testButton.textContent = 'Test Hiring';
        testButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            background: red;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        testButton.onclick = window.testHiring;
        document.body.appendChild(testButton);
    }

    // Debug function to inspect lawyer table structure and UUID foreign keys
    window.inspectLawyerTable = async function() {
        try {
            console.log('Inspecting lawyer table for UUID foreign key setup...');
            
            const { data: lawyers, error } = await supabase
                .from('lawyer')
                .select('*')
                .limit(3);
            
            if (error) {
                console.error('Error fetching lawyers:', error);
                alert(`Error: ${error.message}`);
                return;
            }
            
            if (lawyers && lawyers.length > 0) {
                console.log('Lawyer table structure:');
                console.log('Columns:', Object.keys(lawyers[0]));
                console.log('Sample data:', lawyers[0]);
                
                // Check if ID is a valid UUID
                const sampleId = lawyers[0].id;
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                const isValidUuid = uuidRegex.test(sampleId);
                
                console.log('Sample ID:', sampleId);
                console.log('Is valid UUID:', isValidUuid);
                
                alert(`Lawyer Table Structure:\n\nColumns: ${Object.keys(lawyers[0]).join(', ')}\n\nSample ID: ${sampleId}\nIs Valid UUID: ${isValidUuid}\n\nSample lawyer:\n${JSON.stringify(lawyers[0], null, 2)}`);
            } else {
                console.log('No lawyers found in table');
                alert('No lawyers found in the table');
            }
            
        } catch (err) {
            console.error('Error inspecting table:', err);
            alert(`Error inspecting table: ${err.message}`);
        }
    };

    // Add inspect button (when debug=true in URL)
    if (window.location.search.includes('debug=true')) {
        const inspectButton = document.createElement('button');
        inspectButton.textContent = 'Inspect Table';
        inspectButton.style.cssText = `
            position: fixed;
            top: 110px;
            right: 10px;
            z-index: 9999;
            background: green;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        `;
        inspectButton.onclick = window.inspectLawyerTable;
        document.body.appendChild(inspectButton);
    }

    // Debug function to test hired_lawyers field (integer schema)
    window.testHiredLawyersInit = async function() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            console.log('No user email in localStorage');
            alert('No user logged in');
            return;
        }
        
        console.log('Testing hired_lawyers integer field for:', userEmail);
        
        try {
            // Check current state
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .single();
            
            if (userError) {
                console.error('User lookup failed:', userError);
                alert('User lookup failed: ' + userError.message);
                return;
            }
            
            console.log('User exists:', userData);
            console.log('Current hired_lawyers value:', userData.hired_lawyers);
            console.log('Type of hired_lawyers:', typeof userData.hired_lawyers);
            
            alert(`Integer Schema Test:\n\nCurrent hired_lawyers: ${userData.hired_lawyers}\nType: ${typeof userData.hired_lawyers}\n\nFor integer schema, this should be a number or null.`);
            
        } catch (err) {
            console.error('Test failed:', err);
            alert('Test failed: ' + err.message);
        }
    };
    
    // Debug function to check database schema
    window.checkUserSchema = async function() {
        try {
            console.log('Checking user table schema...');
            
            // Get a sample user to see the schema
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .limit(1);
            
            if (error) {
                console.error('Schema check failed:', error);
                alert('Schema check failed: ' + error.message);
                return;
            }
            
            if (data && data.length > 0) {
                console.log('User table columns:', Object.keys(data[0]));
                console.log('Sample user data:', data[0]);
                alert('Schema check completed. Check console for details.');
            } else {
                console.log('No users in table');
                alert('No users found in table');
            }
            
        } catch (err) {
            console.error('Schema check error:', err);
            alert('Schema check error: ' + err.message);
        }
    };

    // Quick test function for hiring functionality (integer schema)
    window.quickHireTest = async function() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('Please log in first');
            return;
        }
        
        // Test with a fake lawyer phone number (integer)
        const testLawyerPhone = 1234567890;
        console.log('Testing hiring with fake lawyer phone:', testLawyerPhone);
        
        try {
            // Get current user data
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('hired_lawyers')
                .eq('email', userEmail)
                .single();

            if (userError) {
                console.error('Error fetching user:', userError);
                alert('Error fetching user: ' + userError.message);
                return;
            }

            console.log('Current hired_lawyers:', userData.hired_lawyers);
            console.log('Type:', typeof userData.hired_lawyers);
            
            // For integer schema, just set the new value
            console.log('Setting new hired lawyer phone:', testLawyerPhone);
            
            // Update user record
            const { error: updateError } = await supabase
                .from('users')
                .update({ hired_lawyers: testLawyerPhone })
                .eq('email', userEmail);

            if (updateError) {
                console.error('Error updating hired lawyers:', updateError);
                alert('Update failed: ' + updateError.message);
            } else {
                console.log('Successfully set test lawyer');
                alert('Test hiring successful! Check console for details.');
            }
            
        } catch (err) {
            console.error('Test error:', err);
            alert('Test failed: ' + err.message);
        }
    };
    
    // Reset hired lawyers function (for integer schema)
    window.resetHiredLawyers = async function() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('Please log in first');
            return;
        }
        
        const confirm = window.confirm('Are you sure you want to reset your hired lawyer?');
        if (!confirm) return;
        
        try {
            const { error } = await supabase
                .from('users')
                .update({ hired_lawyers: null })
                .eq('email', userEmail);

            if (error) {
                console.error('Error resetting:', error);
                alert('Reset failed: ' + error.message);
            } else {
                alert('Hired lawyer reset successfully!');
            }
        } catch (err) {
            console.error('Reset error:', err);
            alert('Reset failed: ' + err.message);
        }
    };
