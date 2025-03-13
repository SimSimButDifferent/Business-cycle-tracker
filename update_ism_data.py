#!/usr/bin/env python3
"""
Update ISM Manufacturing data from CSV file

This script reads the ISM Manufacturing PMI data from a CSV file
and updates the JSON file, ensuring there are no duplicates.
"""

import json
import os
import csv
from datetime import datetime

def update_ism_manufacturing_from_csv():
    """Update the ISM Manufacturing JSON with data from the CSV file"""
    print("Updating ISM Manufacturing data from CSV file...")
    
    # Read the existing JSON data
    json_file_path = 'data/ism_manufacturing.json'
    with open(json_file_path, 'r') as f:
        existing_data = json.load(f)

    # Create a dictionary of existing data for easy lookup and deduplication
    # Use the date as the key
    existing_dict = {item['date']: item['value'] for item in existing_data}

    # Read the CSV data
    csv_file_path = 'data/ISM-pmi-pm.csv'
    new_entries = []
    updated_entries = 0
    
    with open(csv_file_path, 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header row
        for row in reader:
            period, value = row
            # Convert YYYY-MM to YYYY-MM-01 format to match the JSON
            date_obj = datetime.strptime(period, '%Y-%m')
            formatted_date = date_obj.strftime('%Y-%m-01')
            
            # Only add if the entry doesn't exist
            if formatted_date not in existing_dict:
                new_entries.append({
                    'date': formatted_date,
                    'value': float(value)
                })
            # If it exists but the value is different, update it
            elif abs(float(value) - existing_dict[formatted_date]) > 0.01:  # Allow for small float differences
                # Find the entry and update it
                for item in existing_data:
                    if item['date'] == formatted_date:
                        item['value'] = float(value)
                        updated_entries += 1
                        break

    # Add new entries to existing data
    existing_data.extend(new_entries)

    # Sort by date
    existing_data.sort(key=lambda x: x['date'])

    # Write the updated data back to the JSON file
    with open(json_file_path, 'w') as f:
        json.dump(existing_data, f, indent=2)

    print(f"Added {len(new_entries)} new entries and updated {updated_entries} existing entries.")
    print(f"Total entries in ISM Manufacturing data: {len(existing_data)}")

if __name__ == "__main__":
    update_ism_manufacturing_from_csv() 