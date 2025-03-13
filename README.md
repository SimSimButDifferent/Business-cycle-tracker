# Business Cycle Tracker

An open-source economic indicator dashboard for tracking business cycles and market correlations.

![Business Cycle Tracker Dashboard](screenshots/dashboard.png)

## Overview

The Business Cycle Tracker is a free, interactive web dashboard that allows you to visualize and analyze economic indicators alongside market prices. It's designed to help identify leading relationships between economic data and asset prices, making it a valuable tool for researchers, investors, and anyone interested in economic cycles.

## Key Features

- **Interactive Overlay Charts:** Compare multiple economic indicators against market prices with customizable time shifts to identify leading/lagging relationships
- **Economic Event Annotations:** Visualize recessions, financial crises, and significant market events directly on charts
- **Correlation Analysis:** Quantify the relationship between indicators and asset prices across different time offsets
- **Responsive Design:** Works on desktop and mobile devices
- **Local Data Storage:** All data stored locally - no external dependencies required to run

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A basic web server to serve the files locally (optional)

### Quick Start

1. Clone or download this repository
2. Open `index.html` in your browser or serve through a simple HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Navigate to the Overlay Charts page to start analyzing relationships between different indicators

## Using the Overlay Chart

The overlay chart is the most powerful feature of the Business Cycle Tracker:

1. **Select a Base Asset:** Choose between NASDAQ or Bitcoin as your reference asset
2. **Choose Time Frame:** Select the historical period you want to analyze
3. **Select Metrics:** Check the indicators you want to overlay (M2 Money Supply, ISM Manufacturing, etc.)
4. **Adjust Time Shifts:** Use the sliders to shift indicators forward or backward in time to find leading relationships
5. **Update the Chart:** Click "Update Chart" to apply your selections
6. **Analyze Correlations:** Review the correlation chart at the bottom to see quantified relationships

The economic events are automatically displayed as vertical shaded regions, providing historical context for significant periods like recessions and financial crises.

## Available Indicators

- Global M2 Money Supply
- ISM Manufacturing PMI
- ISM Services PMI
- Yield Curve Spread (10Y-2Y)
- Unemployment Rate
- Bitcoin Price & YoY Returns
- NASDAQ Price & YoY Returns

## Updating Data

The dashboard comes with embedded historical data. To update with the latest figures:

1. Ensure Python 3 is installed
2. Install required packages:

```bash
pip install pandas requests yfinance fredapi python-dotenv
```

3. Optionally, set up API keys in a `.env` file:

```
FRED_API_KEY=your_fred_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

4. Run the update script:

```bash
python update_data.py
```

For ISM data updates, you can place a CSV file named `ISM-pmi-pm.csv` in the `data` directory with columns `period` and `PMI (ISM/pmi/pm)` and run:

```bash
python update_ism_data.py
```

## Customization

### Adding New Indicators

1. Add your data source in `update_data.py`
2. Update the DataLoader class in `js/dataLoader.js`
3. Create a new chart initialization function in `js/main.js`
4. Add the indicator to the overlay metrics list in `overlay.html`

### Modifying Existing Charts

Each chart is generated using Chart.js. Customize appearance and behavior by modifying the chart configuration objects in `js/main.js` and `js/overlay.js`.

## Browser Compatibility

Tested and working in:

- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Data provided by FRED, Yahoo Finance, and ISM
- Built with Chart.js, Bootstrap, and vanilla JavaScript
