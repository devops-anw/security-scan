#!/bin/bash

# Keycloak configuration
KEYCLOAK_URL="http://localhost:8081"
REALM_NAME="memcrypt"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"

# Function to get access token
get_access_token() {
    curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${ADMIN_USERNAME}" \
    -d "password=${ADMIN_PASSWORD}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token'
}

# Get access token
TOKEN=$(get_access_token)

# Function to duplicate and update browser flow
duplicate_and_update_browser_flow() {
    # Duplicate the current browser flow
    BROWSER_FLOW=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows/browser/copy" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "newName": "memcrypt-browser"
    }')

    # Check if the flow was duplicated successfully
    if [[ "$BROWSER_FLOW" == *"error"* ]]; then
        echo "Failed to duplicate the browser flow: $BROWSER_FLOW" >&2
        return 1
    fi

    # Get the executions of the new flow
    EXECUTIONS=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows/memcrypt-browser/executions" \
    -H "Authorization: Bearer ${TOKEN}")

    # Update the executions to change forms from ALTERNATE to REQUIRED
    echo "$EXECUTIONS" | jq -c '.[]' | while read -r EXECUTION; do
        EXECUTION_ID=$(echo "$EXECUTION" | jq -r '.id')
        REQUIREMENT=$(echo "$EXECUTION" | jq -r '.requirement')

        if [ "$REQUIREMENT" == "ALTERNATIVE" ]; then
            UPDATED_EXECUTION=$(echo "$EXECUTION" | jq '.requirement = "REQUIRED"')
            curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows/memcrypt-browser/executions" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$UPDATED_EXECUTION"
        fi
    done

    # Bind the new flow to the realm
    RESPONSE=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "browserFlow": "memcrypt-browser"
    }')

    if [[ "$RESPONSE" == *"error"* ]]; then
        echo "Failed to update realm: $RESPONSE" >&2
        return 1
    fi

    echo "Browser flow duplicated and updated successfully"
}

# Main execution
duplicate_and_update_browser_flow