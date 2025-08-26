import { useState } from 'react';
import supabase from "../components/SupabaseClient.jsx";
import { Link } from 'react-router-dom';
const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {

        e.preventDefault();
        if (!email || !password) {
            return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) {
            setError(error.message);
        } else {
            setError(null);
        }
    }

    const isValid = email && password;

    return (
        <div className="flex flex-col justify-start items-center">
            <div className="grid gap-9 justify-center border border-border shadow-lg bg-surface p-6 rounded-md max-w-md">
                <h1 className="text-2xl w-full">Sign in to your account</h1>
                <form onSubmit={handleSubmit}>
                    <label className="font-medium text-content" htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        className="border border-border bg-fields text-content p-2 rounded-md w-full mb-4"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="font-medium text-content" htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="password"
                        placeholder="Password"
                        className="border border-border bg-fields text-content p-2 rounded-md w-full mb-4"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full font-semibold py-2 px-4 rounded-md ${isValid
                            ? 'bg-primary hover:bg-primary-hv text-content'
                            : 'bg-button text-content cursor-not-allowed'
                            }`}
                    >
                        Sign In
                    </button>
                </form>

            </div>
            <div>
                <p className="text-gray-500 text-sm mt-4">
                    Don't have an account? <Link to="/signup" className="text-primary">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
