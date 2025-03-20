#!/bin/bash

# Keycloak configuration

# !!! KEYCLOAK_URL -  will differ from where you running the script: 

# if manually from the host machine, use localhost and keycloak external exposed port
# KEYCLOAK_URL="http://localhost:8081"

# if from docker-compose then need to use the service name and the port exposed in the service
# Refer to docker-compose.yml file for the service name and port
KEYCLOAK_URL="http://memcrypt_keycloak:8080"
KEYCLOAK_FRONTEND_URL="http://localhost:8081"
APP_FRONTEND_URL="http://localhost:3000"
CONSOLE_API_URL="http://localhost:8001"
# Location within the docker container keycloak_setup
# ENV_FILE="/opt/shared_config/config.sh"

# Keycloak configuration
REALM_NAME="$KEYCLOAK_REALM"
ADMIN_USERNAME="$KEYCLOAK_ADMIN"
ADMIN_PASSWORD="$KEYCLOAK_ADMIN_PASSWORD"

# app configuration
FRONTEND_CLIENT_ID="$KEYCLOAK_REALM-frontend"
BACKEND_CLIENT_ID="$KEYCLOAK_REALM-backend"

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

# Function to create realm
create_realm() {
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "realm": "'"${REALM_NAME}"'",
        "enabled": true,
        "displayName": "'"${REALM_NAME}"'",
        "organizationsEnabled": true,
        "attributes": {
            "frontendUrl": "'"${KEYCLOAK_FRONTEND_URL}"'"
        }
    }')
    echo "Realm creation response: ${response}"
}

# Function to create a role
create_role() {
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name":"'$1'"}'
    echo "Created role: $1"
}

# Function to create frontend client
create_frontend_client() {
    local CLIENT_ID="$1"
    local REDIRECT_URI_1="$2"
    local REDIRECT_URI_2="$3"
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "'"${CLIENT_ID}"'",
        "enabled": true,
        "publicClient": true,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "redirectUris": ["'"${REDIRECT_URI_1}"'", "'"${REDIRECT_URI_2}"'"],
        "webOrigins": ["+"],
        "protocol": "openid-connect",
        "attributes": {
            "pkce.code.challenge.method": "S256"
        }
    }')
    echo "Frontend client creation response: ${response}"
}

# Function to create backend client
create_backend_client() {
    local CLIENT_ID="$1"

    # Create the client
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "'"${CLIENT_ID}"'",
        "enabled": true,
        "bearerOnly": false,
        "publicClient": false,
        "standardFlowEnabled": false,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": false,
        "serviceAccountsEnabled": true,
        "authorizationServicesEnabled": false,
        "protocol": "openid-connect"
    }')
    echo "Backend client creation response: ${response}"

    # Get the client ID
    CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    | jq -r '.[] | select(.clientId == "'"${CLIENT_ID}"'") | .id')

    echo "Client UUID: ${CLIENT_UUID}"

    # Get the service account user ID
    SERVICE_ACCOUNT_USER_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}/service-account-user" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    | jq -r '.id')

    echo "Service Account User ID: ${SERVICE_ACCOUNT_USER_ID}"

    # Get realm-management client ID
    REALM_MANAGEMENT_CLIENT_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    | jq -r '.[] | select(.clientId == "realm-management") | .id')

    echo "Realm Management Client ID: ${REALM_MANAGEMENT_CLIENT_ID}"

    # Define the roles we want to assign
    ROLES=("create-client" "view-clients" "manage-clients" "view-users" "manage-users" "view-realm" "manage-realm")

    # Assign roles to the service account
    for ROLE in "${ROLES[@]}"; do
        ROLE_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${REALM_MANAGEMENT_CLIENT_ID}/roles" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        | jq -r '.[] | select(.name == "'"${ROLE}"'") | .id')

        echo "Assigning role ${ROLE} (ID: ${ROLE_ID}) to service account"

        curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/${SERVICE_ACCOUNT_USER_ID}/role-mappings/clients/${REALM_MANAGEMENT_CLIENT_ID}" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d '[{
            "id": "'"${ROLE_ID}"'",
            "name": "'"${ROLE}"'"
        }]'
    done

    echo "Roles assigned successfully"

    # Get and display client secret
    CLIENT_SECRET=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}/client-secret" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    | jq -r '.value')

    # echo "Client Secret for ${CLIENT_ID}: ${CLIENT_SECRET}"
    # # Export the new client secret as an environment variable
    
    # # Replace the KEYCLOAK_BACKEND_CLIENT_SECRET with the new secret
    # if grep -q "^KEYCLOAK_BACKEND_CLIENT_SECRET=" "$ENV_FILE"; then
    # sed -i '' "s/^KEYCLOAK_BACKEND_CLIENT_SECRET=.*/KEYCLOAK_BACKEND_CLIENT_SECRET=$CLIENT_SECRET/" "$ENV_FILE"
    # else
    # echo "export KEYCLOAK_BACKEND_CLIENT_SECRET=$CLIENT_SECRET" > "$ENV_FILE"
    # fi 
}

