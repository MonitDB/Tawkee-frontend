interface EnvConfig {
  SOCKET_SERVER_URL: string;
  API_URL: string;
  AUTH_TIMEOUT: number;
  ENABLE_ANALYTICS: boolean;
  TEMPLATE_IMAGE_URL: string;
}

// Parse environment variables with proper type conversion
export const env: EnvConfig = {
  SOCKET_SERVER_URL: import.meta.env.VITE_SOCKET_SERVER_URL as string,
  API_URL: import.meta.env.VITE_API_URL as string,
  AUTH_TIMEOUT: Number(import.meta.env.VITE_AUTH_TIMEOUT || 3600),
  ENABLE_ANALYTICS:
    (import.meta.env.VITE_ENABLE_ANALYTICS || 'false') === 'true',
  TEMPLATE_IMAGE_URL: 'https://mui.com',
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars = ['API_URL'];
  const missingVars = requiredVars.filter(
    (key) => !env[key as keyof EnvConfig]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Call validation in development mode
if (import.meta.env.DEV) {
  validateEnv();
}

export default env;
