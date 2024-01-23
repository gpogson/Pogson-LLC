searchInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    const searchText = event.target.value;
    console.log('Search Text:', searchText);

    // Construct the URL with the search input as a query parameter
    const dashboardURL = `dashboard.html?search=${encodeURIComponent(searchText)}`;

    // Redirect to the dashboard with the query parameter
    window.location.href = dashboardURL;
  }
});