# Function to create platformadmin user
create_platformadmin_user() {
    local USERNAME="$1"
    local PASSWORD="$2"
    local EMAIL="$3"

    # Create user
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "'"${USERNAME}"'",
        "enabled": true,
        "emailVerified": true,
        "email": "'"${EMAIL}"'",
        "credentials": [{
            "type": "password",
            "value": "'"${PASSWORD}"'",
            "temporary": false
        }]
    }')
    echo "User creation response: ${response}"

    # Get user ID
    USER_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users?username=${USERNAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" | jq -r '.[0].id')

      ROLE_INFO=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles/PLATFORM_ADMIN" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" | jq 'del(.attributes)')

    echo "Role info: ${ROLE_INFO}"

    # Assign SUPER_ADMIN role
    ASSIGN_ROLE_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/${USER_ID}/role-mappings/realm" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "[$ROLE_INFO]")

    echo "platformadmin user created and role assigned: ${USERNAME}"
}

# Function to create a client scope
create_client_scope() {
    local SCOPE_NAME="$1"
    local DESCRIPTION="$2"
    local SCOPE_TYPE="$3"

    echo "Creating client scope: $SCOPE_NAME" >&2

    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "'"${SCOPE_NAME}"'",
        "description": "'"${DESCRIPTION}"'",
        "type": "'"${SCOPE_TYPE}"'",
        "protocol": "openid-connect",
        "attributes": {
            "display.on.consent.screen": "true",
            "consent.screen.text": "",
            "include.in.token.scope": "false",
            "gui.order": ""
        }
    }')

    # Check if response is empty (which indicates success)
    if [ -z "$response" ]; then
        echo "Client scope created successfully" >&2
    elif echo "$response" | jq -e . >/dev/null 2>&1; then
        # Valid JSON response
        if echo "$response" | jq -e '.error' >/dev/null 2>&1; then
            echo "Failed to create client scope. Error: $(echo "$response" | jq -r '.error')" >&2
            return 1
        fi
    else
        echo "Unexpected response: $response" >&2
        return 1
    fi

    # Get the ID of the created scope
    sleep 2  # Add a small delay to ensure the scope is created before we fetch it
    SCOPE_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" | jq -r ".[] | select(.name == \"${SCOPE_NAME}\") | .id")

    if [ -z "$SCOPE_ID" ]; then
        echo "Failed to retrieve the ID of the created client scope" >&2
        return 1
    fi

    echo "$SCOPE_ID"
}

