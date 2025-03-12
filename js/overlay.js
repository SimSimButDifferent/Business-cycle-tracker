/**
 * Business Cycle Tracker - Overlay Charts
 *
 * This file contains the logic for the overlay charts page, which allows users
 * to compare different economic indicators with asset prices and explore lead/lag relationships.
 */

// Chart configuration variables
let overlayChart = null;
let correlationChart = null;

// Current chart settings
let currentSettings = {
  baseAsset: "nasdaq",
  overlayMetric: "global_m2",
  timeShift: 0,
  timeframe: "all",
};

// Chart color schemes
const chartColors = {
  baseAsset: {
    line: "rgba(75, 192, 192, 1)",
    fill: "rgba(75, 192, 192, 0.1)",
  },
  overlay: {
    line: "rgba(255, 99, 132, 1)",
    fill: "rgba(255, 99, 132, 0.1)",
  },
  correlation: {
    positive: "rgba(40, 167, 69, 0.7)",
    negative: "rgba(220, 53, 69, 0.7)",
    neutral: "rgba(108, 117, 125, 0.7)",
  },
};

// Initialize the overlay page
document.addEventListener("DOMContentLoaded", () => {
  initializeOverlayPage();
});

/**
 * Initialize the overlay page by setting up event listeners and loading data
 */
function initializeOverlayPage() {
  // Set up event listeners
  document
    .getElementById("updateChart")
    .addEventListener("click", updateOverlayChart);

  const timeShiftSlider = document.getElementById("timeShift");
  timeShiftSlider.addEventListener("input", () => {
    document.getElementById("timeShiftValue").textContent =
      timeShiftSlider.value + " months";
  });

  // Add event listeners for timeframe buttons
  const timeframeButtons = document.querySelectorAll(
    "#timeframeButtons button"
  );
  timeframeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Log button click
      console.log(
        "Overlay timeframe button clicked:",
        this.getAttribute("data-timeframe")
      );

      // Remove active class from all buttons
      timeframeButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to the clicked button
      this.classList.add("active");

      // Update the current timeframe setting
      currentSettings.timeframe = this.getAttribute("data-timeframe");

      // Don't auto-update the chart, wait for the user to click "Update Chart"
    });
  });

  // Get initial select values
  currentSettings.baseAsset = document.getElementById("baseAsset").value;
  currentSettings.overlayMetric =
    document.getElementById("overlayMetric").value;
  currentSettings.timeShift = parseInt(
    document.getElementById("timeShift").value
  );
  // Use data-timeframe from the active button
  const activeTimeframeButton = document.querySelector(
    "#timeframeButtons button.active"
  );
  if (activeTimeframeButton) {
    currentSettings.timeframe =
      activeTimeframeButton.getAttribute("data-timeframe");
  }

  // Load data
  dataLoader
    .loadAllData()
    .then(() => {
      // Data is loaded, initialize charts
      updateOverlayChart();
    })
    .catch((error) => {
      console.error("Failed to load data:", error);
      showErrorMessage(
        "Failed to load data. Using sample data for demonstration."
      );
      updateOverlayChart();
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
 * Update the overlay chart with the current settings
 */
function updateOverlayChart() {
  // Update current settings from form
  currentSettings.baseAsset = document.getElementById("baseAsset").value;
  currentSettings.overlayMetric =
    document.getElementById("overlayMetric").value;
  currentSettings.timeShift = parseInt(
    document.getElementById("timeShift").value
  );

  // Use data-timeframe from the active button
  const activeTimeframeButton = document.querySelector(
    "#timeframeButtons button.active"
  );
  if (activeTimeframeButton) {
    currentSettings.timeframe =
      activeTimeframeButton.getAttribute("data-timeframe");
  }

  console.log(
    "Updating overlay chart with timeframe:",
    currentSettings.timeframe
  );

  // Get the datasets with the selected timeframe
  const baseAssetData = dataLoader.getFilteredDataset(
    currentSettings.baseAsset,
    currentSettings.timeframe
  );
  const overlayMetricData = dataLoader.getFilteredDataset(
    currentSettings.overlayMetric,
    currentSettings.timeframe
  );

  console.log(
    `Base asset data (${currentSettings.baseAsset}): ${
      baseAssetData?.length || 0
    } items`
  );
  console.log(
    `Overlay metric data (${currentSettings.overlayMetric}): ${
      overlayMetricData?.length || 0
    } items`
  );

  if (!baseAssetData || !overlayMetricData) {
    showErrorMessage("Failed to load required datasets. Please try again.");
    return;
  }

  // Render the overlay chart
  renderOverlayChart(
    baseAssetData,
    overlayMetricData,
    currentSettings.timeShift
  );

  // Render the correlation chart
  renderCorrelationChart(baseAssetData, overlayMetricData);
}

/**
 * Render the overlay chart
 * @param {Array} baseAssetData - The base asset dataset
 * @param {Array} overlayMetricData - The overlay metric dataset
 * @param {number} timeShift - The time shift in months
 */
function renderOverlayChart(baseAssetData, overlayMetricData, timeShift) {
  const ctx = document.getElementById("overlayChart").getContext("2d");

  // Time-shift the overlay metric data if needed
  const shiftedOverlayData =
    timeShift !== 0
      ? dataLoader.shiftDataset(overlayMetricData, timeShift)
      : overlayMetricData;

  // Align datasets by date
  const alignedData = alignDatasetsByDate(baseAssetData, shiftedOverlayData);

  // Get dataset labels
  const baseAssetLabel = getDatasetLabel(currentSettings.baseAsset);
  const overlayMetricLabel = getDatasetLabel(currentSettings.overlayMetric);

  // Prepare the data for Chart.js
  const chartData = {
    datasets: [
      {
        label: baseAssetLabel,
        data: alignedData.map((item) => ({
          x: item.date,
          y: item.baseValue,
        })),
        yAxisID: "y",
        borderColor: chartColors.baseAsset.line,
        backgroundColor: chartColors.baseAsset.fill,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: `${overlayMetricLabel} ${
          timeShift !== 0
            ? `(Shifted ${timeShift > 0 ? "Forward" : "Backward"} by ${Math.abs(
                timeShift
              )} months)`
            : ""
        }`,
        data: alignedData.map((item) => ({
          x: item.date,
          y: item.overlayValue,
        })),
        yAxisID: "y1",
        borderColor: chartColors.overlay.line,
        backgroundColor: chartColors.overlay.fill,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.3,
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
      interaction: {
        mode: "index",
        intersect: false,
      },
      layout: {
        padding: {
          bottom: 15, // Add bottom padding to ensure labels aren't cut off
        },
      },
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
            padding: {
              top: 10,
              bottom: 5,
            },
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            padding: 10,
          },
          grid: {
            drawOnChartArea: true,
          },
        },
        y: {
          type:
            currentSettings.baseAsset === "bitcoin" ? "logarithmic" : "linear",
          position: "left",
          title: {
            display: true,
            text: baseAssetLabel,
            padding: {
              bottom: 10,
            },
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            drawOnChartArea: true,
          },
          ticks: {
            padding: 8,
          },
        },
        y1: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: overlayMetricLabel,
            padding: {
              bottom: 10,
            },
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            padding: 8,
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          padding: 10,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
        },
        legend: {
          position: "top",
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12,
              weight: "bold",
            },
          },
        },
        title: {
          display: false,
        },
      },
    },
  };

  // Destroy previous chart if it exists
  if (overlayChart) {
    overlayChart.destroy();
  }

  // Create the chart
  overlayChart = new Chart(ctx, config);
}

