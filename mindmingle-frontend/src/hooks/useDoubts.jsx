import { useState, useEffect, useCallback } from 'react'
import { doubtAPI } from '../services/api'
import { extractErrorMessage } from '../services/api'

export function useDoubts(tab = 'recent') {
    const [doubts, setDoubts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchDoubts = useCallback(() => {
        setLoading(true)
        setError(null)
        doubtAPI.getDoubts({ sort: tab })
            .then(res => {
                // Handle both paginated and non-paginated responses
                const data = Array.isArray(res.data) ? res.data : res.data.results
                setDoubts(data)
            })
            .catch(err => {
                setError(extractErrorMessage(err, 'Failed to load doubts'))
            })
            .finally(() => setLoading(false))
    }, [tab])

    useEffect(() => {
        fetchDoubts()
    }, [fetchDoubts])

    return { doubts, loading, error, refetch: fetchDoubts }
}