/**
 * useNotifications.js — builds the notification list from live data:
 * weather advisory (Open-Meteo) and the user's farm records (harvest dates).
 * Read/unread state is kept per browser in localStorage.
 */

import { useMemo, useState, useCallback } from 'react'
import { useApi } from './useApi'

const READ_KEY = 'agromind_read_notifications'
const WEATHER_KEYWORDS = ['alert', 'extreme', 'near-frost', 'heavy rain', 'strong winds', 'fungal', 'high weather risk']
const DAY_MS = 24 * 60 * 60 * 1000

function loadRead() {
    try {
        return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'))
    } catch {
        return new Set()
    }
}

function saveRead(set) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify([...set]))
    } catch { /* storage unavailable */ }
}

export function useNotifications() {
    const { data: weather } = useApi('/api/weather/advisory')
    const { data: recordsData } = useApi('/api/farm-records')
    const [readIds, setReadIds] = useState(loadRead)

    const records = useMemo(() => recordsData?.records || [], [recordsData])

    const notifications = useMemo(() => {
        const list = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (weather?.advisory) {
            const day = (weather.timestamp || '').slice(0, 10)
            weather.advisory.split(' | ').forEach((tip, i) => {
                const lower = tip.toLowerCase()
                if (WEATHER_KEYWORDS.some(k => lower.includes(k))) {
                    list.push({
                        id: `weather-${day}-${i}`,
                        type: weather.risk === 'High' ? 'danger' : 'warning',
                        title: 'Weather advisory',
                        message: tip,
                        path: '/app/weather',
                    })
                }
            })
        }

        records.forEach(r => {
            if (!r.harvest || r.status === 'Harvested') return
            const due = new Date(r.harvest)
            if (Number.isNaN(due.getTime())) return
            const days = Math.round((due - today) / DAY_MS)
            if (days < 0) {
                list.push({
                    id: `harvest-overdue-${r.id}`,
                    type: 'danger',
                    title: 'Harvest overdue',
                    message: `${r.crop} in ${r.field} was due ${-days} day${days === -1 ? '' : 's'} ago.`,
                    path: '/app/records',
                })
            } else if (days <= 14) {
                list.push({
                    id: `harvest-due-${r.id}`,
                    type: 'info',
                    title: 'Harvest coming up',
                    message: `${r.crop} in ${r.field} is due ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}.`,
                    path: '/app/records',
                })
            }
        })

        return list.map(n => ({ ...n, read: readIds.has(n.id) }))
    }, [weather, records, readIds])

    const markAllRead = useCallback(() => {
        const next = new Set([...readIds, ...notifications.map(n => n.id)])
        saveRead(next)
        setReadIds(next)
    }, [readIds, notifications])

    const markRead = useCallback((id) => {
        const next = new Set(readIds).add(id)
        saveRead(next)
        setReadIds(next)
    }, [readIds])

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        records,
        markRead,
        markAllRead,
    }
}
