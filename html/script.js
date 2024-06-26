const stockApiKey = '1c40038906c104e47ea1788c4b15237f';

const ticker = 'AAPL';
let stockData = {};


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
  let monthChange = 0;
  let yearChange = 0;
  let flag = true;
  switch (timeFrame) {
    case '1 Month':
      monthChange = 1;
      break;
    case '3 Months':
      monthChange = 3;
      break;
    case '6 Months':
      monthChange = 6;
      break;
    case '1 Year':
      yearChange = 1;
      break;
    case '5 Years':
      yearChange = 5;
      break;
    case 'Max':
      // Set a maximum date range, e.g., 10 years ago
      yearChange = 10;
      break;
    default:
    
      fromDate = new Date(currentDate.getFullYear() - (parseInt(timeFrame) || 1), currentDate.getMonth(), currentDate.getDate());
      break;
  }
  if (yearChange != 0 || monthChange != 0) {
    fromDate = new Date(currentDate.getFullYear() - yearChange, currentDate.getMonth() - monthChange, currentDate.getDate());
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
  });
}





displayStockChart(ticker, "3M");


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
const selectedStockTicker = 'AAPL'; // Example ticker
fetchRecentNews(selectedStockTicker);
