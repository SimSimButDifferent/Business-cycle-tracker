/**
 * Business Cycle Tracker - Main Dashboard
 *
 * This file contains the logic for initializing and rendering the main dashboard charts.
 */

// Chart configuration variables
const chartConfig = {
  m2Chart: null,
  ismChart: null,
  bitcoinChart: null,
  nasdaqChart: null,
  bitcoinYoYChart: null,
  nasdaqYoYChart: null,
};

// Current dashboard settings
let dashboardSettings = {
  timeframe: "all",
};

// Chart color schemes
const chartColors = {
  m2: {
    line: "rgba(54, 162, 235, 1)",
    fill: "rgba(54, 162, 235, 0.2)",
  },
  ism: {
    line: "rgba(255, 159, 64, 1)",
    fill: "rgba(255, 159, 64, 0.2)",
    threshold: {
      line: "rgba(220, 53, 69, 0.5)",
    },
  },
  bitcoin: {
    line: "rgba(255, 99, 132, 1)",
    fill: "rgba(255, 99, 132, 0.2)",
  },
  nasdaq: {
    line: "rgba(75, 192, 192, 1)",
    fill: "rgba(75, 192, 192, 0.2)",
  },
};

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard();
});

/**
 * Initialize the dashboard by loading data and setting up charts
 */
function initializeDashboard() {
  console.log("Initializing dashboard...");

  // Set up event listeners for timeframe buttons
  const timeframeButtons = document.querySelectorAll(
    "#dashboardTimeframeButtons button"
  );
  console.log(`Found ${timeframeButtons.length} timeframe buttons`);

  timeframeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Log button click
      console.log(
        "Timeframe button clicked:",
        this.getAttribute("data-timeframe")
      );

      // Remove active class from all buttons
      timeframeButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to the clicked button
      this.classList.add("active");

      // Update the current timeframe setting
      dashboardSettings.timeframe = this.getAttribute("data-timeframe");

      // Update all charts with the new timeframe
      updateAllCharts();
    });
  });

  // Show loading indicators
  showLoadingState();

  // Load all data
  dataLoader
    .loadAllData()
    .then(() => {
      // Once data is loaded, initialize all charts
      initializeCharts();
      hideLoadingState();
    })
    .catch((error) => {
      console.error("Dashboard initialization error:", error);
      hideLoadingState();
      showErrorMessage(
        "Failed to load dashboard data. Using sample data instead."
      );
    });
}

/**
 * Show loading state for all charts
 */
function showLoadingState() {
  const chartCanvases = document.querySelectorAll("canvas");
  chartCanvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.font = "16px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText("Loading data...", canvas.width / 2, canvas.height / 2);
  });
}

/**
 * Hide loading state for all charts
 */
function hideLoadingState() {
  // Nothing to do here as the charts will overwrite the loading messages
}

/**
 * Show an error message on the page
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-warning alert-dismissible fade show";
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  const container = document.querySelector(".container");
  container.insertBefore(alertDiv, container.firstChild);
}

/**
 * Initialize all charts on the dashboard
 */
function initializeCharts() {
  // Get filtered datasets based on the selected timeframe
  const filteredDatasets = {};

  for (const [key, dataset] of Object.entries(dataLoader.datasets)) {
    if (dataset) {
      filteredDatasets[key] = dataLoader.getFilteredDataset(
        key,
        dashboardSettings.timeframe
      );
    }
  }

  // Initialize Global M2 Money Supply chart
  initializeM2Chart(filteredDatasets.global_m2);

  // Initialize ISM Manufacturing PMI chart
  initializeISMChart(filteredDatasets.ism_manufacturing);

  // Initialize Bitcoin Price chart
  initializeBitcoinChart(filteredDatasets.bitcoin);

  // Initialize NASDAQ Price chart
  initializeNasdaqChart(filteredDatasets.nasdaq);

  // Initialize Bitcoin YoY Returns chart
  initializeBitcoinYoYChart(filteredDatasets.bitcoin_yoy);

  // Initialize NASDAQ YoY Returns chart
  initializeNasdaqYoYChart(filteredDatasets.nasdaq_yoy);
}

