#!/bin/sh

set -ex

replace_var() {
    # $1 var name
    # $2 file name
    eval "value=\$$1"
    if [ -z "$value" ]; then
        echo "WARN: Undefined variable $1"
        sed -i "s,%$1%,,g" $2
    else
        echo "Setting variable $1"
        sed -i "s,%$1%,$value,g" $2
    fi
}

find /app/.next -type f -name "*.js" | while read filename; do
    replace_var NEXT_PUBLIC_KEYCLOAK_URL $filename
    replace_var NEXT_PUBLIC_APP_REALM $filename
    replace_var NEXT_PUBLIC_KEYCLOAK_CLIENT_ID $filename
    replace_var NEXT_PUBLIC_API_BASE_URL $filename
    replace_var NEXT_PUBLIC_BASE_URL $filename
    replace_var NEXT_PUBLIC_AGENT_BINARY_API_URL $filename
    replace_var NEXT_PUBLIC_CONSOLE_API_URL $filename
done

yarn start