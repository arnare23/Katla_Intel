export type Bindings = {
  DB: D1Database;
  ASSETS: R2Bucket;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
};

export type Variables = {
  user: {
    sub: string;
    email: string;
  };
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
