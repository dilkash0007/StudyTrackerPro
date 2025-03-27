import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes";

const app = express();
const port = process.env.PORT || 3000;

// Define __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets
app.use(express.static(path.resolve(__dirname, "../dist/public")));

// API routes
app.use("/api", routes);

// Handle client-side routing by returning the index.html for all other requests
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../dist/public/index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
