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
  timeframe: "all",
  // Now we'll store multiple metrics with their time shifts
  selectedMetrics: [],
};

// Chart color schemes
const chartColors = {
  baseAsset: {
    line: "rgba(0, 0, 0, 0.7)",
    fill: "rgba(0, 0, 0, 0.05)",
  },
  metrics: {
    global_m2: {
      line: "rgba(255, 99, 132, 1)",
      fill: "rgba(255, 99, 132, 0.1)",
    },
    ism_manufacturing: {
      line: "rgba(54, 162, 235, 1)",
      fill: "rgba(54, 162, 235, 0.1)",
    },
    ism_services: {
      line: "rgba(255, 159, 64, 1)",
      fill: "rgba(255, 159, 64, 0.1)",
    },
    yield_curve: {
      line: "rgba(75, 192, 192, 1)",
      fill: "rgba(75, 192, 192, 0.1)",
    },
    unemployment: {
      line: "rgba(153, 102, 255, 1)",
      fill: "rgba(153, 102, 255, 0.1)",
    },
  },
  correlation: {
    positive: "rgba(40, 167, 69, 0.7)",
    negative: "rgba(220, 53, 69, 0.7)",
    neutral: "rgba(108, 117, 125, 0.7)",
  },
  events: {
    recession: "rgba(220, 53, 69, 0.15)", // Light red for recessions
    crisis: "rgba(220, 53, 69, 0.25)", // Darker red for major financial crises
    policy: "rgba(40, 167, 69, 0.15)", // Light green for monetary policy events
    market: "rgba(255, 193, 7, 0.15)", // Light yellow for market events
  },
};

// Economic events data
const economicEvents = [
  // Recessions
  {
    type: "recession",
    name: "Early 1990s Recession",
    start: "1990-07-01",
    end: "1991-03-01",
    description: "Oil price shock, restrictive monetary policy",
  },
  {
    type: "recession",
    name: "Dot-com Bubble Burst",
    start: "2001-03-01",
    end: "2001-11-01",
    description: "Tech stock crash, 9/11 attacks",
  },
  {
    type: "recession",
    name: "Great Financial Crisis",
    start: "2007-12-01",
    end: "2009-06-01",
    description: "Subprime mortgage crisis, housing collapse",
  },
  {
    type: "recession",
    name: "COVID-19 Pandemic",
    start: "2020-02-01",
    end: "2020-04-01",
    description: "Global pandemic shutdown",
  },

  // Major financial/economic events
  {
    type: "crisis",
    name: "Black Monday",
    start: "1987-10-19",
    end: "1987-10-26",
    description: "Stock market crash (-22.6% in one day)",
  },
  {
    type: "crisis",
    name: "Asian Financial Crisis",
    start: "1997-07-01",
    end: "1998-01-01",
    description: "Currency collapses in Asia",
  },
  {
    type: "crisis",
    name: "LTCM Collapse",
    start: "1998-08-01",
    end: "1998-09-30",
    description: "Hedge fund bailout, Russian default",
  },
  {
    type: "policy",
    name: "Fed Quantitative Easing 1",
    start: "2008-11-01",
    end: "2010-06-30",
    description: "First round of QE by Federal Reserve",
  },
  {
    type: "policy",
    name: "Fed Quantitative Easing 2",
    start: "2010-11-01",
    end: "2011-06-30",
    description: "Second round of QE by Federal Reserve",
  },
  {
    type: "policy",
    name: "Fed Quantitative Easing 3",
    start: "2012-09-01",
    end: "2014-10-31",
    description: "Third round of QE by Federal Reserve",
  },
  {
    type: "crisis",
    name: "European Debt Crisis",
    start: "2010-04-01",
    end: "2012-07-31",
    description: "Greece bailout, Euro instability",
  },
  {
    type: "market",
    name: "China Stock Market Crash",
    start: "2015-06-01",
    end: "2015-08-31",
    description: "Shanghai Composite -40%",
  },
  {
    type: "policy",
    name: "Fed Rate Hike Cycle",
    start: "2015-12-01",
    end: "2018-12-31",
    description: "Gradual interest rate increases",
  },
  {
    type: "market",
    name: "COVID-19 Market Crash",
    start: "2020-02-20",
    end: "2020-03-23",
    description: "S&P 500 -34% in 33 days",
  },
  {
    type: "policy",
    name: "COVID Stimulus",
    start: "2020-03-15",
    end: "2020-12-31",
    description: "Unprecedented monetary & fiscal stimulus",
  },
  {
    type: "policy",
    name: "Inflation Rate Hikes",
    start: "2022-03-01",
    end: "2023-07-31",
    description: "Fed combats inflation with aggressive hikes",
  },
];

