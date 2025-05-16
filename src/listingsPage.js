async function fetchData() {
    try {
        document.getElementById('main-body').innerHTML = '<p>Fetching data...</p>';
        const query = `
            SELECT 
                users.id AS user_id,
                users.full_name AS user_name,
                users.email AS user_email,
                machinery_listings.title AS listing_title,
                machinery_listings.price AS listing_price,
                machinery_listings.price_type AS listing_price_type,
                machinery_listings.condition AS listing_condition,
                machinery_listings.location AS listing_location,
                machinery_listings.description AS listing_description,
                machinery_listings.make AS product_make,
                machinery_listings.model AS product_model,
                machinery_listings.vehicle_type AS product_vehicle_type,
                machinery_listings.year_of_manufacture AS product_year,
                machinery_listings.fuel_or_power AS product_fuel,
                machinery_listings.weight AS product_weight
            FROM 
                users
            LEFT JOIN 
                machinery_listings ON users.id = machinery_listings.user_id;
        `;

        const data = await window.database.query(query);
        const container = document.getElementById('main-body');
        container.innerHTML = '';

        const usersMap = new Map();

        // Group listings by user
        data.forEach(row => {
            if (!usersMap.has(row.user_id)) {
                usersMap.set(row.user_id, {
                    name: row.user_name,
                    email: row.user_email,
                    listings: []
                });
            }
            if (row.listing_title) {
                usersMap.get(row.user_id).listings.push(row);
            }
        });

        // Render users and their listings
        usersMap.forEach((userData, userId) => {
            const userSection = document.createElement('div');
            userSection.classList.add('user-section');

            const listings = userData.listings;
            let listingsHTML = '';
            if (listings.length > 0) {
                listings.forEach(listing => {
                    listingsHTML += `
                        <div class="listing">
                            <h3>Listing: ${listing.listing_title}</h3>
                            <p><strong>Price:</strong> ${listing.listing_price || 'On Request'} (${listing.listing_price_type})</p>
                            <p><strong>Condition:</strong> ${listing.listing_condition}</p>
                            <p><strong>Location:</strong> ${listing.listing_location}</p>
                            <p><strong>Description:</strong> ${listing.listing_description}</p>
                            <p><strong>Make:</strong> ${listing.product_make}</p>
                            <p><strong>Model:</strong> ${listing.product_model}</p>
                            <p><strong>Vehicle Type:</strong> ${listing.product_vehicle_type}</p>
                            <p><strong>Year of Manufacture:</strong> ${listing.product_year}</p>
                            <p><strong>Fuel/Power:</strong> ${listing.product_fuel}</p>
                            <p><strong>Weight:</strong> ${listing.product_weight} kg</p>
                        </div>
                    `;
                });
            }
            userSection.innerHTML = `
                <h2>User: ${userData.name} (${userData.email})</h2>
                <button class="add-listing-button" data-user-id="${userId}">Add Listing</button>
                ${listings.length > 0 ? '<button class="toggle-button">Show Listings</button>' : ''}
                ${listings.length > 0 ? 
                `<div class="listings-container"}">
                    ${listingsHTML}
                </div>` : '<p>No active listings.</p>'}
            `;
        
            container.appendChild(userSection);
        });

        bindAddListingButtons();
        bindToggleButtons();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('main-body').innerHTML = '<p>Error fetching data. Check the console for details.</p>';
    }
}

function bindAddListingButtons() {
    const addListingButtons = document.querySelectorAll('.add-listing-button');
    addListingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            showAddListingForm(userId);
        });
    });
}

function showAddListingForm(userId) {
    const formHTML = `
        <div class="add-listing-form">
            <h3>Add Listing</h3>
            <form id="listing-form">
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>

                <label for="price">Price:</label>
                <input type="number" id="price" name="price">

                <label for="price_type">Price Type:</label>
                <select id="price_type" name="price_type" required>
                    <option value="fixed">Fixed</option>
                    <option value="negotiable">Negotiable</option>
                    <option value="on request">On Request</option>
                </select>

                <label for="condition">Condition:</label>
                <select id="condition" name="condition" required>
                    <option value="new">New</option>
                    <option value="good as new">Good as New</option>
                    <option value="used">Used</option>
                    <option value="heavily used">Heavily Used</option>
                </select>

                <label for="location">Location:</label>
                <input type="text" id="location" name="location" required>

                <label for="picture_url">Picture URL:</label>
                <input type="text" id="picture_url" name="picture_url">

                <label for="description">Description:</label>
                <textarea id="description" name="description"></textarea>

                <label for="make">Make:</label>
                <input type="text" id="make" name="make" required>

                <label for="model">Model:</label>
                <input type="text" id="model" name="model" required>

                <label for="vehicle_type">Vehicle Type:</label>
                <input type="text" id="vehicle_type" name="vehicle_type" required>

                <label for="year_of_manufacture">Year of Manufacture:</label>
                <input type="number" id="year_of_manufacture" name="year_of_manufacture" required>

                <label for="fuel_or_power">Fuel/Power:</label>
                <input type="text" id="fuel_or_power" name="fuel_or_power" required>

                <label for="weight">Weight (kg):</label>
                <input type="number" id="weight" name="weight" required>

                <button type="submit">Submit</button>
            </form>
        </div>
    `;

    const container = document.getElementById('main-body');
    container.innerHTML = formHTML;

    const form = document.getElementById('listing-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const listingData = Object.fromEntries(formData.entries());
        listingData.user_id = userId;

        try {
            await window.database.addListing(
                listingData.title,
                listingData.price || null,
                listingData.price_type,
                listingData.condition,
                listingData.location,
                listingData.picture_url || null,
                listingData.description || null,
                listingData.make,
                listingData.model,
                listingData.vehicle_type,
                parseInt(listingData.year_of_manufacture),
                listingData.fuel_or_power,
                parseFloat(listingData.weight),
                parseInt(listingData.user_id)
            );
            alert('Listing added successfully!');
            fetchData(); // Refresh the listings
        } catch (error) {
            console.error('Error adding listing:', error);
            alert('Failed to add listing. Check the console for details.');
        }

        fetchData(); // Refresh the to include the new one
    });
}

function bindToggleButtons() {
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const listingsContainer = button.parentElement.querySelector('.listings-container');
            if (listingsContainer.style.display === 'none' || !listingsContainer.style.display) {
                listingsContainer.style.display = 'block';
                button.textContent = 'Hide Listings';
            } else {
                listingsContainer.style.display = 'none';
                button.textContent = 'Show Listings';
            }
        });
    });
}

function toggleListings(button) {
    const listingsContainer = button.parentElement.querySelector('.listings-container');
    if (listingsContainer.style.display === 'none' || !listingsContainer.style.display) {
        listingsContainer.style.display = 'block';
        button.textContent = 'Hide Listings';
    } else {
        listingsContainer.style.display = 'none';
        button.textContent = 'Show Listings';
    }
}

