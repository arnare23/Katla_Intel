export type Bindings = {
  DB: D1Database;
  CORS_ORIGIN: string;
  TURNSTILE_SECRET_KEY: string;
};

export type AppEnv = {
  Bindings: Bindings;
};
