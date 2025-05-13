async function fetchData() {
    try {
        const query = `
            SELECT 
                users.full_name AS user_name,
                users.email AS user_email,
                machinery_listings.title AS listing_title,
                machinery_listings.price AS listing_price,
                machinery_listings.price_type AS listing_price_type,
                machinery_listings.condition AS listing_condition,
                machinery_listings.location AS listing_location,
                machinery_listings.description AS listing_description,
                product_details.make AS product_make,
                product_details.model AS product_model,
                product_details.vehicle_type AS product_vehicle_type,
                product_details.year_of_manufacture AS product_year,
                product_details.fuel_or_power AS product_fuel,
                product_details.weight AS product_weight
            FROM 
                users
            LEFT JOIN 
                machinery_listings ON users.id = machinery_listings.user_id
            LEFT JOIN 
                product_details ON machinery_listings.product_details_id = product_details.id;
        `;

        const data = await window.database.query(query);
        const container = document.getElementById('main-body');
        container.innerHTML = '';

        const usersMap = new Map();

        // Group listings by user
        data.forEach(row => {
            if (!usersMap.has(row.user_name)) { // If users have multiple listings they're in multiple rows so we need to group them by name
                usersMap.set(row.user_name, {
                    email: row.user_email,
                    listings: []
                });
            }
            if (row.listing_title) { // If this person has a listing, I.E. the listing title is not null
                usersMap.get(row.user_name).listings.push(row);
            }
        });

        // Render users and their listings
        usersMap.forEach((userData, userName) => {
            const userSection = document.createElement('div');
            userSection.classList.add('user-section');

            const listings = userData.listings;


            if (listings.length > 0) {
                let listingsHTML = '';
                listings.forEach(listing => {
                    listingsHTML += `
                        <div class="listing">
                            <h3>Listing: ${listing.listing_title}</h3>
                            <p><strong>Price:</strong> ${listing.listing_price || 'On Request'} (${listing.listing_price_type})</p>
                            <p><strong>Condition:</strong> ${listing.listing_condition}</p>
                            <p><strong>Location:</strong> ${listing.listing_location}</p>
                            <p><strong>Description:</strong> ${listing.listing_description}</p>
                            <h4>Product Details:</h4>
                                <p><strong>Make:</strong> ${listing.product_make}</p>
                                <p><strong>Model:</strong> ${listing.product_model}</p>
                                <p><strong>Vehicle Type:</strong> ${listing.product_vehicle_type}</p>
                                <p><strong>Year of Manufacture:</strong> ${listing.product_year}</p>
                                <p><strong>Fuel/Power:</strong> ${listing.product_fuel}</p>
                                <p><strong>Weight:</strong> ${listing.product_weight} kg</p>
                        </div>
                    `;
                });
                userSection.innerHTML = `
                    <h2>User: ${userName} (${userData.email})</h2>
                    <button class="toggle-button">Show Listings</button>
                    <div class="listings-container">
                        ${listingsHTML}
                    </div>
                `;
            } else {
                userSection.innerHTML = `
                    <h2>User: ${userName} (${userData.email})</h2>
                    <div>
                        <p>No active listings.</p>
                    </div>
                    `;
            }


            container.appendChild(userSection);
        });
        bindToggleButtons();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('main-body').innerHTML = '<p>Error fetching data. Check the console for details.</p>';
    }
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

