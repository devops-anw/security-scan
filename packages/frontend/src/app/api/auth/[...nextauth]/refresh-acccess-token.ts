import axios from "axios";

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.FE_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/token`;

    // Send the request to refresh the access token
    const response = await axios.post(
      url,
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Required content type
        },
      }
    );

    // Extract the refreshed tokens from the response
    const refreshedTokens = response.data;

    // Return the updated token information with the new access token and optionally a new refresh token
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Keep the same refresh token if not provided
      expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in, // Calculate token expiry time
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

    // Return an error object in case token refreshing fails
    return {
      ...token,
      error: "RefreshAccessTokenError", // Custom error message
    };
  }
}
export default refreshAccessToken;
