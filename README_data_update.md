# Economic Data Updater

This tool automatically updates the economic data JSON files used in the Business Cycle Tracker application with the latest available data from official sources.

## Features

- Updates Bitcoin price data from Yahoo Finance
- Updates M2 Money Supply, Unemployment Rate, and Yield Curve data from FRED (Federal Reserve Economic Data)
- Updates ISM Manufacturing and Services PMI data from FRED
- Updates NASDAQ Composite Index data from Yahoo Finance
- Preserves existing data and only adds new data points
- Automatically formats data to match the existing structure
- Checks data integrity and attempts to repair corrupted files
- Uses environment variables for secure API key management

## Installation

1. Make sure you have Python 3.6+ installed on your system
2. Install the required dependencies:

```bash
pip install pandas requests python-dateutil python-dotenv
```

3. Install optional dependencies for specific data sources:

```bash
pip install yfinance fredapi
```

## Configuration

Before using the script, you need to:

1. Sign up for a free FRED API key at [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html)
2. Create a `.env` file in the project root (or copy from `.env.example`):

```
# Business Cycle Tracker API Keys
FRED_API_KEY=your_actual_key_here
```

The script will automatically read your API keys from the `.env` file, which is more secure than hardcoding them in the script.

## Usage

Run the script to update all data files:

```bash
python update_data.py
```

The script will:

1. Check each data file for integrity
2. Check each data file for the most recent entry
3. Fetch any new data since that date
4. Append the new data to the existing file
5. Sort all entries by date
6. Perform a final integrity check

## Data Integrity

The script now includes a data integrity checking feature that:

- Validates all JSON files before and after updates
- Creates backups of corrupted files (with .bak extension)
- Attempts to automatically repair common JSON corruption issues
- Implements safe write operations using temporary files

## Security

For security reasons:

- API keys are stored in a `.env` file, not in the code
- The `.env` file is excluded from Git in `.gitignore`
- An example configuration file `.env.example` is provided with placeholders

## Scheduling Automatic Updates

### On Linux/macOS (using cron)

To run the script automatically each month:

1. Open your crontab file:

```bash
crontab -e
```

2. Add a line to run the script on the 1st of each month at midnight:

```
0 0 1 * * cd /path/to/business-cycle-tracker && python update_data.py >> update_log.txt 2>&1
```

### On Windows (using Task Scheduler)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set the trigger to monthly, on the 1st day of the month
4. Set the action to "Start a program"
5. Browse to your Python executable (e.g., `C:\Python39\python.exe`)
6. Add arguments: `/path/to/business-cycle-tracker/update_data.py`

## Troubleshooting

- If you see "Warning: yfinance not installed", you won't be able to update Bitcoin and NASDAQ data
- If you see "Warning: fredapi not installed", you won't be able to update Fed data
- If you see "Warning: python-dotenv not installed", the script will try to use hardcoded API keys
- If the script fails with HTTP errors, check that your FRED API key is correct and that you haven't exceeded API rate limits
- If a data file is corrupted, look for a `.bak` file with the same name which contains the original data

## Data Sources

- Bitcoin Price: Yahoo Finance (BTC-USD)
- NASDAQ Composite: Yahoo Finance (^IXIC)
- M2 Money Supply: FRED (M2SL)
- Unemployment Rate: FRED (UNRATE)
- Yield Curve Spread (10Y-2Y): FRED (T10Y2Y)
- ISM Manufacturing PMI: FRED (NAPM)
- ISM Services PMI: FRED (NMFCI)
