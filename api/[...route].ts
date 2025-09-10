import serverless from "serverless-http";
import { createServer } from "../server";

// Wrap the existing Express app as a Vercel serverless function
export default serverless(createServer());
