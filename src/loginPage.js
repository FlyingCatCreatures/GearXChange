log = (...msgs) => {window.logger.log(...msgs);};
logError = (...msgs) => {window.logger.error(...msgs);};
function handleLoginForm() {
    const loginForm = document.getElementById('login-form');
    const signupButton = document.getElementById('signup-button');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const isVerified = 
                    await window.database.verifyUserByName(username, password) 
                    || 
                    await window.database.verifyUserByEmail(username, password);
                if (isVerified) {
                    alert("Login successful!");
                    const userDisplay = document.getElementById("user-display");
                    userDisplay.textContent = `Logged in as ${username}`;
                    navigate('Home');
                } else {
                    log("Invalid login attempt for user:", username);
                    alert("Invalid username or password.");
                }
            } catch (err) {
                logError("Error during login for user", username, ":", err.message);
                alert("An error occurred during login. Please try again.");
            }
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', () => {
            navigate('SignUp');
            const signupForm = document.getElementById('signup-form');

            if (signupForm) {
                signupForm.addEventListener('submit', (event) => {
                    event.preventDefault();
        
                    // Add user to the database
                    window.database.addUser(
                        document.getElementById('new-username').value, 
                        document.getElementById('email').value, 
                        document.getElementById('new-password').value, 
                        document.getElementById('full-name').value, 
                        document.getElementById('phone').value, 
                        document.getElementById('location').value);
                });
            }
        });
    }
}