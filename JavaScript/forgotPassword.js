        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

        const supabaseUrl = 'https://ognyvbpuccecvjmqjnjs.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnl2YnB1Y2NlY3ZqbXFqbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEzNTksImV4cCI6MjA2NTg2NzM1OX0.rYnBV_CFotw0Z-FysCvqGhTbmrmJE9_gQ44N3F_u8CU';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Global variables
        let currentEmail = '';

        // Utility functions
        function showStep(stepNumber) {
            // Hide all steps
            document.querySelectorAll('.reset-step').forEach(step => {
                step.style.display = 'none';
            });

            // Update step indicators
            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.remove('active');
                if (index < stepNumber - 1) {
                    step.classList.add('completed');
                } else if (index === stepNumber - 1) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('completed');
                }
            });

            // Show current step
            const stepMappings = {
                1: 'email-step',
                2: 'password-step'
            };

            document.getElementById(stepMappings[stepNumber]).style.display = 'block';
        }

        function showSpinner(spinnerId) {
            document.getElementById(spinnerId).style.display = 'inline-block';
        }

        function hideSpinner(spinnerId) {
            document.getElementById(spinnerId).style.display = 'none';
        }

        function showError(errorId, message) {
            const errorEl = document.getElementById(errorId);
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }

        function hideError(errorId) {
            document.getElementById(errorId).style.display = 'none';
        }

        // Step 1: Email verification
        document.getElementById('email-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('reset-email').value.trim();
            const sendBtn = document.getElementById('send-code-btn');
            
            hideError('email-error');
            
            // Validate email
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                showError('email-error', 'Please enter a valid email address');
                return;
            }
            
            sendBtn.disabled = true;
            showSpinner('email-spinner');
            
            try {
                // Check if user exists in database
                const { data, error } = await supabase
                    .from('users')
                    .select('email')
                    .eq('email', email)
                    .single();
                
                if (error && error.code === 'PGRST116') {
                    // User not found
                    showError('email-error', 'No account found with this email address');
                    return;
                } else if (error) {
                    console.error('Error checking email:', error);
                    showError('email-error', 'An error occurred. Please try again.');
                    return;
                }
                
                // Store email for password reset
                currentEmail = email;
                
                // Go directly to password reset step
                showStep(2);
                
            } catch (err) {
                console.error('Email verification error:', err);
                showError('email-error', 'An error occurred. Please try again.');
            } finally {
                sendBtn.disabled = false;
                hideSpinner('email-spinner');
            }
        });

        // Step 2: Password reset
        document.getElementById('password-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const resetBtn = document.getElementById('reset-password-btn');
            
            hideError('password-error');
            hideError('confirm-error');
            
            let valid = true;
            
            // Password validation
            if (!newPassword || newPassword.length < 8) {
                showError('password-error', 'Password must be at least 8 characters long');
                valid = false;
            }
            
            // Confirm password validation
            if (newPassword !== confirmPassword) {
                showError('confirm-error', 'Passwords do not match');
                valid = false;
            }
            
            if (!valid) return;
            
            resetBtn.disabled = true;
            showSpinner('password-spinner');
            
            try {
                // Update password in database
                const { data, error } = await supabase
                    .from('users')
                    .update({ password: newPassword })
                    .eq('email', currentEmail);
                
                if (error) {
                    console.error('Error updating password:', error);
                    showError('password-error', 'Failed to update password. Please try again.');
                    return;
                }
                
                // Show success message
                document.getElementById('success-message').style.display = 'block';
                document.getElementById('password-step').style.display = 'none';
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
                
            } catch (err) {
                console.error('Password reset error:', err);
                showError('password-error', 'An error occurred. Please try again.');
            } finally {
                resetBtn.disabled = false;
                hideSpinner('password-spinner');
            }
        });