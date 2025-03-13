#!/usr/bin/env python3
"""
Economic Data Updater

This script automatically fetches the latest economic data and updates 
the corresponding JSON files in the data directory.

Dependencies:
- requests
- pandas
- yfinance (for Bitcoin data)
- fredapi (for Fed data)
- python-dotenv (for environment variables)
"""

import os
import json
import time
import datetime
import requests
import pandas as pd
from dateutil.relativedelta import relativedelta

# Try to import optional dependencies
try:
    import yfinance as yf
    HAS_YFINANCE = True
except ImportError:
    HAS_YFINANCE = False
    print("Warning: yfinance not installed. Bitcoin data will not be updated.")

try:
    from fredapi import Fred
    HAS_FRED = True
except ImportError:
    HAS_FRED = False
    print("Warning: fredapi not installed. Fed data will not be updated.")

try:
    from dotenv import load_dotenv
    HAS_DOTENV = True
    # Load environment variables from .env file
    load_dotenv()
except ImportError:
    HAS_DOTENV = False
    print("Warning: python-dotenv not installed. Will use hardcoded API keys.")

# Configuration
# Read API keys from environment variables or use default (which won't work)
FRED_API_KEY = os.getenv("FRED_API_KEY", "YOUR_FRED_API_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
DATA_DIR = "data"
ISM_API_URL = "https://api.stlouisfed.org/fred/series/observations"


def ensure_data_dir():
    """Make sure the data directory exists"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)


def read_existing_json(filename):
    """Read an existing JSON file and return its data"""
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error reading {filename}: {e}")
            print(f"The file may be corrupted. Creating a backup and starting fresh.")
            # Create a backup of the corrupted file
            backup_path = f"{filepath}.bak"
            os.rename(filepath, backup_path)
            return []
    return []


def write_json(data, filename):
    """Write data to a JSON file"""
    filepath = os.path.join(DATA_DIR, filename)
    # First write to a temporary file to avoid corrupting the original
    temp_filepath = f"{filepath}.tmp"
    try:
        with open(temp_filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        # If successful, rename to the actual file
        if os.path.exists(filepath):
            os.replace(temp_filepath, filepath)
        else:
            os.rename(temp_filepath, filepath)
            
        print(f"Updated {filename} with {len(data)} records")
    except Exception as e:
        print(f"Error writing {filename}: {e}")
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)


def update_bitcoin_price():
    """Update Bitcoin price data using yfinance"""
    if not HAS_YFINANCE:
        return
    
    print("Updating Bitcoin price data...")
    
    # Read existing data
    existing_data = read_existing_json("bitcoin_price.json")
    
    # Find the most recent date in the existing data
    if existing_data:
        latest_date = max(item["date"] for item in existing_data)
        start_date = (datetime.datetime.strptime(latest_date, "%Y-%m-%d") + 
                      datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    else:
        # If no existing data, start from 2010
        start_date = "2010-07-01"
    
    # Get end date (today)
    end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # If start date is after or equal to end date, no update needed
    if start_date >= end_date:
        print("Bitcoin price data is already up to date.")
        return
    
    # Fetch Bitcoin data from Yahoo Finance
    try:
        btc_data = yf.download("BTC-USD", start=start_date, end=end_date, interval="1mo")
        
        # If no new data, return
        if btc_data.empty:
            print("No new Bitcoin data available.")
            return
        
        # Process the data
        new_data = []
        for date_idx in btc_data.index:
            # Use the closing price for the monthly value and convert to proper Python float
            # Fix for FutureWarning: Use iloc[0] instead of directly converting Series to float
            new_data.append({
                "date": date_idx.strftime("%Y-%m-%d"),
                "value": float(btc_data.loc[date_idx, "Close"].iloc[0]) if hasattr(btc_data.loc[date_idx, "Close"], "iloc") else float(btc_data.loc[date_idx, "Close"])
            })
        
        # Combine existing and new data
        updated_data = existing_data + new_data
        
        # Sort by date
        updated_data.sort(key=lambda x: x["date"])
        
        # Write updated data
        write_json(updated_data, "bitcoin_price.json")
        
    except Exception as e:
        print(f"Error updating Bitcoin price data: {e}")


def update_fred_data():
    """Update data from Federal Reserve Economic Data (FRED)"""
    if not HAS_FRED:
        return
    
    if FRED_API_KEY == "YOUR_FRED_API_KEY":
        print("FRED API key not configured. Please set FRED_API_KEY in .env file.")
        print("You can get a free API key at https://fred.stlouisfed.org/docs/api/api_key.html")
        return
    
    print("Updating FRED data...")
    
    # Initialize FRED API
    fred = Fred(api_key=FRED_API_KEY)
    
    # Define series IDs for each dataset
    series_mapping = {
        "M2SL": "global_m2.json",  # M2 Money Supply
        "UNRATE": "unemployment_rate.json",  # Unemployment Rate
        "T10Y2Y": "yield_curve.json",  # 10Y-2Y Treasury Yield Spread
    }
    
    for series_id, filename in series_mapping.items():
        print(f"Updating {filename}...")
        
        # Read existing data
        existing_data = read_existing_json(filename)
        
        # Find the most recent date in the existing data
        if existing_data:
            latest_date = max(item["date"] for item in existing_data)
            start_date = (datetime.datetime.strptime(latest_date, "%Y-%m-%d") + 
                          datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            # If no existing data, start from 1990
            start_date = "1990-01-01"
        
        # Fetch data from FRED
        try:
            # Get data up to today
            df = fred.get_series(series_id, start_date)
            
            # If no new data, continue to next series
            if df.empty:
                print(f"No new data available for {series_id}.")
                continue
            
            # Process the data
            new_data = []
            for date, value in df.items():
                if not pd.isna(value):  # Skip NaN values
                    new_data.append({
                        "date": date.strftime("%Y-%m-%d"),
                        "value": round(float(value), 2)
                    })
            
            # Combine existing and new data
            updated_data = existing_data + new_data
            
            # Sort by date
            updated_data.sort(key=lambda x: x["date"])
            
            # Write updated data
            write_json(updated_data, filename)
            
        except Exception as e:
            print(f"Error updating {series_id} data: {e}")
            print("Check if your FRED API key is valid and has not exceeded usage limits.")


def update_ism_data():
    """Update ISM Manufacturing and Services PMI data (requires manual API setup)"""
    print("Updating ISM data...")
    
    # Updated FRED series IDs for ISM data
    series_mapping = {
        "MANEMP": "ism_manufacturing.json",  # ISM Manufacturing PMI (updated ID)
        "SRVPRD": "ism_services.json",       # ISM Services PMI (updated ID)
    }
    
    if not HAS_FRED or not FRED_API_KEY or FRED_API_KEY == "YOUR_FRED_API_KEY":
        print("FRED API key not configured. Cannot update ISM data.")
        return
    
    # Parameters for the API request
    params = {
        "api_key": FRED_API_KEY,
        "file_type": "json"
    }
    
    for series_id, filename in series_mapping.items():
        print(f"Updating {filename}...")
        
        # Read existing data
        existing_data = read_existing_json(filename)
        
        # Find the most recent date in the existing data
        if existing_data:
            latest_date = max(item["date"] for item in existing_data)
            start_date = (datetime.datetime.strptime(latest_date, "%Y-%m-%d") + 
                          datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            # If no existing data, start from 1990
            start_date = "1990-01-01"
        
        # Add series-specific parameters
        params["series_id"] = series_id
        params["observation_start"] = start_date
        
        try:
            # Make the API request
            response = requests.get(ISM_API_URL, params=params)
            response.raise_for_status()  # Raise exception for 4XX/5XX status codes
            data = response.json()
            
            # Extract observations
            observations = data.get("observations", [])
            
            # If no new data, continue to next series
            if not observations:
                print(f"No new data available for {series_id}.")
                continue
            
            # Process the data
            new_data = []
            for obs in observations:
                if obs["value"] != ".":  # Skip missing values
                    new_data.append({
                        "date": obs["date"],
                        "value": round(float(obs["value"]), 1)
                    })
            
            # Combine existing and new data
            updated_data = existing_data + new_data
            
            # Sort by date
            updated_data.sort(key=lambda x: x["date"])
            
            # Write updated data
            write_json(updated_data, filename)
            
        except requests.exceptions.RequestException as e:
            print(f"Error updating {series_id} data: {e}")
            
        # Rate limit to avoid API overuse
        time.sleep(1)


def get_nasdaq_data():
    """Fetch NASDAQ Composite Index data using an alternative API since FRED doesn't provide it"""
    print("Updating NASDAQ data...")
    
    # First try using existing nasdaq_index.json if it exists (and rename if needed)
    if os.path.exists(os.path.join(DATA_DIR, "nasdaq_index.json")) and not os.path.exists(os.path.join(DATA_DIR, "nasdaq.json")):
        existing_data = read_existing_json("nasdaq_index.json")
        if existing_data:
            write_json(existing_data, "nasdaq.json")
            print("Renamed nasdaq_index.json to nasdaq.json")
    
    # Read existing data
    existing_data = read_existing_json("nasdaq.json")
    
    # Find the most recent date in the existing data
    if existing_data:
        latest_date = max(item["date"] for item in existing_data)
        start_date = (datetime.datetime.strptime(latest_date, "%Y-%m-%d") + 
                      datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    else:
        # If no existing data, start from 1990
        start_date = "1990-01-01"
    
    # Get NASDAQ data from Yahoo Finance
    if HAS_YFINANCE:
        try:
            # Get data up to today
            nasdaq_data = yf.download("^IXIC", start=start_date, interval="1mo")
            
            # If no new data, return
            if nasdaq_data.empty:
                print("No new NASDAQ data available.")
                return
            
            # Process the data
            new_data = []
            for date_idx in nasdaq_data.index:
                # Fix for FutureWarning: Use iloc[0] instead of directly converting Series to float
                new_data.append({
                    "date": date_idx.strftime("%Y-%m-%d"),
                    "value": float(nasdaq_data.loc[date_idx, "Close"].iloc[0]) if hasattr(nasdaq_data.loc[date_idx, "Close"], "iloc") else float(nasdaq_data.loc[date_idx, "Close"])
                })
            
            # Combine existing and new data
            updated_data = existing_data + new_data
            
            # Sort by date
            updated_data.sort(key=lambda x: x["date"])
            
            # Write updated data
            write_json(updated_data, "nasdaq.json")
            
        except Exception as e:
            print(f"Error updating NASDAQ data: {e}")
    else:
        print("yfinance not installed. Cannot update NASDAQ data.")


def generate_yoy_returns():
    """Generate Year-over-Year returns for Bitcoin and NASDAQ"""
    print("Generating YoY returns data...")
    
    # Generate YoY returns for Bitcoin
    bitcoin_data = read_existing_json("bitcoin_price.json")
    if bitcoin_data:
        bitcoin_yoy = calculate_yoy_returns(bitcoin_data)
        write_json(bitcoin_yoy, "bitcoin_yoy.json")
    
    # Generate YoY returns for NASDAQ
    nasdaq_data = read_existing_json("nasdaq.json")
    if nasdaq_data:
        nasdaq_yoy = calculate_yoy_returns(nasdaq_data)
        write_json(nasdaq_yoy, "nasdaq_yoy.json")


def calculate_yoy_returns(price_data):
    """Calculate Year-over-Year returns for a price dataset"""
    # Sort data by date
    sorted_data = sorted(price_data, key=lambda x: x["date"])
    
    # Initialize result list
    yoy_data = []
    
    # For each data point, find the value 1 year ago and calculate YoY return
    for i, current in enumerate(sorted_data):
        current_date = datetime.datetime.strptime(current["date"], "%Y-%m-%d")
        target_date = current_date - relativedelta(years=1)
        
        # Find the closest data point to 1 year ago
        closest_idx = None
        min_diff = datetime.timedelta(days=365)
        
        for j, past in enumerate(sorted_data[:i]):
            past_date = datetime.datetime.strptime(past["date"], "%Y-%m-%d")
            diff = abs(past_date - target_date)
            
            if diff < min_diff:
                min_diff = diff
                closest_idx = j
        
        # If we found a data point close enough to 1 year ago (within 45 days)
        if closest_idx is not None and min_diff <= datetime.timedelta(days=45):
            past_value = sorted_data[closest_idx]["value"]
            current_value = current["value"]
            
            # Calculate YoY return as percentage
            if past_value > 0:  # Avoid division by zero
                yoy_return = ((current_value / past_value) - 1) * 100
                
                # Add to result
                yoy_data.append({
                    "date": current["date"],
                    "value": round(yoy_return, 2)
                })
    
    return yoy_data


def check_data_integrity():
    """Verify that all data files are valid JSON and fix any issues"""
    print("Checking data integrity...")
    
    # List of all data files to check
    data_files = [
        "bitcoin_price.json",
        "bitcoin_yoy.json",
        "global_m2.json",
        "ism_manufacturing.json",
        "ism_services.json",
        "nasdaq.json", 
        "nasdaq_yoy.json",
        "unemployment_rate.json",
        "yield_curve.json"
    ]
    
    for filename in data_files:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    json.load(f)
                print(f"✓ {filename} is valid")
            except json.JSONDecodeError as e:
                print(f"✗ {filename} is corrupted: {e}")
                print(f"  Creating backup and attempting repair...")
                
                # Create a backup
                backup_path = f"{filepath}.bak"
                os.rename(filepath, backup_path)
                
                # Try to read the file with error handling
                try:
                    with open(backup_path, 'r') as f:
                        content = f.read().strip()
                    
                    # Basic repair attempts
                    if not content.endswith("]"):
                        content += "\n]"
                    
                    # Try to parse the fixed content
                    fixed_data = json.loads(content)
                    
                    # Write the fixed data
                    with open(filepath, 'w') as f:
                        json.dump(fixed_data, f, indent=2)
                    
                    print(f"  ✓ {filename} successfully repaired")
                except Exception as repair_error:
                    print(f"  ✗ Could not repair {filename}: {repair_error}")


def main():
    """Main function to run all update processes"""
    print("Starting data update process...")
    
    # Ensure data directory exists
    ensure_data_dir()
    
    # Check data integrity first
    check_data_integrity()
    
    # Update all datasets
    update_bitcoin_price()
    update_fred_data()
    update_ism_data()
    get_nasdaq_data()
    
    # Generate YoY returns after updating price data
    generate_yoy_returns()
    
    # Final integrity check
    check_data_integrity()
    
    print("Data update complete.")


if __name__ == "__main__":
    main() 