import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertStudySessionSchema,
  insertEventSchema,
  insertBookSchema,
  insertNoteSchema,
  insertFlashcardDeckSchema,
  insertFlashcardSchema,
  insertSettingsSchema,
} from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { format } from "date-fns";

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    
    req.user = user;
    next();
  });
};

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const router = express.Router();
  
  // Authentication routes
  router.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Create default settings
      await storage.createSettings({
        userId: user.id,
        pomodoroFocusMinutes: 25,
        pomodoroShortBreakMinutes: 5,
        pomodoroLongBreakMinutes: 15,
        pomodoroLongBreakInterval: 4,
        dailyGoalHours: 4,
        weeklyGoalHours: 20,
        theme: "light",
        notifications: {},
      });
      
      // Generate token
      const token = generateToken(user.id);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }).parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Generate token
      const token = generateToken(user.id);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/auth/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Tasks routes
  router.post("/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const tasks = await storage.getUserTasks(userId);
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.get("/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if task belongs to user
      if (task.userId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden: Task doesn't belong to user" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.put("/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if task belongs to user
      if (task.userId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden: Task doesn't belong to user" });
      }
      
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.delete("/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if task belongs to user
      if (task.userId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden: Task doesn't belong to user" });
      }
      
      await storage.deleteTask(taskId);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Study sessions routes
  router.post("/study-sessions", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const sessionData = insertStudySessionSchema.parse({ ...req.body, userId });
      
      const session = await storage.createStudySession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/study-sessions", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const sessions = await storage.getUserStudySessions(userId);
      
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.get("/study-sessions/stats", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const sessions = await storage.getUserStudySessions(userId);
      
      // Calculate total study time (in hours)
      const totalHours = sessions.reduce((total, session) => {
        if (session.duration) {
          return total + (session.duration / 60);
        }
        return total;
      }, 0);
      
      // Get total tasks completed
      const tasks = await storage.getUserTasks(userId);
      const completedTasks = tasks.filter(task => task.completed).length;
      
      // Calculate focus score (just a sample calculation)
      const focusScore = Math.min(100, Math.round((totalHours / 20) * 100));
      
      // Calculate streak (placeholder)
      const streak = 7;
      
      res.json({
        studyHours: totalHours.toFixed(1),
        tasksCompleted: completedTasks,
        focusScore: `${focusScore}%`,
        streak: `${streak} days`,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Events routes
  router.post("/events", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const eventData = insertEventSchema.parse({ ...req.body, userId });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/events", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const events = await storage.getUserEvents(userId);
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Books routes
  router.post("/books", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const bookData = insertBookSchema.parse({ ...req.body, userId });
      
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/books", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const books = await storage.getUserBooks(userId);
      
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Notes routes
  router.post("/notes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const noteData = insertNoteSchema.parse({ ...req.body, userId });
      
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/notes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const notes = await storage.getUserNotes(userId);
      
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Flashcard decks routes
  router.post("/flashcard-decks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const deckData = insertFlashcardDeckSchema.parse({ ...req.body, userId });
      
      const deck = await storage.createFlashcardDeck(deckData);
      res.status(201).json(deck);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/flashcard-decks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      const decks = await storage.getUserFlashcardDecks(userId);
      
      res.json(decks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Flashcards routes
  router.post("/flashcards", authenticateToken, async (req: Request, res: Response) => {
    try {
      const flashcardData = insertFlashcardSchema.parse(req.body);
      
      // Verify deck exists and belongs to user
      const deck = await storage.getFlashcardDeck(flashcardData.deckId);
      if (!deck || deck.userId !== req.user.userId) {
        return res.status(403).json({ message: "Deck not found or doesn't belong to user" });
      }
      
      const flashcard = await storage.createFlashcard(flashcardData);
      res.status(201).json(flashcard);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  router.get("/flashcards/:deckId", authenticateToken, async (req: Request, res: Response) => {
    try {
      const deckId = parseInt(req.params.deckId);
      
      // Verify deck exists and belongs to user
      const deck = await storage.getFlashcardDeck(deckId);
      if (!deck || deck.userId !== req.user.userId) {
        return res.status(403).json({ message: "Deck not found or doesn't belong to user" });
      }
      
      const flashcards = await storage.getDeckFlashcards(deckId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Settings routes
  router.get("/settings", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      let settings = await storage.getSettings(userId);
      
      if (!settings) {
        // Create default settings if not exists
        settings = await storage.createSettings({
          userId,
          pomodoroFocusMinutes: 25,
          pomodoroShortBreakMinutes: 5,
          pomodoroLongBreakMinutes: 15,
          pomodoroLongBreakInterval: 4,
          dailyGoalHours: 4,
          weeklyGoalHours: 20,
          theme: "light",
          notifications: {},
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.put("/settings", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      
      // Check if settings exist
      let settings = await storage.getSettings(userId);
      
      if (!settings) {
        // Create settings if not exists
        settings = await storage.createSettings({
          userId,
          ...req.body,
        });
      } else {
        // Update existing settings
        settings = await storage.updateSettings(userId, req.body);
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Activity feed route (recent activities)
  router.get("/activity", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;
      
      // Get recent items for activity feed
      const recentSessions = await storage.getUserStudySessions(userId);
      const recentTasks = await storage.getUserTasks(userId);
      const recentNotes = await storage.getUserNotes(userId);
      
      // Format activities
      const activities = [
        ...recentSessions.map(session => ({
          type: 'study-session',
          icon: 'stopwatch',
          title: `Study Session`,
          subtitle: `${session.subject || 'General'} study session for ${session.duration ? `${session.duration} minutes` : 'N/A'}`,
          timestamp: session.startTime,
        })),
        ...recentTasks.filter(task => task.completed).map(task => ({
          type: 'task-completed',
          icon: 'tasks',
          title: 'Task Completed',
          subtitle: task.title,
          timestamp: task.createdAt,
        })),
        ...recentNotes.map(note => ({
          type: 'note',
          icon: 'sticky-note',
          title: 'New Note',
          subtitle: `Created "${note.title}" note`,
          timestamp: note.createdAt,
        })),
      ];
      
      // Sort by timestamp (descending)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Limit to 10 most recent activities
      const recentActivities = activities.slice(0, 10);
      
      res.json(recentActivities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Register the router
  app.use("/api", router);
  
  const httpServer = createServer(app);
  return httpServer;
}
