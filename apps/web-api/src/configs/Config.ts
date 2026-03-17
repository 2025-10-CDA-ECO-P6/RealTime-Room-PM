import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production" | "test";

interface Config {
  port: number;
  nodeEnv: NodeEnv;
  socketIoPath: string;
  cors: {
    origin: string[];
    methods: string[];
  };
}

function getConfig(): Config {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);

  if (Number.isNaN(port)) {
    throw new TypeError("PORT must be a valid number");
  }

  const nodeEnv = (process.env.NODE_ENV ?? "development") as NodeEnv;

  return {
    port,
    nodeEnv,
    socketIoPath: "/socket.io",
    cors: {
      origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
  };
}

const config = getConfig();

export default config;
