import { QueryClient, QueryFunction } from "@tanstack/react-query";
import {
  taskService,
  eventService,
  studySessionService,
  bookService,
  noteService,
  flashcardDeckService,
  flashcardService,
  authService,
} from "../services/localStorage";

// This is a mock API request function
// It connects to our localStorage services
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  console.log(`API ${method} request to ${url}`, data);

  // Get the current user ID
  const user = await authService.getUser();
  const userId = user?.id || 1; // Default to user ID 1 if not logged in

  try {
    let result;

    // Handle different API endpoints
    if (url === "/api/tasks" && method === "POST") {
      result = await taskService.createTask(data as any, userId);
    } else if (url.startsWith("/api/tasks/") && method === "PUT") {
      const id = parseInt(url.split("/")[3]);
      result = await taskService.updateTask(id, data as any);
    } else if (url.startsWith("/api/tasks/") && method === "DELETE") {
      const id = parseInt(url.split("/")[3]);
      result = await taskService.deleteTask(id);
    } else if (url === "/api/events" && method === "POST") {
      result = await eventService.createEvent(data as any, userId);
    } else if (url.startsWith("/api/events/") && method === "PUT") {
      const id = parseInt(url.split("/")[3]);
      result = await eventService.updateEvent(id, data as any);
    } else if (url.startsWith("/api/events/") && method === "DELETE") {
      const id = parseInt(url.split("/")[3]);
      result = await eventService.deleteEvent(id);
    } else {
      // For other endpoints, just return the data
      result = data || {};
    }

    // Create a mock response
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(result),
      text: () => Promise.resolve(JSON.stringify(result)),
    } as Response;

    return Promise.resolve(mockResponse);
  } catch (error) {
    console.error("API request error:", error);
    const errorResponse = {
      ok: false,
      status: 500,
      statusText: "Error",
      json: () => Promise.resolve({ message: (error as Error).message }),
      text: () => Promise.resolve((error as Error).message),
    } as Response;

    return Promise.resolve(errorResponse);
  }
}

// This is a mock query function that connects to localStorage services
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn =
  <TData>(options: { on401: UnauthorizedBehavior }): QueryFunction<TData> =>
  async ({ queryKey }) => {
    console.log(`Query for ${queryKey[0]}`);

    try {
      const user = await authService.getUser();
      const userId = user?.id || 1; // Default to user ID 1 if not logged in

      let result;

      // Handle different query endpoints
      if (queryKey[0] === "/api/tasks") {
        result = await taskService.getTasks(userId);
      } else if (queryKey[0] === "/api/events") {
        result = await eventService.getEvents(userId);
      } else if (queryKey[0] === "/api/study-sessions") {
        result = await studySessionService.getStudySessions(userId);
      } else if (queryKey[0] === "/api/books") {
        result = await bookService.getBooks(userId);
      } else if (queryKey[0] === "/api/notes") {
        result = await noteService.getNotes(userId);
      } else {
        // For other endpoints, return empty data
        result = {};
      }

      return result as TData;
    } catch (error) {
      console.error("Query error:", error);
      return {} as TData;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
