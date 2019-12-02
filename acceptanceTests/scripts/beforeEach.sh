#!/usr/bin/env bash

set -e
echo beforeEach
#Delete the database files.
FILE=exchangebay.db
if test -f "$FILE"; then
    rm -rf "$FILE"
fi