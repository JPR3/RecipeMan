import { createContext, useContext, useState, useEffect } from 'react'
import supabase from './components/SupabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user || null)
            setLoading(false)
        }

        init()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ session, user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
