import { env } from "./env";
import { app } from "./app";

app
  .listen({
    port: env.PORT || 4000,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
