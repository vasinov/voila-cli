#!/bin/bash

set -e

if [ -z "$1" ]
  then
    echo "Version required, exiting..."
    exit 1
else
  echo "Updating version in package.json..."
  jq ".version = \"$1\"" package.json > package.$$.json && mv package.$$.json package.json

  echo "Updating README.md..."
  oclif-dev readme

  if [ ! -z "$(git status --porcelain)" ]
    then
      echo "Committing and pushing changes to git..."
      git add .
      git commit -m "Releasing v$1"
      git push origin master
  fi

  echo "Pushing tarballs to S3"
  oclif-dev publish -t linux-arm,linux-x64,darwin-x64
fi
