#!/bin/bash
cd "$(dirname "$0")"

# make folders
mkdir -p ../data-raw/i18n/
mkdir -p ../data-parsed/i18n/

# download files from GCS
gcloud storage cp -d -r gs://gcs-public-data---symptom-search ../data-raw/i18n/


node calc-download-list.js

node parse.js

# upload to GCS
gcloud storage cp -r ../data-parsed/i18n gs://uncertainty-over-space/ssd_i18n
