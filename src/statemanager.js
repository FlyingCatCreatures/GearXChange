const body = document.getElementById('main-body');
const navbar = document.getElementById('navbar');
const navbarItems = navbar.querySelectorAll('a');

let states = new Map(); 
let currentState = 'Home';

states.set('Login', `
    <div class="add-listing-form">
        <h3>Login</h3>
        <form id="login-form">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Login</button>
        </form>
        <button id="signup-button" class="secondary-button">Sign Up</button>
    </div>
`);

states.set('SignUp', `
    <div class="signup">
        <h1>Sign Up</h1>
        <form id="signup-form">
            <label for="new-username">Username:</label>
            <input type="text" id="new-username" name="new-username" required>
            
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="full-name">Full Name:</label>
            <input type="text" id="full-name" name="full-name" required>
            
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" required>
            
            <label for="location">Location:</label>
            <input type="text" id="location" name="location" required>
            
            <label for="new-password">Password:</label>
            <input type="password" id="new-password" name="new-password" required>
            
            <button type="submit">Sign Up</button>
        </form>
    </div>
`);

states.set('Home', `
    <div class="home">
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page of the application.</p>
    </div>
`);

states.set('About', `
    <div class="about">
        <h1>About Us</h1>
        <p>This is the about page of the application.</p>
    </div>
`);

states.set('Contact', `
    <div class="contact">
        <h1>Contact Us</h1>
        <p>This is the contact page of the application.</p>
    </div>
`);

states.set('News', `
    <div class="news">
        <h1>Latest News</h1>
        <p>This is the news page of the application.</p>
    </div>
`);

states.set('Listings', `<p>Listings not loaded.</p>`);

navigate('Home'); // Initialize the page with the Home state

function navigate(state) {
    if(states.has(state)){
        body.innerHTML = states.get(state);
    }

    navbarItems.forEach(item => {
        if (item.textContent.trim() === state 
            || (item.textContent.trim() === 'Login' && state === 'SignUp')) // keep login page active when navigating to sign up page
        {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

navbarItems.forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        if(item.textContent.trim() =='Listings'){
            fetchData(); // This isn't static as the database might have changed so we have to recompute it each time
        }

        navigate(item.textContent.trim()); // Call the navigate function with the desired page

        
        if (item.textContent.trim() === 'Login') {
            handleLoginForm(); // This needs to be called after the login form is loaded so after navigate()
        }
        
    });
});