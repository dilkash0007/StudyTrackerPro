import {
  User,
  Task,
  StudySession,
  Event,
  Book,
  Note,
  FlashcardDeck,
  Flashcard,
  Settings
} from '@/types';

import {
  sampleUser,
  sampleTasks,
  sampleStudySessions,
  sampleEvents,
  sampleBooks,
  sampleNotes,
  sampleFlashcardDecks,
  sampleFlashcards,
  sampleSettings
} from './sampleData';

// Keys for localStorage
const KEYS = {
  USER: 'study_app_user',
  TASKS: 'study_app_tasks',
  STUDY_SESSIONS: 'study_app_study_sessions',
  EVENTS: 'study_app_events',
  BOOKS: 'study_app_books',
  NOTES: 'study_app_notes',
  FLASHCARD_DECKS: 'study_app_flashcard_decks',
  FLASHCARDS: 'study_app_flashcards',
  SETTINGS: 'study_app_settings',
  AUTH_TOKEN: 'study_app_auth_token'
};

// Initialize local storage with sample data if it doesn't exist
const initializeLocalStorage = () => {
  if (!localStorage.getItem(KEYS.USER)) {
    localStorage.setItem(KEYS.USER, JSON.stringify([sampleUser]));
  }
  
  if (!localStorage.getItem(KEYS.TASKS)) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(sampleTasks));
  }
  
  if (!localStorage.getItem(KEYS.STUDY_SESSIONS)) {
    localStorage.setItem(KEYS.STUDY_SESSIONS, JSON.stringify(sampleStudySessions));
  }
  
  if (!localStorage.getItem(KEYS.EVENTS)) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(sampleEvents));
  }
  
  if (!localStorage.getItem(KEYS.BOOKS)) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(sampleBooks));
  }
  
  if (!localStorage.getItem(KEYS.NOTES)) {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(sampleNotes));
  }
  
  if (!localStorage.getItem(KEYS.FLASHCARD_DECKS)) {
    localStorage.setItem(KEYS.FLASHCARD_DECKS, JSON.stringify(sampleFlashcardDecks));
  }
  
  if (!localStorage.getItem(KEYS.FLASHCARDS)) {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(sampleFlashcards));
  }
  
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify([sampleSettings]));
  }
  
  // Set a fake auth token for the sample user to auto-login
  if (!localStorage.getItem(KEYS.AUTH_TOKEN)) {
    localStorage.setItem(KEYS.AUTH_TOKEN, 'sample-auth-token-123');
  }
};

// Run initialization when the file is imported
initializeLocalStorage();

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) return defaultValue;
  try {
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`Error parsing localStorage item ${key}:`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Generate IDs for new items
const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Authentication
export const authService = {
  login: (email: string, password: string): Promise<{ user: User; token: string }> => {
    return new Promise((resolve, reject) => {
      const users = getItem<User[]>(KEYS.USER, []);
      const user = users.find(u => u.email === email);
      
      // In a real app, we'd check the password with bcrypt
      // For now, just check if user exists with that email
      if (user) {
        const token = `fake-token-${generateId()}`;
        setItem(KEYS.AUTH_TOKEN, token);
        resolve({ user, token });
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  },
  
  register: (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    return new Promise((resolve, reject) => {
      const users = getItem<User[]>(KEYS.USER, []);
      
      if (users.some(u => u.email === email)) {
        reject(new Error('Email already exists'));
        return;
      }
      
      if (users.some(u => u.username === username)) {
        reject(new Error('Username already exists'));
        return;
      }
      
      const newUser: User = {
        id: generateId(),
        username,
        email,
        fullName: '',
        profilePicture: ''
      };
      
      users.push(newUser);
      setItem(KEYS.USER, users);
      
      const token = `fake-token-${generateId()}`;
      setItem(KEYS.AUTH_TOKEN, token);
      
      resolve({ user: newUser, token });
    });
  },
  
  getUser: (): Promise<User | null> => {
    return new Promise((resolve) => {
      const token = localStorage.getItem(KEYS.AUTH_TOKEN);
      if (!token) {
        resolve(null);
        return;
      }
      
      const users = getItem<User[]>(KEYS.USER, []);
      // In a real app, we'd decode the token and get the user ID
      // For now, just return the first user
      resolve(users.length > 0 ? users[0] : null);
    });
  },
  
  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.removeItem(KEYS.AUTH_TOKEN);
      resolve();
    });
  }
};

// Task Service
export const taskService = {
  getTasks: (userId: number): Promise<Task[]> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(KEYS.TASKS, [])
        .filter(task => task.userId === userId);
      resolve(tasks);
    });
  },
  
  createTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>, userId: number): Promise<Task> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(KEYS.TASKS, []);
      const newTask: Task = {
        ...task,
        id: generateId(),
        userId,
        createdAt: new Date()
      };
      
      tasks.push(newTask);
      setItem(KEYS.TASKS, tasks);
      resolve(newTask);
    });
  },
  
  updateTask: (id: number, taskData: Partial<Task>): Promise<Task> => {
    return new Promise((resolve, reject) => {
      const tasks = getItem<Task[]>(KEYS.TASKS, []);
      const taskIndex = tasks.findIndex(t => t.id === id);
      
      if (taskIndex === -1) {
        reject(new Error('Task not found'));
        return;
      }
      
      const updatedTask = { ...tasks[taskIndex], ...taskData };
      tasks[taskIndex] = updatedTask;
      setItem(KEYS.TASKS, tasks);
      resolve(updatedTask);
    });
  },
  
  deleteTask: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const tasks = getItem<Task[]>(KEYS.TASKS, []);
      const filteredTasks = tasks.filter(t => t.id !== id);
      setItem(KEYS.TASKS, filteredTasks);
      resolve(true);
    });
  }
};