/**
 * Render the correlation chart showing correlation at different lag/lead times
 * @param {Array} baseAssetData - The base asset dataset
 * @param {Array} overlayMetricData - The overlay metric dataset
 */
function renderCorrelationChart(baseAssetData, overlayMetricData) {
  const ctx = document.getElementById("correlationChart").getContext("2d");

  // Calculate correlations at different time shifts
  const correlations = [];
  const timeShifts = [];

  // Calculate correlations from -24 to +24 months
  for (let shift = -24; shift <= 24; shift++) {
    const correlation = dataLoader.calculateCorrelation(
      baseAssetData,
      overlayMetricData,
      shift
    );
    correlations.push(correlation);
    timeShifts.push(shift);
  }

  // Prepare the data for Chart.js
  const chartData = {
    labels: timeShifts,
    datasets: [
      {
        label: "Correlation Coefficient",
        data: correlations,
        backgroundColor: correlations.map((value) => {
          if (value > 0.3) return chartColors.correlation.positive;
          if (value < -0.3) return chartColors.correlation.negative;
          return chartColors.correlation.neutral;
        }),
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  // Chart configuration
  const config = {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 15,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time Shift (Months)",
            padding: {
              top: 10,
              bottom: 5,
            },
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            padding: 5,
            callback: function (value, index) {
              // Show fewer labels for better readability
              if (index % 4 === 0 || value === 0) {
                return value;
              }
              return "";
            },
          },
          grid: {
            display: true,
            drawOnChartArea: true,
          },
        },
        y: {
          min: -1,
          max: 1,
          title: {
            display: true,
            text: "Correlation",
            padding: {
              bottom: 10,
            },
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            padding: 8,
            stepSize: 0.2,
          },
          grid: {
            display: true,
            drawOnChartArea: true,
          },
        },
      },
      plugins: {
        tooltip: {
          padding: 10,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            title: function (context) {
              const shift = context[0].label;
              if (shift > 0) {
                return `Overlay leads by ${shift} months`;
              } else if (shift < 0) {
                return `Overlay lags by ${Math.abs(shift)} months`;
              } else {
                return "No time shift";
              }
            },
            label: function (context) {
              const value = context.parsed.y;
              if (value === null || value === undefined || isNaN(value)) {
                return `Correlation: N/A`;
              }

              let strength = "";
              if (Math.abs(value) > 0.7) strength = "Strong";
              else if (Math.abs(value) > 0.3) strength = "Moderate";
              else strength = "Weak";

              return `${strength} ${
                value > 0 ? "positive" : "negative"
              } correlation: ${value.toFixed(2)}`;
            },
          },
        },
        legend: {
          display: false, // Hide legend for cleaner look
        },
      },
    },
  };

  // Destroy previous chart if it exists
  if (correlationChart) {
    correlationChart.destroy();
  }

  // Create the chart
  correlationChart = new Chart(ctx, config);
}

