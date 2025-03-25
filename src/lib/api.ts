interface ApiResult<T> {
  data: null | T;
  error: null | string;
  status: number;
}

interface RequestOptions {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  requiresAuth?: boolean;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const { body, headers: customHeaders = {}, method = "GET" } = options;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    const config: RequestInit = {
      credentials: "include",
      headers,
      method,
    };

    if (body && (method === "POST" || method === "PUT")) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`/api/${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error:
          "error" in responseData
            ? responseData.error
            : "An unknown error occurred",
        status: response.status,
      };
    }

    return {
      data: (responseData.body as T) || null,
      error: null,
      status: response.status,
    };
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Network error",
      status: 500,
    };
  }
}
