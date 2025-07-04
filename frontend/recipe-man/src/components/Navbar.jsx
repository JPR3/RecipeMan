import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

const Navbar = () => {
    const { user } = useAuth();
    return (
        <nav className="w-full bg-gray-900 border-b border-gray-600 text-white px-6 py-2 flex justify-between items-center fixed top-0 z-50 shadow-md">
            <Link to="/" className="text-lg font-semibold hover:underline">
                Home
            </Link>
            <Link to="/recipes" className="text-lg font-semibold hover:underline">
                Recipes
            </Link>
            <Link to={user ? "/profile" : "/signin"} className="text-lg font-semibold hover:underline">
                {user ? 'Profile' : 'Sign In'}
            </Link>
        </nav>
    );
};

export default Navbar;