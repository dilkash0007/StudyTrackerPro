import express from "express";
import { storage } from "./storage";

const router = express.Router();

// Authentication routes
router.post("/auth/register", async (req, res) => {
  try {
    const userData = req.body;
    res.json({ message: "Registration endpoint" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    res.json({ message: "Login endpoint" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

export default router;