// Initialize the overlay page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing overlay page");
  showLoadingState(); // Show loading state while we initialize
  initializeOverlayPage();
});

/**
 * Initialize the overlay page by setting up event listeners and loading data
 */
function initializeOverlayPage() {
  // Set up event listeners for the update button
  document
    .getElementById("updateChart")
    .addEventListener("click", updateOverlayChart);

  // Set up event listeners for timeframe buttons
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
    });
  });

  // Set up event listeners for metric checkboxes
  const metricCheckboxes = document.querySelectorAll(".metric-checkbox");
  metricCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      updateMetricVisibility(this);
    });
  });

  // Set up event listeners for time shift sliders
  const timeShiftSliders = document.querySelectorAll(".metric-timeshift");
  timeShiftSliders.forEach((slider) => {
    slider.addEventListener("input", function () {
      const metricId = this.getAttribute("data-metric");
      const value = this.value;

      // Update the displayed time shift value
      const badge =
        this.closest(".metric-item").querySelector(".timeshift-value");
      if (badge) {
        badge.textContent = `${value} months`;
      }

      // If the metric is selected, update its time shift
      updateMetricTimeShift(metricId, parseInt(value));
    });
  });

  // Get initial base asset value
  currentSettings.baseAsset = document.getElementById("baseAsset").value;
  // Use data-timeframe from the active button
  const activeTimeframeButton = document.querySelector(
    "#timeframeButtons button.active"
  );
  if (activeTimeframeButton) {
    currentSettings.timeframe =
      activeTimeframeButton.getAttribute("data-timeframe");
  }

  console.log("Initial settings:", currentSettings);

  // Load data and then initialize an empty chart
  if (typeof dataLoader !== "undefined") {
    console.log("DataLoader found, loading data...");
    dataLoader
      .loadAllData()
      .then(() => {
        console.log("Data loaded successfully");
        // Initialize an empty chart by default
        initializeEmptyChart();
        hideLoadingState();
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        hideLoadingState();
        showErrorMessage("Failed to load data. Please try again.");
      });
  } else {
    console.error("DataLoader not found!");
    hideLoadingState();
    showErrorMessage(
      "Data loading module not available. Please check your console for errors."
    );
  }
}

/**
 * Initialize an empty chart with just the base asset
 */
function initializeEmptyChart() {
  console.log(
    "Initializing empty chart with base asset:",
    currentSettings.baseAsset
  );

  // Get the base asset data
  const baseAssetData = dataLoader.getFilteredDataset(
    currentSettings.baseAsset,
    currentSettings.timeframe
  );

  if (!baseAssetData) {
    showErrorMessage(`Failed to load ${currentSettings.baseAsset} data.`);
    return;
  }

  console.log(
    `Loaded ${baseAssetData.length} data points for ${currentSettings.baseAsset}`
  );
  renderOverlayChart(baseAssetData, []);
}

/**
 * Update a metric's visibility based on checkbox state
 * @param {HTMLElement} checkbox - The checkbox element that was toggled
 */
function updateMetricVisibility(checkbox) {
  const metricId = checkbox.getAttribute("data-metric");
  const isChecked = checkbox.checked;

  if (isChecked) {
    // Add the metric if it's not already in the list
    if (!currentSettings.selectedMetrics.some((m) => m.id === metricId)) {
      // Get the current time shift value
      const slider = document.querySelector(
        `.metric-timeshift[data-metric="${metricId}"]`
      );
      const timeShift = slider ? parseInt(slider.value) : 0;

      currentSettings.selectedMetrics.push({
        id: metricId,
        timeShift: timeShift,
      });
    }
  } else {
    // Remove the metric from the list
    currentSettings.selectedMetrics = currentSettings.selectedMetrics.filter(
      (m) => m.id !== metricId
    );
  }

  // No need to update chart here - let the user click the Update Chart button
  console.log("Selected metrics:", currentSettings.selectedMetrics);
}

/**
 * Update a metric's time shift
 * @param {string} metricId - The metric ID
 * @param {number} timeShift - The time shift value in months
 */
