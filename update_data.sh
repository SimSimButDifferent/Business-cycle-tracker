#!/bin/bash
# Script to update economic data for Business Cycle Tracker
# Recommended to run this monthly via cron job

# Navigate to the project directory
cd "$(dirname "$0")"

# Activate virtual environment if using one
# source venv/bin/activate

# Run the update script
echo "Starting data update on $(date)"
python3 update_data.py

# Check if the script exited successfully
if [ $? -eq 0 ]; then
  echo "Data update completed successfully on $(date)"
else
  echo "Error updating data on $(date)"
fi

# Optional: commit changes to git repository
if [ -d ".git" ]; then
  git add data/*.json
  git commit -m "Monthly data update: $(date +%Y-%m-%d)"
  # Uncomment to push to remote repository
  # git push
fi 