#!/bin/bash
cd "$(dirname "$0")"

# download files from github
node download.js

# split into state-symptom files and merge daily w/ weekly data
node parse-raw.js
node daily-weekly-merge.js

# combine state-symptom files into a single file for each symptom
node combine-states.js

# generate symptom heatmap thumbnails
node timeline.js

# upload to GCS
gsutil -m rsync -r ../data-parsed/combined gs://uncertainty-over-space/combined
