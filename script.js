   // Mapbox access token
   mapboxgl.accessToken = 'pk.eyJ1IjoibWVlbmFrdW1hcmk5OSIsImEiOiJjbTF2b2tkbGwwZDUyMmtzOTEzM3N6OGRyIn0.ULzQg5dQHvS4Hg6NxkNjVQ';

   // Initialize the map
   const map = new mapboxgl.Map({
       container: 'map', // Container ID
       style: 'mapbox://styles/mapbox/streets-v11', // Map style
       center: [30, 15], // Initial map center [lng, lat]
       zoom: 1, // Initial zoom level
       projection: 'globe' // Display the map as a globe
   });

   // Add zoom control
   map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
   map.scrollZoom.disable();
   map.on('style.load', () => {
       map.setFog({}); // Set the default atmosphere style
   });

   // Enable globe rotation
   const secondsPerRevolution = 40;
   const maxSpinZoom = 5;
   const slowSpinZoom = 3;
   let userInteracting = false;

   function spinGlobe() {
       const zoom = map.getZoom();
       if (!userInteracting && zoom < maxSpinZoom) {
           let distancePerSecond = 360 / secondsPerRevolution;
           if (zoom > slowSpinZoom) {
               const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
               distancePerSecond *= zoomDif;
           }
           const center = map.getCenter();
           center.lng -= distancePerSecond;
           map.easeTo({ center, duration: 1000, easing: n => n });
       }
   }

   map.on('moveend', spinGlobe);
   spinGlobe();

   map.on('mousedown', () => { userInteracting = true; });
   map.on('dragstart', () => { userInteracting = true; });

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
                   new mapboxgl.Marker().setLngLat(coords).addTo(map);
               } else {
                   alert("Location not found!");
               }
           })
           .catch(error => console.error('Error:', error));
   });

   // Mapbox Directions API integration
   map.addControl(
       new MapboxDirections({
           accessToken: mapboxgl.accessToken
       }),
       'top-left'
   );