// Study Session Service
export const studySessionService = {
  getStudySessions: (userId: number): Promise<StudySession[]> => {
    return new Promise((resolve) => {
      const sessions = getItem<StudySession[]>(KEYS.STUDY_SESSIONS, [])
        .filter(session => session.userId === userId);
      resolve(sessions);
    });
  },
  
  createStudySession: (session: Omit<StudySession, 'id' | 'userId'>, userId: number): Promise<StudySession> => {
    return new Promise((resolve) => {
      const sessions = getItem<StudySession[]>(KEYS.STUDY_SESSIONS, []);
      const newSession: StudySession = {
        ...session,
        id: generateId(),
        userId
      };
      
      sessions.push(newSession);
      setItem(KEYS.STUDY_SESSIONS, sessions);
      resolve(newSession);
    });
  },
  
  updateStudySession: (id: number, sessionData: Partial<StudySession>): Promise<StudySession> => {
    return new Promise((resolve, reject) => {
      const sessions = getItem<StudySession[]>(KEYS.STUDY_SESSIONS, []);
      const sessionIndex = sessions.findIndex(s => s.id === id);
      
      if (sessionIndex === -1) {
        reject(new Error('Study session not found'));
        return;
      }
      
      const updatedSession = { ...sessions[sessionIndex], ...sessionData };
      sessions[sessionIndex] = updatedSession;
      setItem(KEYS.STUDY_SESSIONS, sessions);
      resolve(updatedSession);
    });
  }
};

// Event Service
export const eventService = {
  getEvents: (userId: number): Promise<Event[]> => {
    return new Promise((resolve) => {
      const events = getItem<Event[]>(KEYS.EVENTS, [])
        .filter(event => event.userId === userId);
      resolve(events);
    });
  },
  
  createEvent: (event: Omit<Event, 'id' | 'userId'>, userId: number): Promise<Event> => {
    return new Promise((resolve) => {
      const events = getItem<Event[]>(KEYS.EVENTS, []);
      const newEvent: Event = {
        ...event,
        id: generateId(),
        userId
      };
      
      events.push(newEvent);
      setItem(KEYS.EVENTS, events);
      resolve(newEvent);
    });
  },
  
  updateEvent: (id: number, eventData: Partial<Event>): Promise<Event> => {
    return new Promise((resolve, reject) => {
      const events = getItem<Event[]>(KEYS.EVENTS, []);
      const eventIndex = events.findIndex(e => e.id === id);
      
      if (eventIndex === -1) {
        reject(new Error('Event not found'));
        return;
      }
      
      const updatedEvent = { ...events[eventIndex], ...eventData };
      events[eventIndex] = updatedEvent;
      setItem(KEYS.EVENTS, events);
      resolve(updatedEvent);
    });
  },
  
  deleteEvent: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const events = getItem<Event[]>(KEYS.EVENTS, []);
      const filteredEvents = events.filter(e => e.id !== id);
      setItem(KEYS.EVENTS, filteredEvents);
      resolve(true);
    });
  }
};

