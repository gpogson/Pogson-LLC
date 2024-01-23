const urlSearchParams = new URLSearchParams(window.location.search);
const searchInputValue = urlSearchParams.get('search');

const stockApiKey = '1c40038906c104e47ea1788c4b15237f';
let stockData = {};

// Use the searchInputValue as the ticker
const ticker = searchInputValue;

const ctx = document.getElementById('stockTitle').textContent = ticker;

const getStockData = async (ticker) => {
  const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${stockApiKey}`);
  const data = await response.json();
  return data;
}

//displayStockData();
// Get stock historical data
const getStockHistoricalData = async (ticker, timeFrame) => {
  // Get the current date
  const currentDate = new Date();
  console.log("our frame:" + timeFrame);
  // Calculate the fromDate based on the selected time frame
  let fromDate;
  switch (timeFrame) {
    case '1 Month':
      fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
      break;
    case '3 Months':
      fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
      break;
    case '6 Months':
      fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
      console.log(fromDate);
      break;
    case '1 Year':
      fromDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      break;
    case '5 Years':
      fromDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate());
      break;
    case 'Max':
      // Set a maximum date range, e.g., 10 years ago
      fromDate = new Date(currentDate.getFullYear() - 10, currentDate.getMonth(), currentDate.getDate());
      break;
    default:
      // Default to the provided time frame or '1Y' if not recognized
      fromDate = new Date(currentDate.getFullYear() - (parseInt(timeFrame) || 1), currentDate.getMonth(), currentDate.getDate());
      break;
  }

  // Format the fromDate to YYYY-MM-DD
  const formattedDate = `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`;

  // Construct the API URL with the new fromDate
  const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=${stockApiKey}&from=${formattedDate}`);
  const data = await response.json();
  return data.historical;
};




// Display stock chart
async function displayStockChart(ticker, timeFrame) {
  const historicalData = await getStockHistoricalData(ticker, timeFrame);

  const dates = historicalData.map(entry => entry.date).reverse();
  const prices = historicalData.map(entry => entry.close).reverse();

  const ctx = document.getElementById('Chart').getContext('2d');

  // Check if a chart with the same ID already exists and destroy it
  if (window.stockChart !== undefined) {
    window.stockChart.destroy();
  }

  window.stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Stock Price Over One Year',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        data: prices,
      }],
    },
    options: {
      scales: {
        x: {
          ticks: {
            color: 'white', // Change the color of the dates
          },
        },
        y: {
          ticks: {
            color: 'white', // Change the color of the left-side y-axis labels
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: 'white', // Change the color of the label text
          },
        },
      },
    },
  });
  
}







// Listen for changes on the time range select element
const timeRangeButton = document.getElementById('timeRangeDropdown');
const dropdownOptions = document.querySelectorAll('.dropdown-item');

dropdownOptions.forEach(option => {
  option.addEventListener('click', function () {
    const selectedOptionText = option.textContent;
    
    // Update the button's text with the selected option
    timeRangeButton.textContent = selectedOptionText;
    console.log('Option clicked: ' + selectedOptionText);
    displayStockChart(ticker, selectedOptionText);
  });
});



// Your News API key
const newsApiKey = 'a661c50bdbc0415aa9278fc56d6cc72e';

// Function to fetch recent news articles
async function fetchRecentNews(ticker) {
  const newsList = document.getElementById('newsList');
  newsList.innerHTML = ''; // Clear previous news items

  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${ticker}&apiKey=${newsApiKey}`);
    const data = await response.json();

    if (data.status === 'ok') {
      const articles = data.articles;

      // Display up to 5 news links
      for (let i = 0; i < Math.min(5, articles.length); i++) {
        const article = articles[i];
        const newsLink = document.createElement('a');
        newsLink.href = article.url;
        newsLink.textContent = article.title;
        const listItem = document.createElement('li');
        listItem.appendChild(newsLink);
        newsList.appendChild(listItem);
      }
    } else {
      console.error('Error fetching news:', data.message);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}




// Fetch recent news for a specific stock
fetchRecentNews(ticker);
displayStockChart(ticker, "3M");