/**
 * Initialize the Global M2 Money Supply chart
 * @param {Array} m2Data - The M2 Money Supply dataset
 */
function initializeM2Chart(m2Data) {
  const ctx = document.getElementById("m2Chart").getContext("2d");

  // Prepare the data for Chart.js
  const chartData = {
    labels: m2Data.map((item) => item.date),
    datasets: [
      {
        label: "Global M2 Money Supply (in trillions)",
        data: m2Data.map((item) => item.value),
        borderColor: chartColors.m2.line,
        backgroundColor: chartColors.m2.fill,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year",
            displayFormats: {
              year: "yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Value",
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${
                context.dataset.label
              }: ${context.parsed.y.toLocaleString()}`;
            },
          },
        },
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
    },
  };

  // Create the chart
  chartConfig.m2Chart = new Chart(ctx, config);
}

/**
 * Initialize the ISM Manufacturing PMI chart
 * @param {Array} ismData - The ISM Manufacturing PMI dataset
 */
function initializeISMChart(ismData) {
  const ctx = document.getElementById("ismChart").getContext("2d");

  // Prepare the data for Chart.js
  const chartData = {
    labels: ismData.map((item) => item.date),
    datasets: [
      {
        label: "ISM Manufacturing PMI",
        data: ismData.map((item) => item.value),
        borderColor: chartColors.ism.line,
        backgroundColor: chartColors.ism.fill,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year",
            displayFormats: {
              year: "yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          beginAtZero: false,
          min: 30,
          max: 70,
          title: {
            display: true,
            text: "Value",
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }

              const value = context.parsed.y;
              label += value.toFixed(1);

              if (value > 50) {
                label += " (Expansion)";
              } else if (value < 50) {
                label += " (Contraction)";
              } else {
                label += " (Neutral)";
              }

              return label;
            },
          },
        },
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
        annotation: {
          annotations: {
            line50: {
              type: "line",
              yMin: 50,
              yMax: 50,
              borderColor: chartColors.ism.threshold.line,
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: "Expansion/Contraction Threshold (50)",
                enabled: true,
                position: "end",
              },
            },
          },
        },
      },
    },
  };

  // Create the chart
  chartConfig.ismChart = new Chart(ctx, config);
}

/**
 * Initialize the Bitcoin Price chart
 * @param {Array} bitcoinData - The Bitcoin price dataset
 */
function initializeBitcoinChart(bitcoinData) {
  const ctx = document.getElementById("bitcoinChart").getContext("2d");

  // Prepare the data for Chart.js
  const chartData = {
    labels: bitcoinData.map((item) => item.date),
    datasets: [
      {
        label: "Bitcoin Price (USD)",
        data: bitcoinData.map((item) => item.value),
        borderColor: chartColors.bitcoin.line,
        backgroundColor: chartColors.bitcoin.fill,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year",
            displayFormats: {
              year: "yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          type: "logarithmic",
          title: {
            display: true,
            text: "Price (USD)",
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${
                context.dataset.label
              }: $${context.parsed.y.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`;
            },
          },
        },
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
    },
  };

  // Create the chart
  chartConfig.bitcoinChart = new Chart(ctx, config);
}

/**
 * Initialize the NASDAQ Price chart
 * @param {Array} nasdaqData - The NASDAQ price dataset
 */
