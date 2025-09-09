import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { propertyAPI } from '../services/api'
import ResponseCard from '../components/ResponseCard'
import { History as HistoryIcon, Home, Calendar, MapPin, DollarSign, RefreshCw } from 'lucide-react'

function History() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [queryHistory, setQueryHistory] = useState([])
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [response, setResponse] = useState(null)

  useEffect(() => {
    fetchQueryHistory()
  }, [])

  const fetchQueryHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await propertyAPI.getHistory()
      setQueryHistory(result.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch query history')
    } finally {
      setLoading(false)
    }
  }

  const fetchQueryResponse = async (queryId) => {
    try {
      setLoading(true)
      setError('')
      setSelectedQuery(queryId)
      
      // Fetch the response data for this query
      const result = await propertyAPI.getResponse(queryId)
      setResponse(result.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch query response')
      setResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading && queryHistory.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <HistoryIcon className="h-8 w-8 mr-3 text-primary-600" />
              Analysis History
            </h1>
            <p className="text-gray-600">
              View your previous property analyses and results
            </p>
          </div>
          <button
            onClick={fetchQueryHistory}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Query History List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Analyses ({queryHistory.length})
              </h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {queryHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No analysis history found</p>
                  <p className="text-sm">Start by analyzing a property</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {queryHistory.map((query) => (
                    <div
                      key={query.id}
                      onClick={() => fetchQueryResponse(query.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedQuery === query.id ? 'bg-primary-50 border-r-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {query.query_text || 'Property Analysis'}
                          </p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(query.created_at)}
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              query.has_response 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {query.has_response ? 'Completed' : 'Processing'}
                            </div>
                            {query.has_response && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  fetchQueryResponse(query.id)
                                }}
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                              >
                                View Results
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Query Details and Results */}
        <div className="lg:col-span-2">
          {selectedQuery ? (
            <div className="space-y-6">
              {/* Query Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Query Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Query Text
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {queryHistory.find(q => q.id === selectedQuery)?.query_text || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Analysis Date
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(queryHistory.find(q => q.id === selectedQuery)?.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Results */}
              {response ? (
                <ResponseCard response={response} />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a query to view analysis results</p>
                  <p className="text-sm">Response data will be displayed here</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a query from the history to view details</p>
              <p className="text-sm">Click on any analysis to see the results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History
