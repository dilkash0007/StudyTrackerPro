import {
  User,
  Task,
  StudySession,
  Event,
  Book,
  Note,
  FlashcardDeck,
  Flashcard,
  Settings,
} from "@/types";

// Sample User
export const sampleUser: User = {
  id: 1,
  username: "user",
  email: "user@example.com",
  fullName: "",
  profilePicture: "",
};

// Sample Tasks - empty
export const sampleTasks: Task[] = [];

// Sample Study Sessions - empty
export const sampleStudySessions: StudySession[] = [];

// Sample Events - empty
export const sampleEvents: Event[] = [];

// Sample Books - empty
export const sampleBooks: Book[] = [];

// Sample Notes - empty
export const sampleNotes: Note[] = [];

// Sample Flashcard Decks - empty
export const sampleFlashcardDecks: FlashcardDeck[] = [];

// Sample Flashcards - empty
export const sampleFlashcards: Flashcard[] = [];

// Sample Settings
export const sampleSettings: Settings = {
  id: 1,
  userId: 1,
  pomodoroFocusMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroLongBreakInterval: 4,
  dailyGoalHours: 4,
  weeklyGoalHours: 20,
  theme: "system",
  notifications: {
    taskReminders: true,
    studySessionReminders: true,
    eventNotifications: true,
  },
};
