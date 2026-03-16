import express from "express";
import { checkApplication } from "@repo/backend-application";

const app = express();


app.get("/", (_req, res) => {
  const result = checkApplication();
  console.log("Check result:", result);
  res.send(`Check finished: ${result}`);
});

export default app;