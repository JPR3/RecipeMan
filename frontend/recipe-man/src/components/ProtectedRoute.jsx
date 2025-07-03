import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) {
        return <div className="text-white p-4">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/signin" replace />
    }

    return children
}

export default ProtectedRoute