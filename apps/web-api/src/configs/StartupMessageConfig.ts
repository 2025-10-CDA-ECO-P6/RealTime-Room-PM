export interface StartupMessageConfig {
  port: number;
  nodeEnv: string;
  socketIoPath: string;
  cors: {
    origin: string[];
    methods: string[];
  };
}