// Book Service
export const bookService = {
  getBooks: (userId: number): Promise<Book[]> => {
    return new Promise((resolve) => {
      const books = getItem<Book[]>(KEYS.BOOKS, [])
        .filter(book => book.userId === userId);
      resolve(books);
    });
  },
  
  createBook: (book: Omit<Book, 'id' | 'userId'>, userId: number): Promise<Book> => {
    return new Promise((resolve) => {
      const books = getItem<Book[]>(KEYS.BOOKS, []);
      const newBook: Book = {
        ...book,
        id: generateId(),
        userId
      };
      
      books.push(newBook);
      setItem(KEYS.BOOKS, books);
      resolve(newBook);
    });
  },
  
  updateBook: (id: number, bookData: Partial<Book>): Promise<Book> => {
    return new Promise((resolve, reject) => {
      const books = getItem<Book[]>(KEYS.BOOKS, []);
      const bookIndex = books.findIndex(b => b.id === id);
      
      if (bookIndex === -1) {
        reject(new Error('Book not found'));
        return;
      }
      
      const updatedBook = { ...books[bookIndex], ...bookData };
      books[bookIndex] = updatedBook;
      setItem(KEYS.BOOKS, books);
      resolve(updatedBook);
    });
  },
  
  deleteBook: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const books = getItem<Book[]>(KEYS.BOOKS, []);
      const filteredBooks = books.filter(b => b.id !== id);
      setItem(KEYS.BOOKS, filteredBooks);
      resolve(true);
    });
  }
};

// Note Service
export const noteService = {
  getNotes: (userId: number): Promise<Note[]> => {
    return new Promise((resolve) => {
      const notes = getItem<Note[]>(KEYS.NOTES, [])
        .filter(note => note.userId === userId);
      resolve(notes);
    });
  },
  
  createNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: number): Promise<Note> => {
    return new Promise((resolve) => {
      const notes = getItem<Note[]>(KEYS.NOTES, []);
      const now = new Date();
      const newNote: Note = {
        ...note,
        id: generateId(),
        userId,
        createdAt: now,
        updatedAt: now
      };
      
      notes.push(newNote);
      setItem(KEYS.NOTES, notes);
      resolve(newNote);
    });
  },
  
  updateNote: (id: number, noteData: Partial<Note>): Promise<Note> => {
    return new Promise((resolve, reject) => {
      const notes = getItem<Note[]>(KEYS.NOTES, []);
      const noteIndex = notes.findIndex(n => n.id === id);
      
      if (noteIndex === -1) {
        reject(new Error('Note not found'));
        return;
      }
      
      const updatedNote = { 
        ...notes[noteIndex], 
        ...noteData,
        updatedAt: new Date()
      };
      notes[noteIndex] = updatedNote;
      setItem(KEYS.NOTES, notes);
      resolve(updatedNote);
    });
  },
  
  deleteNote: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const notes = getItem<Note[]>(KEYS.NOTES, []);
      const filteredNotes = notes.filter(n => n.id !== id);
      setItem(KEYS.NOTES, filteredNotes);
      resolve(true);
    });
  }
};

