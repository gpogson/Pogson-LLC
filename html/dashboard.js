const urlSearchParams = new URLSearchParams(window.location.search);
const searchInputValue = urlSearchParams.get('search');

const stockApiKey = '1c40038906c104e47ea1788c4b15237f';
let stockData = {};

// Use the searchInputValue as the ticker
let ticker = searchInputValue;
if (ticker == null){
  ticker = "AAPL"; // Default to Apple if no input is provided
}
console.log(ticker);
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
      break;
    case '1 Year':
      fromDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      break;
    case '5 Years':
      fromDate = new Date(currentDate.getFullYear() - 5, currentDate.getMonth(), currentDate.getDate());
      break;
    case 'Max':
      // Set a maximum date range, e.g., 10 years ago
      fromDate = new Date(currentDate.getFullYear() - 20, currentDate.getMonth(), currentDate.getDate());
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
  const responseData = await response.json();

  // Extract the historical data from the API response
  const historicalData = responseData.historical;

  // Ensure historicalData is an array of objects with 'date' and 'close' properties
  if (!Array.isArray(historicalData) || historicalData.length === 0 || !historicalData[0].date || !historicalData[0].close) {
    throw new Error('Invalid historical data format');
  }

  return historicalData;
};




const fetchIncomeStmtMetric = async (ticker, metric) => {
  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/financials/income-statement/${ticker}?apikey=${stockApiKey}`);
    const data = await response.json();
    console.log(data);
    if (data.financials && data.financials.length > 0) {
      const value = data.financials[0][metric];
      return value;
    } else {
      console.error(`Unable to fetch ${metric} data for the company.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${metric} data:`, error);
    return null;
  }
};

const fetchProfileMetric = async (ticker, metric) => {
  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${stockApiKey}`);
    const data = await response.json();
    console.log("profile data", data);
    if (data) {
      const value = data[0][metric];
      return value;
    } else {
      console.error(`Unable to fetch ${metric} data for the company.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${metric} data:`, error);
    return null;
  }
};

const fetchAndDisplayValue = async (ticker,  metric, id, type) => {
  let value;
  if  (type == 'incomeStmt')  {
    value = await fetchIncomeStmtMetric(ticker, metric);
  }
  else{
    value = await fetchProfileMetric(ticker, metric);
  }
  const htmlElement = document.getElementById(id);
  if (htmlElement && value !== null) {
    console.log("value: "+ value)
    htmlElement.textContent = `${htmlElement.textContent} ${parseFloat (value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
  }
};

  // Fetch and display stats
  fetchAndDisplayValue(ticker, 'Revenue', 'revenue', 'incomeStmt');
  fetchAndDisplayValue(ticker, 'EPS', 'eps', 'incomeStmt');
  fetchAndDisplayValue(ticker, 'mktCap', 'marketCap', 'profile');

// Separate function for displaying stock chart
async function displayStockChart(ticker, timeFrame) {
  const historicalData = await getStockHistoricalData(ticker, timeFrame);

  const dates = historicalData.map(entry => entry.date).reverse();
  const prices = historicalData.map(entry => entry.close).reverse();

  const ctx = document.getElementById('Chart').getContext('2d');

  // Check if a chart with the same ID already exists and destroy it
  if (window.stockChart !== undefined) {
    window.stockChart.destroy();
  }

  // percent change
  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const percentChange = ((endPrice - startPrice) / startPrice) * 100;

  // Update the percent change element with color based on positive or negative change
  const percentChangeElement = document.getElementById('percentChange');
  percentChangeElement.textContent = `Percent Change: `;
  const percentChangeNumber = document.createElement('span');
  percentChangeNumber.textContent = `${percentChange.toFixed(2)}%`;
  percentChangeElement.appendChild(percentChangeNumber);

  if (percentChange < 0) {
    percentChangeNumber.style.color = 'red';
  } else if (percentChange > 0) {
    percentChangeNumber.style.color = 'green';
  }


  // Create the chart
  window.stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Stock Price',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        data: prices,
      }],
    },
    options: {
      scales: {
        x: {
          ticks: {
            color: 'rgba(75, 192, 192, 1)', // Change the color of the dates
          },
        },
        y: {
          ticks: {
            color: 'rgba(75, 192, 192, 1)', // Change the color of the left-side y-axis labels
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(75, 192, 192, 1)', // Change the color of the label text
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
    fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${stockApiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const companyName = data[0].companyName;
        console.log('Company Name:', companyName);
        ticker = companyName;
      } else {
        console.log('No data available for the specified ticker symbol.');
      }
    })
    .catch(error => {
      console.error('Error fetching company profile:', error);
    });
    
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


const doc = document.getElementById('Chart').getContext('2d');
// Add event listener to the chart for click events
// Add event listener to the chart for click events
// Add event listener to the chart for click events
// Assuming historicalData is available and properly fetched
doc.canvas.addEventListener('click', async function(event) {
  const historicalData = await getStockHistoricalData(ticker, 'Max');
  const prices = historicalData.map(entry => entry.close); // Don't reverse prices here
  const dates = historicalData.map(entry => entry.date); // Don't reverse dates here
  
  const activePoints = window.stockChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
  if (activePoints.length === 0) return; // No point clicked
  
  const clickedIndex = activePoints[0].index;
  
  // Find the price corresponding to the clicked index
  const clickedPrice = prices[clickedIndex]; // Use clickedIndex directly to get the correct price
  const clickedDate = dates[clickedIndex];
  
  // Store clicked date or use it to calculate percent change with previously stored date
  if (!window.clickedDate) {
    window.clickedDate = clickedDate;
    
  } else {
    const startDate = window.clickedDate;
    const endDate = clickedDate;
    console.log("startDate" + startDate);
    console.log("endDate" + endDate);
    const startIndex = dates.indexOf(startDate);
    const endIndex = dates.indexOf(endDate);
    
    if (startIndex === -1 || endIndex === -1) {
      alert('Error: Dates not found in data.');
      return;
    }
    
    const startPrice = prices[startIndex];
    const endPrice = clickedPrice; // Use clickedPrice as the end price
    const percentChange = ((endPrice - startPrice) / startPrice) * 100;
    
    console.log("startPrice: " + startPrice);
    console.log("endPrice: " + endPrice);
    console.log("percentChange: " + percentChange);
    
    updatePercentChange(percentChange);
    window.clickedDate = null; // Reset clicked date for next selection
  }
});




// Function to update the percent change element with color based on positive or negative change
function updatePercentChange(percentChange) {
  const percentChangeElement = document.getElementById('percentChange');
  percentChangeElement.textContent = `Percent Change: `;
  const percentChangeNumber = document.createElement('span');
  percentChangeNumber.textContent = `${percentChange.toFixed(2)}%`;
  percentChangeElement.appendChild(percentChangeNumber);
  
  // Set color based on positive or negative change
  if (percentChange < 0) {
    percentChangeNumber.style.color = 'red';
  } else if (percentChange > 0) {
    percentChangeNumber.style.color = 'green';
  }
}

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




// Fetch recent news for a specific stock
fetchRecentNews(ticker);
displayStockChart(ticker, "3M");