function initializeNasdaqChart(nasdaqData) {
  const ctx = document.getElementById("nasdaqChart").getContext("2d");

  // Prepare the data for Chart.js
  const chartData = {
    labels: nasdaqData.map((item) => item.date),
    datasets: [
      {
        label: "NASDAQ Composite Index",
        data: nasdaqData.map((item) => item.value),
        borderColor: chartColors.nasdaq.line,
        backgroundColor: chartColors.nasdaq.fill,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year",
            displayFormats: {
              year: "yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Index Value",
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${
                context.dataset.label
              }: ${context.parsed.y.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`;
            },
          },
        },
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
    },
  };

  // Create the chart
  chartConfig.nasdaqChart = new Chart(ctx, config);
}

/**
 * Initialize the Bitcoin YoY Returns chart
 * @param {Array} bitcoinYoYData - The Bitcoin YoY returns dataset
 */
function initializeBitcoinYoYChart(bitcoinYoYData) {
  const ctx = document.getElementById("bitcoinYoYChart").getContext("2d");

  // Transform the data to better visualize extremes while preserving oscillator pattern
  const transformedData = bitcoinYoYData.map((item) => {
    // Create a new object to preserve the original data
    const newItem = { ...item };

    // Apply a logarithmic compression to extremely high positive values
    // but keep negative values linear for better visibility
    if (newItem.value > 200) {
      // Log compression for values above 200%
      newItem.displayValue = 200 + Math.log10(newItem.value / 200) * 100;
    } else {
      newItem.displayValue = newItem.value;
    }

    return newItem;
  });

  // Prepare the data for Chart.js
  const chartData = {
    labels: transformedData.map((item) => item.date),
    datasets: [
      {
        label: "Bitcoin Year-over-Year Returns (%)",
        data: transformedData.map((item) => item.displayValue),
        borderColor: chartColors.bitcoin.line,
        backgroundColor: chartColors.bitcoin.fill,
        tension: 0.2,
        borderWidth: 2.5,
        pointRadius: 1,
        pointHoverRadius: 5,
        fill: false,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year",
            displayFormats: {
              year: "yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          type: "linear",
          title: {
            display: true,
            text: "Bitcoin YoY Return (%) - Oscillator View",
          },
          min: -100,
          max: 350, // This gives room for the compressed high values
          ticks: {
            callback: function (value, index, values) {
              if (value > 200) {
                return (
                  "+" +
                  Math.round(Math.pow(10, (value - 200) / 100) * 200) +
                  "%"
                );
              }
              return value + "%";
            },
          },
          grid: {
            z: 1,
            drawTicks: true,
            color: function (context) {
              if (context.tick && context.tick.value === 0) {
                return "rgba(0, 0, 0, 0.8)"; // Darker line for zero
              } else if (context.tick && context.tick.value === 200) {
                return "rgba(255, 0, 0, 0.3)"; // Special marker for the compression threshold
              }
              return "rgba(0, 0, 0, 0.1)";
            },
            lineWidth: function (context) {
              if (
                context.tick &&
                (context.tick.value === 0 || context.tick.value === 200)
              ) {
                return 2; // Thicker line for important thresholds
              }
              return 1;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              // Find the original value from our data array
              const index = context.dataIndex;

              // Get the value from original data (either from initialization or updates)
              const chart = context.chart;
              const originalValue = chart.bitcoinYoYOriginalData
                ? chart.bitcoinYoYOriginalData[index]?.value
                : bitcoinYoYData[index]?.value;

              if (
                originalValue !== null &&
                originalValue !== undefined &&
                !isNaN(originalValue)
              ) {
                // Format value with appropriate sign and fixed decimal places
                const sign = originalValue >= 0 ? "+" : "";
                return `${
                  context.dataset.label
                }: ${sign}${originalValue.toFixed(2)}%`;
              } else {
                return `${context.dataset.label}: N/A`;
              }
            },
          },
        },
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
    },
  };

  // Create the chart
  chartConfig.bitcoinYoYChart = new Chart(ctx, config);

  // Store the original data for tooltip access
  chartConfig.bitcoinYoYChart.bitcoinYoYOriginalData = bitcoinYoYData;
}

/**
 * Initialize the NASDAQ YoY Returns chart
 * @param {Array} nasdaqYoYData - The NASDAQ YoY returns dataset
 */
function initializeNasdaqYoYChart(nasdaqYoYData) {
  const ctx = document.getElementById("nasdaqYoYChart").getContext("2d");

  // Prepare the data for Chart.js
  const chartData = {
    labels: nasdaqYoYData.map((item) => item.date),
    datasets: [
      {
        label: "NASDAQ Year-over-Year Returns (%)",
        data: nasdaqYoYData.map((item) => item.value),
        borderColor: chartColors.nasdaq.line,
        backgroundColor: chartColors.nasdaq.fill,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: false,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "year",
            displayFormats: {
              year: "yyyy",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "NASDAQ YoY Return (%)",
          },
          min: -100,
          max: 100,
          ticks: {
            callback: function (value, index, values) {
              return value + "%";
            },
          },
          grid: {
            drawTicks: true,
            color: function (context) {
              if (context.tick && context.tick.value === 0) {
                return "rgba(0, 0, 0, 0.5)"; // Darker line for zero
              }
              return "rgba(0, 0, 0, 0.1)";
            },
            lineWidth: function (context) {
              if (context.tick && context.tick.value === 0) {
                return 2; // Thicker line for zero
              }
              return 1;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              if (value !== null && value !== undefined && !isNaN(value)) {
                return `${context.dataset.label}: ${value.toFixed(2)}%`;
              } else {
                return `${context.dataset.label}: N/A`;
              }
            },
          },
        },
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
    },
  };

  // Create the chart
  chartConfig.nasdaqYoYChart = new Chart(ctx, config);
}

/**
 * Update all charts on the dashboard with the current timeframe
 */
function updateAllCharts() {
  // Show loading indicators
  showLoadingState();

  // Log the current timeframe for debugging
  console.log("Updating charts with timeframe:", dashboardSettings.timeframe);

  // Get filtered datasets based on timeframe
  const filteredDatasets = {};

  for (const [key, dataset] of Object.entries(dataLoader.datasets)) {
    if (dataset) {
      // Get the filtered dataset
      filteredDatasets[key] = dataLoader.getFilteredDataset(
        key,
        dashboardSettings.timeframe
      );
      console.log(
        `Filtered ${key}: ${filteredDatasets[key]?.length || 0} items`
      );
    }
  }

  // Update each chart with filtered data
  if (chartConfig.m2Chart) {
    updateChartData(chartConfig.m2Chart, filteredDatasets.global_m2);
  }

  if (chartConfig.ismChart) {
    updateChartData(chartConfig.ismChart, filteredDatasets.ism_manufacturing);
  }

  if (chartConfig.bitcoinChart) {
    updateChartData(chartConfig.bitcoinChart, filteredDatasets.bitcoin);
  }

  if (chartConfig.nasdaqChart) {
    updateChartData(chartConfig.nasdaqChart, filteredDatasets.nasdaq);
  }

  if (chartConfig.bitcoinYoYChart) {
    updateChartData(chartConfig.bitcoinYoYChart, filteredDatasets.bitcoin_yoy);
  }

  if (chartConfig.nasdaqYoYChart) {
    updateChartData(chartConfig.nasdaqYoYChart, filteredDatasets.nasdaq_yoy);
  }

  // Hide loading indicators
  hideLoadingState();
}

/**
 * Update the data in a chart
 * @param {Chart} chart - The Chart.js chart instance
 * @param {Array} newData - The new dataset
 */
function updateChartData(chart, newData) {
  if (!chart || !newData) return;

  // For bitcoin YoY chart special handling for transformed data
  if (chart === chartConfig.bitcoinYoYChart) {
    const transformedData = newData.map((item) => {
      const newItem = { ...item };
      if (newItem.value > 200) {
        newItem.displayValue = 200 + Math.log10(newItem.value / 200) * 100;
      } else {
        newItem.displayValue = newItem.value;
      }
      return newItem;
    });

    chart.data.labels = transformedData.map((item) => item.date);
    chart.data.datasets[0].data = transformedData.map(
      (item) => item.displayValue
    );

    // Store the original data in a custom property for tooltip access
    chart.bitcoinYoYOriginalData = newData;
  } else {
    chart.data.labels = newData.map((item) => item.date);
    chart.data.datasets[0].data = newData.map((item) => item.value);
  }

  chart.update();
}
