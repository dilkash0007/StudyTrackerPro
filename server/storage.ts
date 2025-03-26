import { 
  users, 
  User, 
  InsertUser,
  tasks,
  Task,
  InsertTask,
  studySessions,
  StudySession,
  InsertStudySession,
  events,
  Event,
  InsertEvent,
  books,
  Book,
  InsertBook,
  notes,
  Note,
  InsertNote,
  flashcardDecks,
  FlashcardDeck,
  InsertFlashcardDeck,
  flashcards,
  Flashcard,
  InsertFlashcard,
  settings,
  Settings,
  InsertSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Task methods
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getUserTasks(userId: number): Promise<Task[]>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study session methods
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getStudySession(id: number): Promise<StudySession | undefined>;
  getUserStudySessions(userId: number): Promise<StudySession[]>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
  
  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getUserEvents(userId: number): Promise<Event[]>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Book methods
  createBook(book: InsertBook): Promise<Book>;
  getBook(id: number): Promise<Book | undefined>;
  getUserBooks(userId: number): Promise<Book[]>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Note methods
  createNote(note: InsertNote): Promise<Note>;
  getNote(id: number): Promise<Note | undefined>;
  getUserNotes(userId: number): Promise<Note[]>;
  updateNote(id: number, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Flashcard deck methods
  createFlashcardDeck(deck: InsertFlashcardDeck): Promise<FlashcardDeck>;
  getFlashcardDeck(id: number): Promise<FlashcardDeck | undefined>;
  getUserFlashcardDecks(userId: number): Promise<FlashcardDeck[]>;
  updateFlashcardDeck(id: number, deck: Partial<FlashcardDeck>): Promise<FlashcardDeck | undefined>;
  deleteFlashcardDeck(id: number): Promise<boolean>;
  
  // Flashcard methods
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  getDeckFlashcards(deckId: number): Promise<Flashcard[]>;
  updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<Settings>): Promise<Settings | undefined>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private tasksMap: Map<number, Task>;
  private studySessionsMap: Map<number, StudySession>;
  private eventsMap: Map<number, Event>;
  private booksMap: Map<number, Book>;
  private notesMap: Map<number, Note>;
  private flashcardDecksMap: Map<number, FlashcardDeck>;
  private flashcardsMap: Map<number, Flashcard>;
  private settingsMap: Map<number, Settings>;
  
  private currentUserId: number;
  private currentTaskId: number;
  private currentStudySessionId: number;
  private currentEventId: number;
  private currentBookId: number;
  private currentNoteId: number;
  private currentFlashcardDeckId: number;
  private currentFlashcardId: number;
  private currentSettingsId: number;

  constructor() {
    this.usersMap = new Map();
    this.tasksMap = new Map();
    this.studySessionsMap = new Map();
    this.eventsMap = new Map();
    this.booksMap = new Map();
    this.notesMap = new Map();
    this.flashcardDecksMap = new Map();
    this.flashcardsMap = new Map();
    this.settingsMap = new Map();
    
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentStudySessionId = 1;
    this.currentEventId = 1;
    this.currentBookId = 1;
    this.currentNoteId = 1;
    this.currentFlashcardDeckId = 1;
    this.currentFlashcardId = 1;
    this.currentSettingsId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Task methods
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const createdAt = new Date();
    const task: Task = { ...insertTask, id, createdAt };
    this.tasksMap.set(id, task);
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksMap.get(id);
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasksMap.values()).filter(
      (task) => task.userId === userId
    );
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasksMap.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasksMap.delete(id);
  }

  // Study session methods
  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = this.currentStudySessionId++;
    const session: StudySession = { ...insertSession, id };
    this.studySessionsMap.set(id, session);
    return session;
  }

  async getStudySession(id: number): Promise<StudySession | undefined> {
    return this.studySessionsMap.get(id);
  }

  async getUserStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessionsMap.values()).filter(
      (session) => session.userId === userId
    );
  }

  async updateStudySession(id: number, sessionData: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = await this.getStudySession(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionData };
    this.studySessionsMap.set(id, updatedSession);
    return updatedSession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessionsMap.delete(id);
  }

  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { ...insertEvent, id };
    this.eventsMap.set(id, event);
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsMap.get(id);
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return Array.from(this.eventsMap.values()).filter(
      (event) => event.userId === userId
    );
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.eventsMap.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.eventsMap.delete(id);
  }

  // Book methods
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentBookId++;
    const book: Book = { ...insertBook, id };
    this.booksMap.set(id, book);
    return book;
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.booksMap.get(id);
  }

  async getUserBooks(userId: number): Promise<Book[]> {
    return Array.from(this.booksMap.values()).filter(
      (book) => book.userId === userId
    );
  }

  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined> {
    const book = await this.getBook(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...bookData };
    this.booksMap.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.booksMap.delete(id);
  }

  // Note methods
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const note: Note = { ...insertNote, id, createdAt, updatedAt };
    this.notesMap.set(id, note);
    return note;
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notesMap.get(id);
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notesMap.values()).filter(
      (note) => note.userId === userId
    );
  }

  async updateNote(id: number, noteData: Partial<Note>): Promise<Note | undefined> {
    const note = await this.getNote(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...noteData, updatedAt: new Date() };
    this.notesMap.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notesMap.delete(id);
  }

  // Flashcard deck methods
  async createFlashcardDeck(insertDeck: InsertFlashcardDeck): Promise<FlashcardDeck> {
    const id = this.currentFlashcardDeckId++;
    const createdAt = new Date();
    const deck: FlashcardDeck = { ...insertDeck, id, createdAt };
    this.flashcardDecksMap.set(id, deck);
    return deck;
  }

  async getFlashcardDeck(id: number): Promise<FlashcardDeck | undefined> {
    return this.flashcardDecksMap.get(id);
  }

  async getUserFlashcardDecks(userId: number): Promise<FlashcardDeck[]> {
    return Array.from(this.flashcardDecksMap.values()).filter(
      (deck) => deck.userId === userId
    );
  }

  async updateFlashcardDeck(id: number, deckData: Partial<FlashcardDeck>): Promise<FlashcardDeck | undefined> {
    const deck = await this.getFlashcardDeck(id);
    if (!deck) return undefined;
    
    const updatedDeck = { ...deck, ...deckData };
    this.flashcardDecksMap.set(id, updatedDeck);
    return updatedDeck;
  }

  async deleteFlashcardDeck(id: number): Promise<boolean> {
    // Delete all flashcards in the deck
    const flashcardsToDelete = Array.from(this.flashcardsMap.values())
      .filter(card => card.deckId === id)
      .map(card => card.id);
    
    flashcardsToDelete.forEach(cardId => {
      this.flashcardsMap.delete(cardId);
    });
    
    return this.flashcardDecksMap.delete(id);
  }

  // Flashcard methods
  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const flashcard: Flashcard = { ...insertFlashcard, id };
    this.flashcardsMap.set(id, flashcard);
    return flashcard;
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcardsMap.get(id);
  }

  async getDeckFlashcards(deckId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcardsMap.values()).filter(
      (flashcard) => flashcard.deckId === deckId
    );
  }

  async updateFlashcard(id: number, flashcardData: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const flashcard = await this.getFlashcard(id);
    if (!flashcard) return undefined;
    
    const updatedFlashcard = { ...flashcard, ...flashcardData };
    this.flashcardsMap.set(id, updatedFlashcard);
    return updatedFlashcard;
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    return this.flashcardsMap.delete(id);
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settingsMap.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.currentSettingsId++;
    const settings: Settings = { ...insertSettings, id };
    this.settingsMap.set(id, settings);
    return settings;
  }

  async updateSettings(userId: number, settingsData: Partial<Settings>): Promise<Settings | undefined> {
    const settings = await this.getSettings(userId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...settingsData };
    this.settingsMap.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
