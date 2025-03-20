# Memcrypt SaaS Controlplane Frontend

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), integrated with Keycloak for authentication and authorization.

## Getting Started

### Environment Setup

Before starting the development server, ensure you have set up the necessary environment variables:

1. Copy the `.env.template` file to `.env.local`:

   ```bash
   cp .env.template .env.local
   ```

2. Update the `.env.local` file with the correct Keycloak configuration:

   ```
   # Keycloak backend / confidential client

   FE_KEYCLOAK_URL=https://your-keycloak-url
   FE_KEYCLOAK_REALM=memcrypt
   FE_KEYCLOAK_BACKEND_CLIENT_ID=admin-cli
   FE_KEYCLOAK_BACKEND_CLIENT_SECRET=your-admin-client-secret

   # Keycloak frontend / public client

   NEXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-url
   NEXT_PUBLIC_APP_REALM=memcrypt
   NEXT_PUBLIC_KEYCLOAK_CLIENT_ID0=memcrypt-frontend
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url/api

   ```

   Replace `<memcrypt-backend-client-secret>` with the actual secret of the `memcrypt-backend` client from Keycloak.

3. Update the `.env.local` file with the correct Agent binary API URL:

   ```
   NEXT_PUBLIC_AGENT_BINARY_API_URL=https://your-agent-binary-api-url

   ```

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Keycloak Integration

This project uses Keycloak for authentication and authorization. The Keycloak server should be set up and running before starting the frontend application. Key points to note:

- The frontend uses the `memcrypt-frontend` client for user authentication.
- The `memcrypt-backend` client secret is used for backend-to-Keycloak communication (e.g., user management operations).
- Ensure the Keycloak server is accessible at the URL specified in your environment variables.

If you encounter authentication issues:

1. Verify that Keycloak is running and accessible.
2. Check that the client IDs and secrets in your `.env.local` file are correct.
3. Ensure the Keycloak realm and clients are properly configured.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

For Keycloak integration:

- [Keycloak Documentation](https://www.keycloak.org/documentation) - learn about Keycloak features and configuration.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