# Function to add a protocol mapper to a client scope
add_protocol_mapper() {
    local SCOPE_ID="$1"
    local MAPPER_NAME="$2"
    local USER_ATTRIBUTE="$3"

    echo "Adding protocol mapper to scope ID: $SCOPE_ID" >&2

    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes/${SCOPE_ID}/protocol-mappers/models" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "protocol": "openid-connect",
        "protocolMapper": "oidc-usermodel-attribute-mapper",
        "name": "'"${MAPPER_NAME}"'",
        "config": {
            "claim.name": "'"${MAPPER_NAME}"'",
            "jsonType.label": "String",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true",
            "introspection.token.claim": "true",
            "user.attribute": "'"${USER_ATTRIBUTE}"'",
            "lightweight.claim": "false"
        }
    }')

    if [ -z "$response" ]; then
        echo "Protocol mapper created successfully" >&2
    else
        echo "Protocol mapper creation response: ${response}" >&2
        # You might want to add more error handling here if needed
    fi
}

# Function to assign a client scope to a client
assign_client_scope() {
    local CLIENT_ID="$1"
    local SCOPE_ID="$2"

    echo "Assigning client scope $SCOPE_ID to client $CLIENT_ID" >&2

    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_ID}/default-client-scopes/${SCOPE_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")

    if [ -z "$response" ]; then
        echo "Client scope assigned successfully" >&2
    else
        echo "Client scope assignment response: ${response}" >&2
        # You might want to add more error handling here if needed
    fi
}

# Function to get client ID by client name
get_client_id() {
    local CLIENT_NAME="$1"
    response=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_NAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")

    CLIENT_ID=$(echo "$response" | jq -r '.[0].id // empty')

    if [ -z "$CLIENT_ID" ]; then
        echo "Failed to get client ID for $CLIENT_NAME" >&2
        return 1
    fi

    echo "$CLIENT_ID"
}

# Function to update login theme
update_login_theme() {
    local THEME_NAME="$1"

    echo "Updating login theme to $THEME_NAME" >&2

    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "loginTheme": "'"${THEME_NAME}"'"
    }')

    if [ -z "$response" ]; then
        echo "Login theme updated successfully" >&2
    else
        echo "Login theme update response: ${response}" >&2
        # You might want to add more error handling here if needed
    fi
}

# Main function to set up a client scope and assign it to a client
setup_client_scope() {
    local SCOPE_NAME="$1"
    local DESCRIPTION="$2"
    local SCOPE_TYPE="$3"
    local USER_ATTRIBUTE="$4"
    local CLIENT_NAME="$5"

    # Create client scope
    SCOPE_ID=$(create_client_scope "$SCOPE_NAME" "$DESCRIPTION" "$SCOPE_TYPE")
    if [ $? -ne 0 ]; then
        echo "Failed to create client scope"
        return 1
    fi
    echo "Created client scope with ID: $SCOPE_ID"

    # Add protocol mapper
    add_protocol_mapper "$SCOPE_ID" "$SCOPE_NAME" "$USER_ATTRIBUTE"

    # Get client ID
    CLIENT_ID=$(get_client_id "$CLIENT_NAME")
    if [ $? -ne 0 ]; then
        echo "Failed to get client ID for $CLIENT_NAME"
        return 1
    fi
    echo "Found client ID: $CLIENT_ID"

    # Assign client scope to client
    assign_client_scope "$CLIENT_ID" "$SCOPE_ID"
}

