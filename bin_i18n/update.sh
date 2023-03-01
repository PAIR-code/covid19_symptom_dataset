#!/bin/bash
cd "$(dirname "$0")"

# make folders
mkdir -p ../data-raw/i18n/
mkdir -p ../data-parsed/i18n/

# download files from GCS
gsutil -m -q rsync -d -r gs://gcs-public-data---symptom-search ../data-raw/i18n/


node --max-old-space-size=8192 calc-download-list.js

node --max-old-space-size=8192 parse.js

# upload to GCS
gsutil -m -q rsync -r ../data-parsed/i18n gs://uncertainty-over-space/ssd_i18n

# TODO: Upgrade to gcloud API
# gcloud storage cp -r ../data-parsed/i18n gs://uncertainty-over-space/ssd_i18n
