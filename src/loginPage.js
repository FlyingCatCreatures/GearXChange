function handleLoginForm() {
    const loginForm = document.getElementById('login-form');
    const signupButton = document.getElementById('signup-button');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Handle login logic here (e.g., send data to server)
            console.log(`Logging in with Username: ${username}, Password: ${password}`);
            console.log('Logging in is not yet implemented.'); 
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
                        document.getElementById('new-password'), 
                        document.getElementById('full-name').value, 
                        document.getElementById('phone').value, 
                        document.getElementById('location').value);
                });
            }
        });
    }
}