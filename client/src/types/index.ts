// User types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
}

// Task types
export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  subject?: string;
  createdAt: Date;
}

export type CreateTaskInput = Omit<Task, "id" | "userId" | "createdAt">;
export type UpdateTaskInput = Partial<Omit<Task, "id" | "userId" | "createdAt">>;

// Study session types
export interface StudySession {
  id: number;
  userId: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  subject?: string;
  notes?: string;
  taskId?: number;
}

export type CreateStudySessionInput = Omit<StudySession, "id" | "userId">;

// Event types
export interface Event {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color?: string;
}

export type CreateEventInput = Omit<Event, "id" | "userId">;
export type UpdateEventInput = Partial<Omit<Event, "id" | "userId">>;

// Book types
export interface Book {
  id: number;
  userId: number;
  title: string;
  author?: string;
  url?: string;
  category?: string;
  lastRead?: Date;
  currentPage?: number;
  totalPages?: number;
  notes?: string;
}

export type CreateBookInput = Omit<Book, "id" | "userId">;
export type UpdateBookInput = Partial<Omit<Book, "id" | "userId">>;

// Note types
export interface Note {
  id: number;
  userId: number;
  title: string;
  content?: string;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateNoteInput = Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateNoteInput = Partial<Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">>;

// Flashcard types
export interface FlashcardDeck {
  id: number;
  userId: number;
  title: string;
  description?: string;
  subject?: string;
  createdAt: Date;
}

export type CreateFlashcardDeckInput = Omit<FlashcardDeck, "id" | "userId" | "createdAt">;
export type UpdateFlashcardDeckInput = Partial<Omit<FlashcardDeck, "id" | "userId" | "createdAt">>;

export interface Flashcard {
  id: number;
  deckId: number;
  question: string;
  answer: string;
  lastReviewed?: Date;
  nextReview?: Date;
  mastery?: number;
}

export type CreateFlashcardInput = Omit<Flashcard, "id">;
export type UpdateFlashcardInput = Partial<Omit<Flashcard, "id" | "deckId">>;

// Settings types
export interface Settings {
  id: number;
  userId: number;
  pomodoroFocusMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroLongBreakInterval: number;
  dailyGoalHours: number;
  weeklyGoalHours: number;
  theme: string;
  notifications: Record<string, any>;
}

export type UpdateSettingsInput = Partial<Omit<Settings, "id" | "userId">>;

// Stats types
export interface Stats {
  studyHours: string;
  tasksCompleted: number;
  focusScore: string;
  streak: string;
}

// Activity types
export interface Activity {
  type: string;
  icon: string;
  title: string;
  subtitle: string;
  timestamp: Date | string;
}
