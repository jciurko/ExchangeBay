#!/usr/bin/env bash

set -e
echo afterAll
#Delete the databases that were used for the acceptance testing.
FILE=exchangebay.db
if test -f "$FILE"; then
    rm -rf "$FILE"
fi
#Restore the databases from before the acceptance tests were run, and delete the backups.
FILE=exchangebay.db.bkp
if test -f "$FILE"; then
    cp "$FILE" exchangebay.db
    rm -rf "$FILE"
fi


