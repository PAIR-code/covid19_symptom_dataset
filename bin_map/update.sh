#!/bin/bash
cd "$(dirname "$0")"

# make folders
mkdir -p ../data-raw/i18n/

# download files from GCS
gsutil -m -q rsync -d -r gs://gcs-public-data---symptom-search ../data-raw/i18n/

# split into state-symptom files and merge daily w/ weekly data
node parse-raw.js
node daily-weekly-merge.js

# combine state-symptom files into a single file for each symptom
node combine-states.js

# generate symptom heatmap thumbnails
node timeline.js

# upload to GCS
gcloud cp -r ../data-parsed/combined gs://uncertainty-over-space/combined
