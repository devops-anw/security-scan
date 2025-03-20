FROM alpine:latest
WORKDIR /keycloak
RUN apk add --no-cache bash
COPY ./themes /keycloak
COPY ./scripts/keycloak_memcrypt_theme.sh /keycloak/keycloak_memcrypt_theme.sh
RUN chmod +x /keycloak/keycloak_memcrypt_theme.sh


ENTRYPOINT ["/bin/bash", "/keycloak/keycloak_memcrypt_theme.sh"]
