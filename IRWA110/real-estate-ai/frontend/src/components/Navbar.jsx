import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, LogOut, User, History, Search } from 'lucide-react'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/query" className="flex items-center">
              <Home className="h-8 w-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Real Estate AI</span>
            </Link>
            
            {/* Navigation Tabs */}
            <div className="ml-8 flex space-x-1">
              <Link
                to="/query"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/query'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </Link>
              <Link
                to="/history"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/history'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-1" />
              {user.username}
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

