import React, { useState } from 'react';
const Profile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            return;
        }
        console.log('Form submitted:', { username, email, password });
    }

    const isValid = username && email && password;

    return (
        <div className="grid gap-8 justify-center border border-gray-600 shadow-lg bg-gray-800 p-6 rounded-md max-w-md">
            <h1 className="text-2xl w-full">Register Account</h1>
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
                    autoComplete="new-password"
                    minLength="8"
                    placeholder="Password"
                    className="border border-gray-600 bg-gray-700 text-white p-2 rounded-md w-full mb-4"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!isValid}
                    className={`w-full font-semibold py-2 px-4 rounded-md ${isValid
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        }`}
                >
                    Register
                </button>
            </form>

        </div>
    );
};

export default Profile;
