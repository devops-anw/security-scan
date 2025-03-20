import { jwtVerify, createRemoteJWKSet, decodeProtectedHeader } from 'jose';
import logger from "./src/utils/logger.js";

async function manualVerification() {
    const JWKS_URI = 'http://localhost:8081/realms/memcrypt/protocol/openid-connect/certs';
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJIZ2JaMDVacmlaTnA1MHRnMVozZmZtWUUtZGVudUxXT1lSZXVHVXhzVXl3In0.eyJleHAiOjE3MjQyMzQ2MDUsImlhdCI6MTcyNDIzNDMwNSwiYXV0aF90aW1lIjoxNzI0MjMzMjYyLCJqdGkiOiIyYTE4NzE5ZC02MzM4LTQzYjMtOTYxNi0yZDgxNjk4ZTkyZDUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODEvcmVhbG1zL21lbWNyeXB0IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6Ijk3NmMzZTU2LTBiNTUtNGIxMy04NjI2LWI4MmUzZDhkNDM5MSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1lbWNyeXB0LWZyb250ZW5kIiwic2lkIjoiNWRlNmZlMjgtNmNkNy00MTQ0LThmYTgtNGY4YzRiZDU2ZTY2IiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL29hdXRoLnBzdG1uLmlvIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1lbWNyeXB0Iiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicHJlZmVycmVkX3VzZXJuYW1lIjoic3VwZXJhZG1pbiIsImVtYWlsIjoic3VwZXJhZG1pbkBleGFtcGxlLmNvbSJ9.DhWHteB4okH4EkcC5b-Ljc1tiD3RA0PvfGjR3NOWvmy-Y5S7SjgptJk5MW6AVSHmNYMFFIj2loZmS52-RaKEzdjUGcRgQgBpQ5y3trsIxFq8M1kxhEtB0MU1H4OesNEqTA5yzB_VtMwSPFHWwqlUPaWrn0BFY88IjH-8DgBUN8UN9fM8OoHqwEEdtRbI-eenKXKNA8HundYfRl3ZejHwLEJKU1pyHgrVXwj6IZ2CkFoVVvYU7oSHeh8RAK5huwYpF-jubfHTHOpZcm3cgg3_iZz83UavaISLnGxoUUF-9Xe17TM6w_M79h7mnXDxkW7FjSxWykgFl2BGoonTjvSnXQ';

    try {
        logger.log('Fetching JWKS...');
        const response = await fetch(JWKS_URI);
        const jwks = await response.json();
        logger.log('JWKS:', jwks);

        const header = decodeProtectedHeader(token);
        logger.log('Token header:', header);

        const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

        const { payload } = await jwtVerify(token, JWKS);
        logger.log('Token verified successfully');
        logger.log('Payload:', payload);
    } catch (error) {
        logger.error('Verification failed:', error);
    }
}

manualVerification();