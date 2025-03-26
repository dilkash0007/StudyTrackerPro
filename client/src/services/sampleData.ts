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

// Sample User
export const sampleUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  profilePicture: ''
};

// Sample Tasks
export const sampleTasks: Task[] = [
  {
    id: 1,
    userId: 1,
    title: 'Complete Math Assignment',
    description: 'Finish the calculus problems from chapter 5',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    completed: false,
    priority: 'high',
    subject: 'Mathematics',
    createdAt: new Date()
  },
  {
    id: 2,
    userId: 1,
    title: 'Read History Chapter',
    description: 'Read chapter 3 on World War II',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false,
    priority: 'medium',
    subject: 'History',
    createdAt: new Date()
  },
  {
    id: 3,
    userId: 1,
    title: 'Prepare Chemistry Lab Report',
    description: 'Write up results from last week\'s experiment',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    completed: false,
    priority: 'urgent',
    subject: 'Chemistry',
    createdAt: new Date()
  }
];

// Sample Study Sessions
export const sampleStudySessions: StudySession[] = [
  {
    id: 1,
    userId: 1,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    duration: 60,
    subject: 'Mathematics',
    notes: 'Focused on integration techniques, made good progress'
  },
  {
    id: 2,
    userId: 1,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
    duration: 60,
    subject: 'History',
    notes: 'Read about the causes of World War II'
  }
];

// Sample Events
export const sampleEvents: Event[] = [
  {
    id: 1,
    userId: 1,
    title: 'Group Study - Physics',
    description: 'Meet with study group to prepare for physics exam',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    location: 'Library Room 201',
    color: '#4CAF50'
  },
  {
    id: 2,
    userId: 1,
    title: 'Math Exam',
    description: 'Calculus midterm exam',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    location: 'Science Building Room 101',
    color: '#F44336'
  }
];

// Sample Books
export const sampleBooks: Book[] = [
  {
    id: 1,
    userId: 1,
    title: 'Introduction to Calculus',
    author: 'James Stewart',
    category: 'Mathematics',
    currentPage: 75,
    totalPages: 450,
    notes: 'Working through chapter 3 on derivatives'
  },
  {
    id: 2,
    userId: 1,
    title: 'World History: Modern Era',
    author: 'Peter Smith',
    category: 'History',
    currentPage: 120,
    totalPages: 380,
    notes: 'Currently on the World War II section'
  }
];

// Sample Notes
export const sampleNotes: Note[] = [
  {
    id: 1,
    userId: 1,
    title: 'Calculus Integration Techniques',
    content: '# Integration Techniques\n\n## Substitution Method\nLet u = g(x), then ∫f(g(x))g\'(x)dx = ∫f(u)du\n\n## Integration by Parts\n∫u(x)v\'(x)dx = u(x)v(x) - ∫v(x)u\'(x)dx',
    subject: 'Mathematics',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    userId: 1,
    title: 'World War II Key Events',
    content: '# World War II Timeline\n\n- Sept 1, 1939: Germany invades Poland\n- Dec 7, 1941: Pearl Harbor attack\n- June 6, 1944: D-Day\n- May 8, 1945: VE Day\n- Aug 6, 1945: Atomic bomb dropped on Hiroshima\n- Sept 2, 1945: Japan surrenders',
    subject: 'History',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

// Sample Flashcard Decks
export const sampleFlashcardDecks: FlashcardDeck[] = [
  {
    id: 1,
    userId: 1,
    title: 'Calculus Formulas',
    description: 'Essential formulas for calculus',
    subject: 'Mathematics',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    userId: 1,
    title: 'Historical Dates',
    description: 'Important dates in world history',
    subject: 'History',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

// Sample Flashcards
export const sampleFlashcards: Flashcard[] = [
  {
    id: 1,
    deckId: 1,
    question: 'What is the derivative of sin(x)?',
    answer: 'cos(x)',
    mastery: 3
  },
  {
    id: 2,
    deckId: 1,
    question: 'What is the derivative of e^x?',
    answer: 'e^x',
    mastery: 4
  },
  {
    id: 3,
    deckId: 2,
    question: 'When did World War II begin?',
    answer: 'September 1, 1939',
    mastery: 2
  },
  {
    id: 4,
    deckId: 2,
    question: 'When did World War II end?',
    answer: 'September 2, 1945',
    mastery: 3
  }
];

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
  theme: 'system',
  notifications: {
    taskReminders: true,
    studySessionReminders: true,
    eventNotifications: true
  }
};