// Flashcard Deck Service
export const flashcardDeckService = {
  getFlashcardDecks: (userId: number): Promise<FlashcardDeck[]> => {
    return new Promise((resolve) => {
      const decks = getItem<FlashcardDeck[]>(KEYS.FLASHCARD_DECKS, [])
        .filter(deck => deck.userId === userId);
      resolve(decks);
    });
  },
  
  createFlashcardDeck: (deck: Omit<FlashcardDeck, 'id' | 'userId' | 'createdAt'>, userId: number): Promise<FlashcardDeck> => {
    return new Promise((resolve) => {
      const decks = getItem<FlashcardDeck[]>(KEYS.FLASHCARD_DECKS, []);
      const newDeck: FlashcardDeck = {
        ...deck,
        id: generateId(),
        userId,
        createdAt: new Date()
      };
      
      decks.push(newDeck);
      setItem(KEYS.FLASHCARD_DECKS, decks);
      resolve(newDeck);
    });
  },
  
  updateFlashcardDeck: (id: number, deckData: Partial<FlashcardDeck>): Promise<FlashcardDeck> => {
    return new Promise((resolve, reject) => {
      const decks = getItem<FlashcardDeck[]>(KEYS.FLASHCARD_DECKS, []);
      const deckIndex = decks.findIndex(d => d.id === id);
      
      if (deckIndex === -1) {
        reject(new Error('Flashcard deck not found'));
        return;
      }
      
      const updatedDeck = { ...decks[deckIndex], ...deckData };
      decks[deckIndex] = updatedDeck;
      setItem(KEYS.FLASHCARD_DECKS, decks);
      resolve(updatedDeck);
    });
  },
  
  deleteFlashcardDeck: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      // Remove the deck
      const decks = getItem<FlashcardDeck[]>(KEYS.FLASHCARD_DECKS, []);
      const filteredDecks = decks.filter(d => d.id !== id);
      setItem(KEYS.FLASHCARD_DECKS, filteredDecks);
      
      // Remove associated flashcards
      const flashcards = getItem<Flashcard[]>(KEYS.FLASHCARDS, []);
      const filteredFlashcards = flashcards.filter(f => f.deckId !== id);
      setItem(KEYS.FLASHCARDS, filteredFlashcards);
      
      resolve(true);
    });
  }
};

// Flashcard Service
export const flashcardService = {
  getFlashcards: (deckId: number): Promise<Flashcard[]> => {
    return new Promise((resolve) => {
      const flashcards = getItem<Flashcard[]>(KEYS.FLASHCARDS, [])
        .filter(flashcard => flashcard.deckId === deckId);
      resolve(flashcards);
    });
  },
  
  createFlashcard: (flashcard: Omit<Flashcard, 'id'>): Promise<Flashcard> => {
    return new Promise((resolve) => {
      const flashcards = getItem<Flashcard[]>(KEYS.FLASHCARDS, []);
      const newFlashcard: Flashcard = {
        ...flashcard,
        id: generateId()
      };
      
      flashcards.push(newFlashcard);
      setItem(KEYS.FLASHCARDS, flashcards);
      resolve(newFlashcard);
    });
  },
  
  updateFlashcard: (id: number, flashcardData: Partial<Flashcard>): Promise<Flashcard> => {
    return new Promise((resolve, reject) => {
      const flashcards = getItem<Flashcard[]>(KEYS.FLASHCARDS, []);
      const flashcardIndex = flashcards.findIndex(f => f.id === id);
      
      if (flashcardIndex === -1) {
        reject(new Error('Flashcard not found'));
        return;
      }
      
      const updatedFlashcard = { ...flashcards[flashcardIndex], ...flashcardData };
      flashcards[flashcardIndex] = updatedFlashcard;
      setItem(KEYS.FLASHCARDS, flashcards);
      resolve(updatedFlashcard);
    });
  },
  
  deleteFlashcard: (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const flashcards = getItem<Flashcard[]>(KEYS.FLASHCARDS, []);
      const filteredFlashcards = flashcards.filter(f => f.id !== id);
      setItem(KEYS.FLASHCARDS, filteredFlashcards);
      resolve(true);
    });
  }
};

