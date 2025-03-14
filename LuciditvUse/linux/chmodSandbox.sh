#!/bin/bash

target="$HOME/Signal-Desktop/node_modules/electron/dist/chrome-sandbox"

if [ -f "$target" ]; then
  sudo chown root:root "$target"
  sudo chmod 4775 "$target"
fi
