import axios from "axios";

// Access the environment variable with the correct prefix
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined in the environment variables."
  );
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiAgentBinary = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AGENT_BINARY_API_URL,
});

export const apiConsole = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CONSOLE_API_URL,
});