/**
 * Get a human-readable label for a dataset
 * @param {string} datasetName - The internal name of the dataset
 * @returns {string} A human-readable label
 */
function getDatasetLabel(datasetName) {
  switch (datasetName) {
    case "global_m2":
      return "Global M2 Money Supply";
    case "ism_manufacturing":
      return "ISM Manufacturing PMI";
    case "ism_services":
      return "ISM Services PMI";
    case "bitcoin":
      return "Bitcoin Price (USD)";
    case "nasdaq":
      return "NASDAQ Composite Index";
    case "spx":
      return "S&P 500 Index";
    default:
      return datasetName;
  }
}

/**
 * Align two datasets by date, ensuring they have matching dates
 * @param {Array} baseAssetData - The base asset dataset
 * @param {Array} overlayMetricData - The overlay metric dataset
 * @returns {Array} Aligned dataset with {date, baseValue, overlayValue}
 */
function alignDatasetsByDate(baseAssetData, overlayMetricData) {
  if (
    !baseAssetData ||
    !overlayMetricData ||
    baseAssetData.length === 0 ||
    overlayMetricData.length === 0
  ) {
    return [];
  }

  // Convert all dates to Date objects if they're strings
  const processedBaseData = baseAssetData.map((item) => ({
    date: item.date instanceof Date ? item.date : new Date(item.date),
    value: item.value,
  }));

  const processedOverlayData = overlayMetricData.map((item) => ({
    date: item.date instanceof Date ? item.date : new Date(item.date),
    value: item.value,
  }));

  // Sort both datasets by date
  processedBaseData.sort((a, b) => a.date - b.date);
  processedOverlayData.sort((a, b) => a.date - b.date);

  // Find the common date range
  const startDate = new Date(
    Math.max(
      processedBaseData[0].date.getTime(),
      processedOverlayData[0].date.getTime()
    )
  );

  const endDate = new Date(
    Math.min(
      processedBaseData[processedBaseData.length - 1].date.getTime(),
      processedOverlayData[processedOverlayData.length - 1].date.getTime()
    )
  );

  // Filter both datasets to only include data in the common range
  const filteredBaseData = processedBaseData.filter(
    (item) => item.date >= startDate && item.date <= endDate
  );

  const filteredOverlayData = processedOverlayData.filter(
    (item) => item.date >= startDate && item.date <= endDate
  );

  // Create an array of aligned data points
  const alignedData = [];

  for (const baseItem of filteredBaseData) {
    // Find the closest date in the overlay dataset
    let closestOverlayItem = null;
    let minDiff = Number.MAX_VALUE;

    for (const overlayItem of filteredOverlayData) {
      const diff = Math.abs(
        baseItem.date.getTime() - overlayItem.date.getTime()
      );
      if (diff < minDiff) {
        minDiff = diff;
        closestOverlayItem = overlayItem;
      }
    }

    // Add the aligned point if we found a match within 15 days
    if (closestOverlayItem && minDiff <= 15 * 24 * 60 * 60 * 1000) {
      alignedData.push({
        date: baseItem.date,
        baseValue: baseItem.value,
        overlayValue: closestOverlayItem.value,
      });
    }
  }

  return alignedData;
}
