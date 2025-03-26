import { QueryClient, QueryFunction } from "@tanstack/react-query";

// This is a mock API request function
// It will be replaced with direct calls to our localStorage services
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Create a mock response
  const mockResponse = {
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve(data || {}),
    text: () => Promise.resolve(JSON.stringify(data || {})),
  } as Response;
  
  console.log(`Mock API ${method} request to ${url}`, data);
  
  // Return the mock response
  return Promise.resolve(mockResponse);
}

// This is a mock query function
// Components will use our localStorage services directly instead
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    // Log the query for debugging
    console.log(`Mock query for ${queryKey[0]}`);
    
    // Return empty data (components will use localStorage services)
    return {} as T;
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
