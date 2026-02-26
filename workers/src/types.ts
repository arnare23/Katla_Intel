export type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  TURNSTILE_SECRET_KEY: string;
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
