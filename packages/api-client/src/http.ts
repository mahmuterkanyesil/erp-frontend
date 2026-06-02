import axios, { type AxiosInstance, type AxiosError } from "axios"

/**
 * Creates a configured Axios instance for the given base URL.
 * Token injection and 401 refresh handling are attached via interceptors
 * after the store is initialized (see setupInterceptors).
 */
export function createHttpClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30_000,
  })
}

/** Tenant API client — points to :8081 */
export const tenantHttp = createHttpClient(
  typeof window !== "undefined"
    ? (import.meta as any).env?.VITE_TENANT_API_URL ?? "http://localhost:8081"
    : "http://localhost:8081",
)

/** Platform API client — points to :8080 */
export const platformHttp = createHttpClient(
  typeof window !== "undefined"
    ? (import.meta as any).env?.VITE_PLATFORM_API_URL ?? "http://localhost:8080"
    : "http://localhost:8080",
)

/**
 * Attaches auth interceptors to the tenant HTTP client.
 * Must be called once after Zustand store is initialized.
 *
 * @param getToken - Function that returns the current access token from the store
 * @param onUnauthorized - Called when refresh fails; should trigger logout
 * @param refreshFn - Function that attempts to refresh the token
 */
export function setupTenantInterceptors(
  getToken: () => string | null,
  onUnauthorized: () => void,
  refreshFn: () => Promise<string | null>,
  getTenantId: () => string | null,
): void {
  // Request: inject Bearer token + X-Tenant-ID
  tenantHttp.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const tenantId = getTenantId()
    if (tenantId && !config.headers["X-Tenant-ID"]) {
      config.headers["X-Tenant-ID"] = tenantId
    }
    return config
  })

  // Response: handle 401 with token refresh
  let isRefreshing = false
  let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (err: unknown) => void
  }> = []

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error)
      else prom.resolve(token!)
    })
    failedQueue = []
  }

  tenantHttp.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return tenantHttp(originalRequest)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const newToken = await refreshFn()
          if (!newToken) throw new Error("Refresh failed")
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return tenantHttp(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          onUnauthorized()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error)
    },
  )
}