setup_user_profile() {
    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/profile" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
            "attributes": [
                {
                    "name": "username",
                    "displayName": "${username}",
                    "validations": {
                        "length": {
                            "min": 3,
                            "max": 255
                        },
                        "username-prohibited-characters": {},
                        "up-username-not-idn-homograph": {}
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "email",
                    "displayName": "${email}",
                    "validations": {
                        "email": {},
                        "length": {
                            "max": 255
                        }
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "firstName",
                    "displayName": "${firstName}",
                    "validations": {
                        "length": {
                            "max": 255
                        },
                        "person-name-prohibited-characters": {}
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "lastName",
                    "displayName": "${lastName}",
                    "validations": {
                        "length": {
                            "max": 255
                        },
                        "person-name-prohibited-characters": {}
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "status",
                    "displayName": "Status",
                    "permissions": {
                        "edit": [
                            "admin",
                            "user"
                        ],
                        "view": [
                            "user",
                            "admin"
                        ]
                    },
                    "multivalued": false,
                    "annotations": {
                        "inputType": "select"
                    },
                    "validations": {
                        "options": {
                            "options": [
                                "pending",
                                "approved",
                                "rejected"
                            ]
                        }
                    }
                },
                {
                    "name": "verificationToken",
                    "displayName": "${verificationToken}",
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                }
            ],
            "groups": [
                {
                    "name": "user-metadata",
                    "displayHeader": "User metadata",
                    "displayDescription": "Attributes, which refer to user metadata"
                }
            ]
        }')
    echo "User Profile setup response: ${response}"
}

# Function to disable Organization step in browser flow
disable_organization_step() {
    echo "Disabling Organization Identity-First Login in authentication flow"

    # Get the executions of the Organization flow
    EXECUTIONS=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows/Organization/executions" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")

    echo "Raw EXECUTIONS response:"
    echo "$EXECUTIONS"

    # Check if we received an error
    if echo "$EXECUTIONS" | jq -e '.error' > /dev/null; then
        echo "Error retrieving executions: $(echo "$EXECUTIONS" | jq -r '.error_description')"
        return 1
    fi

    # Find the "Organization Identity-First Login" execution
    ORG_EXECUTION=$(echo "$EXECUTIONS" | jq -r '.[] | select(.displayName == "Organization Identity-First Login")')

    if [ -z "$ORG_EXECUTION" ]; then
        echo "Failed to find Organization Identity-First Login execution"
        return 1
    fi

    EXECUTION_ID=$(echo "$ORG_EXECUTION" | jq -r '.id')
    echo "Execution ID to disable: $EXECUTION_ID"

    # Prepare the update data
    UPDATE_DATA=$(echo "$ORG_EXECUTION" | jq '. + {requirement: "DISABLED"}')
    
    echo "UPDATE_DATA:"
    echo "$UPDATE_DATA"

    # Update the execution to be disabled
    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/authentication/flows/Organization/executions" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")

    echo "Update response:"
    echo "$response"

    if [ -z "$response" ]; then
        echo "Organization Identity-First Login step disabled successfully"
    else
        echo "Failed to disable Organization Identity-First Login step. Response: $response"
        return 1
    fi
}
# Main execution
case "$1" in
    realm)
        create_realm
        ;;
     roles)
        create_role "PLATFORM_ADMIN"
        create_role "ORG_ADMIN"
        ;;
    frontend)
        create_frontend_client $FRONTEND_CLIENT_ID "$APP_FRONTEND_URL/*" "https://oauth.pstmn.io/*"
        ;;
    backend)
        create_backend_client $BACKEND_CLIENT_ID
        ;;
    platformadmin)
        create_platformadmin_user "platformadmin" "platformadmin123" "platformadmin@example.com"
        ;;
    userprofile)
        setup_user_profile
        ;;
    clientscope)
        setup_client_scope "org_id" "Organization ID scope" "Default" "kc.org" $FRONTEND_CLIENT_ID
        ;;
    logintheme)
        update_login_theme "memcrypt"
        ;;
     disableorg)
        disable_organization_step
        ;;
    all)
        create_realm
        create_role "PLATFORM_ADMIN"
        create_role "ORG_ADMIN"
        create_frontend_client $FRONTEND_CLIENT_ID "$APP_FRONTEND_URL/*" "https://oauth.pstmn.io/*" "$CONSOLE_API_URL/*"
        create_backend_client $BACKEND_CLIENT_ID
        create_platformadmin_user "platformadmin" "platformadmin123" "platformadmin@example.com"
        setup_user_profile
        setup_client_scope "org_id" "Organization ID scope" "Default" "kc.org" $FRONTEND_CLIENT_ID
        update_login_theme "memcrypt"
        disable_organization_step
        ;;
    *)
        echo "Usage: $0 {realm|frontend|backend|platformadmin|userprofile|clientscope|logintheme|disableorg|all}"
        exit 1
        ;;
esac
echo "Setup complete."

