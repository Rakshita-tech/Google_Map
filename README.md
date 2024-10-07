```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Mapbox Project with Features</title>

    <!-- Mapbox Styles -->
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.css" rel="stylesheet">
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.7.0/mapbox-gl.js"></script>

    <!-- Bootstrap Styles -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">

    <!-- Mapbox Directions Styles -->
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.3.1/mapbox-gl-directions.css" type="text/css">

    <!-- Custom Styles -->
    <link rel="stylesheet" href="style.css">

    <!-- Include jQuery and Popper.js for Bootstrap -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</head>
<body>

    <!-- Navbar with Search -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Mapbox Project</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <form class="d-flex ml-auto" id="search-form" role="search">
                    <input class="form-control me-2" id="search-input" type="search" placeholder="Search for places..." aria-label="Search">
                    <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
            </div>
        </div>
    </nav>

    <!-- Main Container for Map -->
    <div class="container-fluid">
        <div id="map" class="map"></div>
    </div>

    <!-- Scripts - Load Mapbox Directions Plugin After Mapbox GL JS -->
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.3.1/mapbox-gl-directions.js"></script>
    <script src="script.js" defer></script> 
</body>
</html>
```

```css
body {
    overflow-x: hidden !important;
}

body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
}

#map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}

.navbar {
    font-size: 20px;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 10; /* Ensure navbar is above the map */
}

form {
    display: flex;
    justify-content: center;
    align-items: center;
}

#search-input {
    width: 300px;
}

#search-form button {
    margin-left: 10px;
}

/* Adjust Mapbox controls position to avoid overlap with navbar */
.mapboxgl-ctrl-top-left .mapboxgl-ctrl {
    margin-top: 65px; /* Adjust as needed based on navbar height */
}
```

```javascript
// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWVlbmFrdW1hcmk5OSIsImEiOiJjbTF2b2tkbGwwZDUyMmtzOTEzM3N6OGRyIn0.ULzQg5dQHvS4Hg6NxkNjVQ'; // Replace with your actual Mapbox access token

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Map style
    center: [30, 15], // Initial map center [lng, lat]
    zoom: 1, // Initial zoom level
    projection: 'globe' // Display the map as a globe
});

// Add zoom control
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable(); 

// Set the default atmosphere style (fog) after the style loads
map.on('style.load', () => {
    map.setFog({}); 
});

// Function to spin the globe
function spinGlobe() {
    const zoom = map.getZoom();
    const secondsPerRevolution = 40;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    if (zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: n => n });

        // Call spinGlobe recursively to keep it spinning
        requestAnimationFrame(spinGlobe);
    }
}

// Start spinning when the map is idle
map.on('moveend', () => {
    spinGlobe();
});

// Stop spinning on user interaction
map.on('mousedown', () => {
    map.stop(); // Stop any ongoing animations
});

map.on('dragstart', () => {
    map.stop(); // Stop any ongoing animations
});

// Search functionality
document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchQuery = document.getElementById('search-input').value;
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxgl.accessToken}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.features.length > 0) {
                const coords = data.features[0].geometry.coordinates;
                map.flyTo({ center: coords, zoom: 10 });

                // Add a marker to the found location
                new mapboxgl.Marker()
                    .setLngLat(coords)
                    .addTo(map);
            } else {
                alert("Location not found!");
            }
        })
        .catch(error => console.error('Error:', error));
});

// Mapbox Directions API integration - Add after the map is initialized
map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken
    }),
    'top-left'
);
```

**Key Improvements:**

1.  **Script Loading Order:** The Mapbox Directions plugin script is now loaded **after** the main Mapbox GL JS script. This ensures that the plugin can find and use the Mapbox GL JS objects correctly.
2.  **CSS for Navbar Overlap:** The `mapboxgl-ctrl-top-left .mapboxgl-ctrl` CSS rule has been added to adjust the positioning of Mapbox controls (like the navigation control) so they don't overlap with the fixed navbar.
3.  **Clearer Comments:** Comments have been added to the JavaScript code to provide better explanations of the logic, especially for the globe spinning functionality.
4.  **User Interaction Handling:** User interaction with the map (mousedown, dragstart) now stops the globe spinning animation, providing a smoother user experience.
5.  **Marker on Search:** When a location is successfully found using the search, a marker is now added to the map at the found coordinates.

**How to Use:**

1.  **Replace `'YOUR_MAPBOX_ACCESS_TOKEN'`:** In the `script.js` file, replace `'YOUR_MAPBOX_ACCESS_TOKEN'` with your actual Mapbox access token.
2.  **Create HTML, CSS, JS Files:** Save the provided code snippets as `index.html`, `style.css`, and `script.js` respectively.
3.  **Open `index.html`:** Open the `index.html` file in your web browser to view the interactive map with search, globe rotation, and directions.

This improved code will provide a more functional and user-friendly Mapbox web application.
