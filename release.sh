#!/bin/bash

if [ -z "$1" ]
  then
    echo "Version required, exiting..."
    exit 1
else
  echo "Updating version in package.json..."
  jq ".version = \"$1\"" package.json > package.$$.json && mv package.$$.json package.json || exit 1

  echo "Updating README.md..."
  oclif-dev readme || exit 1

  if [ ! -z "$(git status --porcelain)" ]
    then
      echo "Committing and pushing changes to git..."
      git add . || exit 1
      git commit -m "Releasing v$1" || exit 1
      git push origin master || exit 1
  fi

  echo "Packing tarballs..."
  oclif-dev pack -t linux-arm,linux-x64,darwin-x64

  echo "Pushing tarballs to S3"
  oclif-dev publish
fi
