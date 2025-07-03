import React, { useState } from 'react';
import supabase from "../components/SupabaseClient.jsx";
import { useNavigate, Link } from 'react-router-dom';
const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            return;
        }
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username }
            }
        })

        if (error) {
            setError(error.message);
        } else {
            setError(null);
            navigate('/')
        }
    }

    const isValid = username && email && password;

    return (
        <div className="flex flex-col justify-start items-center">
            <div className="grid gap-9 justify-center border border-gray-600 shadow-lg bg-gray-800 p-6 rounded-md max-w-md">
                <h1 className="text-2xl w-full">Sign up for an account</h1>
                <form onSubmit={handleSubmit}>
                    <label className="font-medium text-white" htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        autoComplete="username"
                        type="text"
                        placeholder="Username"
                        className="border border-gray-600 bg-gray-700 text-white p-2 rounded-md w-full mb-4"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label className="font-medium text-white" htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        className="border border-gray-600 bg-gray-700 text-white p-2 rounded-md w-full mb-4"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="font-medium text-white" htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="password"
                        placeholder="Password"
                        className="border border-gray-600 bg-gray-700 text-white p-2 rounded-md w-full mb-4"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full font-semibold py-2 px-4 rounded-md ${isValid
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Sign Up
                    </button>
                </form>

            </div>
            <div>
                <p className="text-gray-400 text-sm mt-4">
                    Already have an account? <Link to="/signin" className="text-blue-400 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
