"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook for polling an API endpoint at regular intervals
 * @param url - The URL to poll
 * @param interval - Polling interval in milliseconds
 * @param enabled - Whether polling is enabled
 * @returns The fetched data and loading state
 */
export function usePolling<T>(url: string, interval = 5000, enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let timeoutId: NodeJS.Timeout

    const fetchData = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling
    const poll = () => {
      timeoutId = setTimeout(() => {
        fetchData().then(poll)
      }, interval)
    }

    poll()

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [url, interval, enabled])

  return { data, loading, error }
}

/*
 * WebSocket alternative for real-time updates:
 *
 * export function useWebSocket<T>(url: string) {
 *   const [data, setData] = useState<T | null>(null)
 *   const [connected, setConnected] = useState(false)
 *
 *   useEffect(() => {
 *     const ws = new WebSocket(url)
 *
 *     ws.onopen = () => {
 *       setConnected(true)
 *     }
 *
 *     ws.onmessage = (event) => {
 *       const message = JSON.parse(event.data)
 *       setData(message)
 *     }
 *
 *     ws.onerror = (error) => {
 *       console.error('WebSocket error:', error)
 *     }
 *
 *     ws.onclose = () => {
 *       setConnected(false)
 *     }
 *
 *     return () => {
 *       ws.close()
 *     }
 *   }, [url])
 *
 *   return { data, connected }
 * }
 *
 * Example WebSocket event payload:
 * {
 *   "type": "upload_progress",
 *   "upload_id": "upload-123",
 *   "processed_count": 150,
 *   "total_providers": 200,
 *   "status": "processing",
 *   "eta_seconds": 120
 * }
 */
