#!/usr/bin/env bash

set -e
echo beforeAllUnitTest

#Make backups of the databases.
FILE="exchangebay-unittests.db"
if test -f "$FILE"; then
    cp "$FILE" "$FILE.bkp"
    rm -rf "$FILE"
fi