#!/bin/bash

project=$1
max_timestamp=1

cd $project

for branch in $(git branch -r); do
  if [[ $branch == *"hotfix"* ]]; then
    timestamp=$(git reflog --date=raw $branch --pretty=format:"%at")
    if [[ $timestamp > $max_timestamp ]]; then
      max_timestamp=$timestamp
    fi
  fi
done

echo $max_timestamp