function updateMetricTimeShift(metricId, timeShift) {
  // Find the metric in the selected metrics list
  const metricIndex = currentSettings.selectedMetrics.findIndex(
    (m) => m.id === metricId
  );

  // If the metric is selected, update its time shift
  if (metricIndex >= 0) {
    currentSettings.selectedMetrics[metricIndex].timeShift = timeShift;
  }

  // No need to update chart here - let the user click the Update Chart button
  console.log(`Updated time shift for ${metricId}: ${timeShift} months`);
}

/**
 * Update the overlay chart with the current settings
 */
function updateOverlayChart() {
  console.log("Updating overlay chart...");

  // Update base asset from form
  currentSettings.baseAsset = document.getElementById("baseAsset").value;

  // Use data-timeframe from the active button
  const activeTimeframeButton = document.querySelector(
    "#timeframeButtons button.active"
  );
  if (activeTimeframeButton) {
    currentSettings.timeframe =
      activeTimeframeButton.getAttribute("data-timeframe");
  }

  console.log("Updating overlay chart with:", currentSettings);

  // Get the base asset dataset with the selected timeframe
  const baseAssetData = dataLoader.getFilteredDataset(
    currentSettings.baseAsset,
    currentSettings.timeframe
  );

  if (!baseAssetData) {
    showErrorMessage(`Failed to load ${currentSettings.baseAsset} data.`);
    return;
  }

  console.log(`Loaded ${baseAssetData.length} data points for base asset`);

  // Gather all selected metrics and their data
  const selectedMetricsData = [];

  for (const metric of currentSettings.selectedMetrics) {
    const metricData = dataLoader.getFilteredDataset(
      metric.id,
      currentSettings.timeframe
    );

    if (metricData) {
      console.log(`Loaded ${metricData.length} data points for ${metric.id}`);
      selectedMetricsData.push({
        id: metric.id,
        data: metricData,
        timeShift: metric.timeShift,
      });
    } else {
      console.warn(`Failed to load data for metric: ${metric.id}`);
    }
  }

  // Render the overlay chart with the base asset and selected metrics
  renderOverlayChart(baseAssetData, selectedMetricsData);

  // Update the correlation chart if we have at least one metric selected
  if (selectedMetricsData.length > 0) {
    // For simplicity, just use the first selected metric for the correlation chart
    renderCorrelationChart(baseAssetData, selectedMetricsData[0].data);
  } else {
    // If no metrics are selected, clear the correlation chart
    if (correlationChart) {
      correlationChart.destroy();
      correlationChart = null;
    }
  }
}

/**
 * Render the overlay chart
 * @param {Array} baseAssetData - The base asset dataset
 * @param {Array} metricsData - Array of objects containing metric data and settings
 */
