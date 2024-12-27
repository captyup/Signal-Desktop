#!/bin/bash

SIGANAL_DIR="$HOME/Library/Application Support/Signal"
SIGANAL_DEV_DIR="$HOME/Library/Application Support/Signal-development"
if [ -d "$SIGANAL_DIR" ]; then
  if [ -d "$SIGANAL_DEV_DIR" ]; then
    echo "Signal development directory already exists, removing"
    rm -rf "$SIGANAL_DEV_DIR"
  fi
    echo "Creating Signal development directory"
    cp -R "$SIGANAL_DIR" "$SIGANAL_DEV_DIR"
else
  echo "Signal directory does not exist"
fi
