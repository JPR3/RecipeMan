import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
    const { user } = useAuth();
    return (
        <nav className="w-full bg-background border-b border-border text-white px-6 py-2 flex justify-between items-center fixed top-0 z-50 shadow-md">
            <Link to="/" className="text-lg font-semibold hover:underline">
                Home
            </Link>
            <Link to="/lists" className="text-lg font-semibold hover:underline">
                Lists
            </Link>
            <Link to="/recipes" className="text-lg font-semibold hover:underline">
                Recipes
            </Link>
            <div className='flex items-center gap-2'>
                <ThemeSwitcher />
                <Link to={user ? "/profile" : "/signin"} className="text-lg font-semibold hover:underline">
                    {user ? 'Profile' : 'Sign In'}
                </Link>
            </div>

        </nav>
    );
};

export default Navbar;