// Settings Service
export const settingsService = {
  getSettings: (userId: number): Promise<Settings | null> => {
    return new Promise((resolve) => {
      const settings = getItem<Settings[]>(KEYS.SETTINGS, [])
        .find(s => s.userId === userId) || null;
      resolve(settings);
    });
  },
  
  createSettings: (settings: Omit<Settings, 'id'>, userId: number): Promise<Settings> => {
    return new Promise((resolve) => {
      const allSettings = getItem<Settings[]>(KEYS.SETTINGS, []);
      
      // Remove any existing settings for this user
      const filteredSettings = allSettings.filter(s => s.userId !== userId);
      
      const newSettings: Settings = {
        ...settings,
        id: generateId(),
        userId
      };
      
      filteredSettings.push(newSettings);
      setItem(KEYS.SETTINGS, filteredSettings);
      resolve(newSettings);
    });
  },
  
  updateSettings: (userId: number, settingsData: Partial<Settings>): Promise<Settings> => {
    return new Promise((resolve, reject) => {
      const allSettings = getItem<Settings[]>(KEYS.SETTINGS, []);
      const settingsIndex = allSettings.findIndex(s => s.userId === userId);
      
      if (settingsIndex === -1) {
        // If settings don't exist, create them
        const defaultSettings: Settings = {
          id: generateId(),
          userId,
          pomodoroFocusMinutes: 25,
          pomodoroShortBreakMinutes: 5,
          pomodoroLongBreakMinutes: 15,
          pomodoroLongBreakInterval: 4,
          dailyGoalHours: 4,
          weeklyGoalHours: 20,
          theme: 'system',
          notifications: {}
        };
        
        const newSettings = { ...defaultSettings, ...settingsData };
        allSettings.push(newSettings);
        setItem(KEYS.SETTINGS, allSettings);
        resolve(newSettings);
      } else {
        const updatedSettings = { ...allSettings[settingsIndex], ...settingsData };
        allSettings[settingsIndex] = updatedSettings;
        setItem(KEYS.SETTINGS, allSettings);
        resolve(updatedSettings);
      }
    });
  }
};

// Stats Service
export const statsService = {
  getStats: (userId: number): Promise<{ studyHours: string; tasksCompleted: number; focusScore: string; streak: string }> => {
    return new Promise((resolve) => {
      // Calculate stats based on study sessions and tasks
      const studySessions = getItem<StudySession[]>(KEYS.STUDY_SESSIONS, [])
        .filter(session => session.userId === userId);
      
      const tasks = getItem<Task[]>(KEYS.TASKS, [])
        .filter(task => task.userId === userId);
      
      // Calculate total study hours
      const totalMinutes = studySessions.reduce((total, session) => {
        if (session.duration) {
          return total + session.duration;
        }
        return total;
      }, 0);
      
      const studyHours = (totalMinutes / 60).toFixed(1);
      
      // Count completed tasks
      const tasksCompleted = tasks.filter(task => task.completed).length;
      
      // Calculate focus score (0-100)
      // This is a simplistic calculation - in a real app, this would be more complex
      const focusScore = Math.min(100, Math.floor((totalMinutes / 3000) * 100)).toString();
      
      // Calculate streak (consecutive days with study sessions)
      // For now, just return a placeholder
      const streak = "5"; // Placeholder
      
      resolve({
        studyHours,
        tasksCompleted,
        focusScore,
        streak
      });
    });
  },
  
  getRecentActivity: (userId: number): Promise<Array<{ type: string; icon: string; title: string; subtitle: string; timestamp: Date }>> => {
    return new Promise((resolve) => {
      const studySessions = getItem<StudySession[]>(KEYS.STUDY_SESSIONS, [])
        .filter(session => session.userId === userId);
      
      const tasks = getItem<Task[]>(KEYS.TASKS, [])
        .filter(task => task.userId === userId && task.completed);
      
      const notes = getItem<Note[]>(KEYS.NOTES, [])
        .filter(note => note.userId === userId);
      
      const flashcardDecks = getItem<FlashcardDeck[]>(KEYS.FLASHCARD_DECKS, [])
        .filter(deck => deck.userId === userId);
      
      const activities = [
        // Study sessions
        ...studySessions.map(session => ({
          type: 'study',
          icon: 'clock',
          title: `Studied ${session.subject || 'a subject'}`,
          subtitle: `for ${session.duration ? Math.round(session.duration / 60) : '?'} minutes`,
          timestamp: new Date(session.startTime)
        })),
        
        // Completed tasks
        ...tasks.map(task => ({
          type: 'task',
          icon: 'check-square',
          title: `Completed task`,
          subtitle: task.title,
          timestamp: new Date(task.createdAt)
        })),
        
        // Created notes
        ...notes.map(note => ({
          type: 'note',
          icon: 'file-text',
          title: `Created note`,
          subtitle: note.title,
          timestamp: new Date(note.createdAt)
        })),
        
        // Created flashcard decks
        ...flashcardDecks.map(deck => ({
          type: 'flashcard',
          icon: 'layers',
          title: `Created flashcard deck`,
          subtitle: deck.title,
          timestamp: new Date(deck.createdAt)
        }))
      ];
      
      // Sort by timestamp (newest first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Return the 10 most recent activities
      resolve(activities.slice(0, 10));
    });
  }
};