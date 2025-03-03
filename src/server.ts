import { env } from "./env";
import { app } from "./app";

app
  .listen({
    port: env.PORT || 10000,

    
  })
  .then(() => {
    console.log("HTTP Server Running");
    console.log(`Example app listening on port ${env.PORT}`)
  });
