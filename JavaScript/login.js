import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

  const supabaseUrl = 'https://ognyvbpuccecvjmqjnjs.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnl2YnB1Y2NlY3ZqbXFqbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEzNTksImV4cCI6MjA2NTg2NzM1OX0.rYnBV_CFotw0Z-FysCvqGhTbmrmJE9_gQ44N3F_u8CU';
 
    const supabase = createClient(supabaseUrl, supabaseKey);



        document.addEventListener('DOMContentLoaded', function() {
            // Tab switching
            const loginTab = document.getElementById('login-tab');
            const registerTab = document.getElementById('register-tab');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');

            loginTab.addEventListener('click', function() {
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            });

            registerTab.addEventListener('click', function() {
                registerTab.classList.add('active');
                loginTab.classList.remove('active');
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            });

            // Password strength meter
            const passwordInput = document.getElementById('register-password');
            const bars = [
                document.getElementById('bar-1'),
                document.getElementById('bar-2'),
                document.getElementById('bar-3'),
                document.getElementById('bar-4')
            ];
            const strengthText = document.getElementById('password-strength-text');

            passwordInput.addEventListener('input', function() {
                const password = this.value;
                let strength = 0;
                
                // Reset
                bars.forEach(bar => {
                    bar.classList.remove('active', 'medium', 'strong');
                });
                
                if (password.length > 0) {
                    strength++;
                }
                
                if (password.length >= 8) {
                    strength++;
                }
                
                if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
                    strength++;
                }
                
                if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
                    strength++;
                }
                
                for (let i = 0; i < strength; i++) {
                    bars[i].classList.add('active');
                    
                    if (strength >= 2) {
                        bars[i].classList.add('medium');
                    }
                    
                    if (strength >= 3) {
                        bars[i].classList.add('strong');
                    }
                }
                
                if (strength === 0) {
                    strengthText.textContent = 'Password strength';
                } else if (strength === 1) {
                    strengthText.textContent = 'Weak';
                } else if (strength === 2) {
                    strengthText.textContent = 'Fair';
                } else if (strength === 3) {
                    strengthText.textContent = 'Good';
                } else {
                    strengthText.textContent = 'Strong';
                }
            });

            // Form validation
            const loginFormEl = document.getElementById('login-form');
            const registerFormEl = document.getElementById('register-form');
            
            loginFormEl.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const emailError = document.getElementById('login-email-error');
                const passwordError = document.getElementById('login-password-error');
                
                let valid = true;
                
                // Reset errors
                emailError.style.display = 'none';
                passwordError.style.display = 'none';
                
                // Email validation
                if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                    emailError.style.display = 'block';
                    valid = false;
                }
                
                // Password validation
                if (!password) {
                    passwordError.style.display = 'block';
                    valid = false;
                }
                
                if (valid) {
                    try {
                        // Check if user exists in database
                        const { data, error } = await supabase
                            .from('users')
                            .select('*')
                            .eq('email', email)
                            .single();
                        
                        if (error && error.code === 'PGRST116') {
                            // User not found
                            alert('User not found. Please check your email or register first.');
                            return;
                        } else if (error) {
                            console.error('Error logging in:', error);
                            alert('Login failed. Please try again.');
                            return;
                        }
                        
                        // Check password
                        if (data && data.password === password) {
                            console.log('Login successful for user:', data);
                            console.log('Storing email in localStorage:', email);
                            
                            // Store email for profile page
                            localStorage.setItem('userEmail', email);
                            
                            // Verify storage worked
                            const storedEmail = localStorage.getItem('userEmail');
                            console.log('Verified stored email:', storedEmail);
                            
                            if (storedEmail === email) {
                                alert('Login successful!');
                                console.log('Redirecting to userProfile.html');
                                window.location.href = 'userProfile.html'; // Redirect to user profile page
                            } else {
                                console.error('Failed to store email in localStorage');
                                alert('Login successful but there was an issue saving your session. Please try logging in again.');
                            }
                        } else {
                            alert('Invalid password. Please try again.');
                        }
                    } catch (err) {
                        console.error('Login error:', err);
                        alert('An error occurred during login. Please try again.');
                    }
                }
            });
            
            registerFormEl.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const location = document.getElementById('register-location').value;
                const phone = document.getElementById('register-phone').value;
                const password = document.getElementById('register-password').value;
                const confirm = document.getElementById('register-confirm').value;
                const terms = document.getElementById('terms').checked;
                
                const nameError = document.getElementById('register-name-error');
                const emailError = document.getElementById('register-email-error');
                const locationError = document.getElementById('register-location-error');
                const phoneError = document.getElementById('register-phone-error');
                const confirmError = document.getElementById('register-confirm-error');
                
                let valid = true;
                
                // Reset errors
                nameError.style.display = 'none';
                emailError.style.display = 'none';
                locationError.style.display = 'none';
                phoneError.style.display = 'none';
                confirmError.style.display = 'none';
                
                // Name validation
                if (!name) {
                    nameError.style.display = 'block';
                    valid = false;
                }
                
                // Email validation
                if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                    emailError.style.display = 'block';
                    valid = false;
                }
                
                // Location validation
                if (!location) {
                    locationError.style.display = 'block';
                    valid = false;
                }
                
                // Phone validation
                if (!phone) {
                    phoneError.style.display = 'block';
                    phoneError.textContent = 'Please enter your phone number';
                    valid = false;
                } else if (!/^\d+$/.test(phone)) {
                    phoneError.style.display = 'block';
                    phoneError.textContent = 'Phone number must contain only digits';
                    valid = false;
                } else if (phone.length < 10) {
                    phoneError.style.display = 'block';
                    phoneError.textContent = 'Phone number must be at least 10 digits';
                    valid = false;
                }
                
                // Password confirmation validation
                if (password !== confirm) {
                    confirmError.style.display = 'block';
                    valid = false;
                }
                
                // Terms validation
                if (!terms) {
                    alert('Please agree to the Terms of Service and Privacy Policy');
                    valid = false;
                }
                
                if (valid) {
                    try {
                        // Save registration data to database
                        const { data, error } = await supabase
                            .from('users')
                            .insert([{
                                name: name,
                                email: email,
                                location: location,
                                phone: parseInt(phone), // Convert phone to integer for integer schema
                                password: password,
                                hired_lawyers: null // Initialize as null for integer column
                            }]);
                            
                        if (error) {
                            console.error('Error registering:', error);
                            if (error.code === '23505') {
                                alert('This email is already registered. Please use a different email or login instead.');
                            } else {
                                alert('Registration failed. Please try again.');
                            }
                        } else {
                            console.log('Registration successful:', data);
                            alert('Registration successful! You can now login.');
                            // Switch to login tab
                            loginTab.click();
                            // Pre-fill email in login form
                            document.getElementById('login-email').value = email;
                        }
                    } catch (err) {
                        console.error('Registration error:', err);
                        alert('An error occurred during registration. Please try again.');
                    }
                }
            });
           

        });
