const body = document.getElementById('main-body');
const navbar = document.getElementById('navbar');
const navbarItems = navbar.querySelectorAll('a');

let states = new Map(); 
let currentState = 'Home';

states.set('Login', `
    <div class="login">
        <h1>Login</h1>
        <form id="login-form">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Login</button>
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

function navigate(state) {
    if(states.has(state)){
        body.innerHTML = states.get(state);
    }

    navbarItems.forEach(item => {
        if (item.textContent.trim() === state) {
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
            fetchData(); // This isn't static as the database might have changed so we have to recomput it each time
        }

        navigate(item.textContent.trim()); // Call the navigate function with the desired page
        
    });
});

navigate('Home'); // Initialize the page with the Home state