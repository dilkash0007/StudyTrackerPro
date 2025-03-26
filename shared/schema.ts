import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  googleId: text("google_id"),
  fullName: text("full_name"),
  profilePicture: text("profile_picture"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  googleId: true,
  fullName: true,
  profilePicture: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  completed: true,
  priority: true,
  subject: true,
});

// Study sessions table
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  subject: text("subject"),
  notes: text("notes"),
  taskId: integer("task_id").references(() => tasks.id),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  startTime: true,
  endTime: true,
  duration: true,
  subject: true,
  notes: true,
  taskId: true,
});

// Events/Calendar table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  color: text("color").default("#4F46E5"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  color: true,
});

// Books/PDFs table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  author: text("author"),
  url: text("url"),
  category: text("category"),
  lastRead: timestamp("last_read"),
  currentPage: integer("current_page").default(0),
  totalPages: integer("total_pages"),
  notes: text("notes"),
});

export const insertBookSchema = createInsertSchema(books).pick({
  userId: true,
  title: true,
  author: true,
  url: true,
  category: true,
  lastRead: true,
  currentPage: true,
  totalPages: true,
  notes: true,
});

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  title: true,
  content: true,
  subject: true,
});

// Flashcards table
export const flashcardDecks = pgTable("flashcard_decks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFlashcardDeckSchema = createInsertSchema(flashcardDecks).pick({
  userId: true,
  title: true,
  description: true,
  subject: true,
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").notNull().references(() => flashcardDecks.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review"),
  mastery: integer("mastery").default(0),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  deckId: true,
  question: true,
  answer: true,
  lastReviewed: true,
  nextReview: true,
  mastery: true,
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  pomodoroFocusMinutes: integer("pomodoro_focus_minutes").default(25),
  pomodoroShortBreakMinutes: integer("pomodoro_short_break_minutes").default(5),
  pomodoroLongBreakMinutes: integer("pomodoro_long_break_minutes").default(15),
  pomodoroLongBreakInterval: integer("pomodoro_long_break_interval").default(4),
  dailyGoalHours: integer("daily_goal_hours").default(4),
  weeklyGoalHours: integer("weekly_goal_hours").default(20),
  theme: text("theme").default("light"),
  notifications: jsonb("notifications").default({}),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  pomodoroFocusMinutes: true,
  pomodoroShortBreakMinutes: true,
  pomodoroLongBreakMinutes: true,
  pomodoroLongBreakInterval: true,
  dailyGoalHours: true,
  weeklyGoalHours: true,
  theme: true,
  notifications: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type FlashcardDeck = typeof flashcardDecks.$inferSelect;
export type InsertFlashcardDeck = z.infer<typeof insertFlashcardDeckSchema>;

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
