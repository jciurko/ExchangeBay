#!/usr/bin/env bash

set -e
echo beforeAll

#Make backups of the databases.
FILE=exchangebay.db
if test -f "$FILE"; then
    cp "$FILE" "$FILE.bkp"
    rm -rf "$FILE"
fi

