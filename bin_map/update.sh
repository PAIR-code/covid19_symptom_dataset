#!/bin/bash
cd "$(dirname "$0")"

# make folders
mkdir -p ../data-raw/i18n/

# download files from GCS
gsutil -m -q rsync -d -r gs://gcs-public-data---symptom-search ../data-raw/i18n/

# split into state-symptom files and merge daily w/ weekly data
node --max-old-space-size=8192 parse-raw.js
node --max-old-space-size=8192 daily-weekly-merge.js

# combine state-symptom files into a single file for each symptom
node --max-old-space-size=8192 combine-states.js

# generate symptom heatmap thumbnails
node --max-old-space-size=8192 timeline.js

# upload to GCS
gcloud storage cp -r ../data-parsed/combined gs://uncertainty-over-space/combined
