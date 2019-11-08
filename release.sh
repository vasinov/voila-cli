#!/bin/bash

# This script is used to build and push release artifacts to s3.
#
# For the script to work developers have to have jq, git, and oclif-dev
# on their path.
#
# For the S3 push to work AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY have to be set.

set -e

if [ -z "$1" ]
  then
    echo "Version required, exiting..."
    exit 1
else
  echo "Updating version in package.json..."
  jq ".version = \"$1\"" package.json > package.$$.json && mv package.$$.json package.json

  if [ ! -z "$(git status --porcelain)" ]
    then
      echo "Committing and pushing changes to git..."
      git add .
      git commit -m "Releasing v$1"
      git push origin master
  fi

  echo "Packing tarballs..."
  oclif-dev pack

  echo "Pushing tarballs to S3"
  oclif-dev publish
fi
