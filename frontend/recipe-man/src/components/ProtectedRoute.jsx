import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()
    if (loading) {
        return <div className="text-content p-4">Loading...</div>
    }

    else if (!user) {
        return <Navigate to="/signin" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute