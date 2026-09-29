/**
 * useApi.js — Generic fetch hook with loading, error, and retry states.
 * Used by all new live-data components throughout the app.
 */

import { useState, useEffect, useCallback } from 'react'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050'

/**
 * useApi(url, options)
 * @param {string} url - relative path like '/api/weather/advisory?lat=...'
 * @param {object} opts - { method, body, headers, deps, skip }
 * @returns { data, loading, error, refetch }
 */
export function useApi(url, opts = {}) {
    const { method = 'GET', body = null, skip = false, deps = [] } = opts
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(!skip)
    const [error, setError] = useState(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('agromind_token')
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(opts.headers || {}),
            }

            const res = await fetch(API_BASE + url, {
                method,
                headers,
                ...(body ? { body: JSON.stringify(body) } : {}),
            })

            const json = await res.json()

            if (!res.ok) {
                setError(json.error || json.detail || `Server error (${res.status})`)
                setData(null)
            } else {
                setData(json)
                setError(null)
            }
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                setError('Cannot reach backend server. Make sure it is running on port 5050.')
            } else {
                setError(err.message || 'Unknown error')
            }
            setData(null)
        } finally {
            setLoading(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, method, JSON.stringify(body)])

    useEffect(() => {
        if (!skip) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, skip, ...deps])

    return { data, loading, error, refetch: fetchData }
}

/**
 * postMultipart — For file uploads (Plant.id disease analysis).
 * Returns { data, error }.
 */
export async function postMultipart(url, formData) {
    const token = localStorage.getItem('agromind_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
        const res = await fetch(API_BASE + url, {
            method: 'POST',
            headers,
            body: formData,
        })
        const json = await res.json()
        if (!res.ok) {
            return { data: null, error: json.error || `Server error (${res.status})` }
        }
        return { data: json, error: null }
    } catch (err) {
        return { data: null, error: err.message || 'Failed to upload image' }
    }
}

export default useApi
