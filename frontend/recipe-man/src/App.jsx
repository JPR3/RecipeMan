import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react'
import supabase from "./components/SupabaseClient.jsx";
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Recipes from './pages/Recipes';
import Profile from './pages/Profile.jsx';
import Lists from './pages/Lists.jsx';
import ListDisplay from './pages/ListDisplay.jsx';

export default function App() {
  const [session, setSession] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <Navbar />
      <div className="pt-15 w-full flex justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<GuestRoute session={session}><SignIn /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute session={session}><SignUp /></GuestRoute>} />
          <Route path="/recipes" element={<ProtectedRoute session={session}><Recipes /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />
          <Route path="/lists" element={<ProtectedRoute session={session}><Lists /></ProtectedRoute>} />
          <Route path="/lists/:listId" element={<ProtectedRoute session={session}><ListDisplay /></ProtectedRoute>} />
        </Routes>

      </div>
    </Router>
  );

}