function renderOverlayChart(baseAssetData, metricsData) {
  console.log("Rendering overlay chart...");
  console.log("Base asset data points:", baseAssetData.length);
  console.log("Metrics data:", metricsData);

  // Check if the canvas exists
  const canvas = document.getElementById("overlayChart");
  if (!canvas) {
    console.error("Overlay chart canvas not found!");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Could not get 2D context for overlay chart canvas!");
    return;
  }

  console.log("Canvas dimensions:", canvas.width, canvas.height);

  // Prepare the datasets for Chart.js
  const datasets = [
    {
      label: getDatasetLabel(currentSettings.baseAsset),
      data: baseAssetData.map((item) => ({
        x: item.date,
        y: item.value,
      })),
      yAxisID: "y",
      borderColor: chartColors.baseAsset.line,
      backgroundColor: chartColors.baseAsset.fill,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
      order: 1, // Make sure base asset is always on top
    },
  ];

  // Add datasets for each selected metric
  for (let i = 0; i < metricsData.length; i++) {
    const metric = metricsData[i];
    const metricId = metric.id;
    const metricData = metric.data;
    const timeShift = metric.timeShift;

    console.log(
      `Processing metric: ${metricId}, timeShift: ${timeShift}, datapoints: ${metricData.length}`
    );

    // Apply time shift if needed
    const shiftedData =
      timeShift !== 0
        ? dataLoader.shiftDataset(metricData, timeShift)
        : metricData;

    // Add the dataset
    datasets.push({
      label: `${getDatasetLabel(metricId)} ${
        timeShift !== 0
          ? `(Shifted ${timeShift > 0 ? "Forward" : "Backward"} by ${Math.abs(
              timeShift
            )} months)`
          : ""
      }`,
      data: shiftedData.map((item) => ({
        x: item.date,
        y: item.value,
      })),
      yAxisID: `y-${metricId}`, // Each metric gets its own y-axis
      borderColor:
        chartColors.metrics[metricId]?.line || `hsl(${i * 50}, 70%, 50%)`,
      backgroundColor:
        chartColors.metrics[metricId]?.fill || `hsla(${i * 50}, 70%, 50%, 0.1)`,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
      order: i + 2, // Order metrics after the base asset
    });
  }

  // Prepare the y-axes configuration
  const scales = {
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
      type: currentSettings.baseAsset === "bitcoin" ? "logarithmic" : "linear",
      position: "left",
      title: {
        display: true,
        text: getDatasetLabel(currentSettings.baseAsset),
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
  };

  // Add y-axes for each metric
  metricsData.forEach((metric, index) => {
    const metricId = metric.id;
    scales[`y-${metricId}`] = {
      type: "linear",
      position: index % 2 === 0 ? "right" : "left", // Alternate sides for multiple metrics
      title: {
        display: true,
        text: getDatasetLabel(metricId),
        padding: {
          bottom: 10,
        },
        font: {
          size: 14,
          weight: "bold",
        },
        color:
          chartColors.metrics[metricId]?.line || `hsl(${index * 50}, 70%, 50%)`,
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        padding: 8,
        color:
          chartColors.metrics[metricId]?.line || `hsl(${index * 50}, 70%, 50%)`,
      },
      // Only display every other axis to prevent crowding
      display: index < 4, // Limit to 4 metrics max
    };
  });

  // Filter economic events based on the selected timeframe
  const filteredEvents = filterEventsByTimeframe(
    economicEvents,
    currentSettings.timeframe
  );
  console.log(`Showing ${filteredEvents.length} economic events on chart`);

  // Create annotations for economic events
  const annotations = {};

  // Add economic events as vertical regions
  filteredEvents.forEach((event, index) => {
    const eventId = `event_${index}`;
    annotations[eventId] = {
      type: "box",
      xMin: event.start,
      xMax: event.end,
      backgroundColor: chartColors.events[event.type],
      borderColor: "transparent",
      drawTime: "beforeDatasetsDraw",
      label: {
        display: true,
        content: event.name,
        position: "start",
        rotation: 270,
        color: "rgba(0, 0, 0, 0.7)",
        font: {
          size: 10,
          weight: "bold",
        },
      },
      // Add tooltip for each event
      tooltip: {
        callbacks: {
          label: function () {
            return `${event.name}: ${event.description}`;
          },
        },
      },
    };
  });

  // Chart configuration
  const config = {
    type: "line",
    data: {
      datasets: datasets,
    },
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
      scales: scales,
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
          callbacks: {
            // Add custom tooltip to show event information
            afterTitle: function (tooltipItems) {
              const x = new Date(tooltipItems[0].parsed.x);

              // Find any events that include this date
              const matchingEvents = filteredEvents.filter((event) => {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);
                return x >= startDate && x <= endDate;
              });

              if (matchingEvents.length > 0) {
                return matchingEvents
                  .map((e) => `[${e.name}] ${e.description}`)
                  .join("\n");
              }
              return "";
            },
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
        // Add annotation plugin configuration for events
        annotation: {
          annotations: annotations,
        },
      },
    },
  };

  console.log("Chart configuration prepared:", config);

  try {
    // Destroy previous chart if it exists
    if (overlayChart) {
      console.log("Destroying previous chart instance");
      overlayChart.destroy();
      overlayChart = null;
    }

    // Create the new chart
    console.log("Creating new chart instance");
    overlayChart = new Chart(ctx, config);
    console.log("Chart created successfully");

    // Update the UI to reflect the current state
    updateUIState();
  } catch (error) {
    console.error("Error creating chart:", error);
    showErrorMessage("Failed to create chart: " + error.message);
  }
}

/**
 * Filter economic events based on the selected timeframe
 * @param {Array} events - The full list of economic events
 * @param {string} timeframe - The selected timeframe
 * @returns {Array} - Filtered list of events that fall within the timeframe
 */
