import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = async (
  method: string,
  url: string,
  data?: any
): Promise<Response> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Log the request
  console.log('[API REQUEST]', { method, url, data, options });

  const response = await fetch(url, options);

  // Log the response status
  console.log('[API RESPONSE]', { url, status: response.status });

  // Try to log the response body (if possible)
  let responseBody;
  try {
    responseBody = await response.clone().json();
  } catch (e) {
    try {
      responseBody = await response.clone().text();
    } catch (e2) {
      responseBody = '[unreadable]';
    }
  }
  console.log('[API RESPONSE BODY]', { url, body: responseBody });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return response;
    }
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response;
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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