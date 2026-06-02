import type { AxiosError } from "axios"
import type { ApiError } from "./types"

/**
 * Extracts a human-readable error message from an Axios error.
 * Returns the backend's `error` field when available.
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return "Bilinmeyen hata"

  const axiosError = error as AxiosError<ApiError>
  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error
  }

  if (axiosError.message) return axiosError.message

  return "Bilinmeyen hata"
}

/**
 * Returns the HTTP status code from an Axios error.
 */
export function getErrorStatus(error: unknown): number | null {
  const axiosError = error as AxiosError
  return axiosError.response?.status ?? null
}