function filterEventsByTimeframe(events, timeframe) {
  if (timeframe === "all") {
    return events; // Return all events when timeframe is "all"
  }

  const now = new Date();
  let cutoffDate;

  // Define cutoff date based on timeframe
  switch (timeframe) {
    case "1year":
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case "5years":
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 5);
      break;
    case "10years":
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 10);
      break;
    case "20years":
      cutoffDate = new Date(now);
      cutoffDate.setFullYear(now.getFullYear() - 20);
      break;
    default:
      return events; // Default to all events
  }

  // Filter events to only include those that end after the cutoff date
  return events.filter((event) => {
    const eventEndDate = new Date(event.end);
    return eventEndDate >= cutoffDate;
  });
}

/**
 * Render the correlation chart showing correlation at different lag/lead times
 * @param {Array} baseAssetData - The base asset dataset
 * @param {Array} overlayMetricData - The overlay metric dataset
 */
function renderCorrelationChart(baseAssetData, overlayMetricData) {
  console.log("Rendering correlation chart...");
  console.log("Base asset data points:", baseAssetData.length);
  console.log("Overlay data points:", overlayMetricData.length);

  // Check if the canvas exists
  const canvas = document.getElementById("correlationChart");
  if (!canvas) {
    console.error("Correlation chart canvas not found!");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Could not get 2D context for correlation chart canvas!");
    return;
  }

  console.log(
    "Correlation chart canvas dimensions:",
    canvas.width,
    canvas.height
  );

  // Calculate correlations at different time shifts
  const correlations = [];
  const timeShifts = [];

  console.log(
    "Calculating correlations for time shifts from -24 to +24 months"
  );
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

  console.log("Correlation data calculated:", correlations);

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
            text: "Time Shift (months)",
            padding: {
              top: 10,
            },
            font: {
              size: 14,
              weight: "bold",
            },
          },
          ticks: {
            callback: function (value, index, values) {
              // Show only every 6th tick to avoid crowding
              return index % 6 === 0 ? timeShifts[index] : "";
            },
          },
        },
        y: {
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
          min: -1,
          max: 1,
          ticks: {
            stepSize: 0.2,
          },
        },
      },
      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            title: function (tooltipItems) {
              const shift = tooltipItems[0].label;
              if (shift > 0) {
                return `Overlay metric leads by ${shift} months`;
              } else if (shift < 0) {
                return `Overlay metric lags by ${Math.abs(shift)} months`;
              } else {
                return "No time shift";
              }
            },
            label: function (context) {
              const value = context.raw.toFixed(2);
              return `Correlation: ${value}`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    },
  };

  console.log("Correlation chart configuration prepared");

  try {
    // Destroy previous chart if it exists
    if (correlationChart) {
      console.log("Destroying previous correlation chart instance");
      correlationChart.destroy();
      correlationChart = null;
    }

    // Create the new chart
    console.log("Creating new correlation chart instance");
    correlationChart = new Chart(ctx, config);
    console.log("Correlation chart created successfully");
  } catch (error) {
    console.error("Error creating correlation chart:", error);
    showErrorMessage("Failed to create correlation chart: " + error.message);
  }
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
 * Update the UI to match the current state
 */
function updateUIState() {
  // Update all checkboxes based on selected metrics
  const checkboxes = document.querySelectorAll(".metric-checkbox");
  checkboxes.forEach((checkbox) => {
    const metricId = checkbox.getAttribute("data-metric");
    checkbox.checked = currentSettings.selectedMetrics.some(
      (m) => m.id === metricId
    );
  });

  // Update all time shift sliders based on selected metrics
  const sliders = document.querySelectorAll(".metric-timeshift");
  sliders.forEach((slider) => {
    const metricId = slider.getAttribute("data-metric");
    const metric = currentSettings.selectedMetrics.find(
      (m) => m.id === metricId
    );

    if (metric) {
      slider.value = metric.timeShift;
      // Update badge
      const badge = slider
        .closest(".metric-item")
        .querySelector(".timeshift-value");
      if (badge) {
        badge.textContent = `${metric.timeShift} months`;
      }
    }
  });
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
    // Find the closest overlay item (within a reasonable date range)
    const closestOverlayItem = filteredOverlayData.find((item) => {
      const diffDays =
        Math.abs(item.date - baseItem.date) / (1000 * 60 * 60 * 24);
      return diffDays <= 15; // Within 15 days
    });

    if (closestOverlayItem) {
      alignedData.push({
        date: baseItem.date,
        baseValue: baseItem.value,
        overlayValue: closestOverlayItem.value,
      });
    }
  }

  return alignedData;
}
