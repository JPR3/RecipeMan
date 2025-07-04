import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    if (loading) {
        return <div className="text-white p-4">Loading...</div>
    }

    else if (user) {
        return <Navigate to={from} replace />
    }

    return children
}

export default GuestRoute