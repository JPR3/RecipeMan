import { useEffect, useState } from 'react';
import { useAuth } from "../AuthProvider";
import { Link } from 'react-router-dom';

const Lists = () => {
    const [lists, setLists] = useState([]);
    const [tab, setTab] = useState(0)
    const { session, user, loading } = useAuth();
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
    }

    const accessToken = session?.access_token;
    const uid = user?.id;

    useEffect(() => {
        fetch(`http://localhost:3000/api/users/${uid}/lists`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(data => {
            setLists(data);
        });
    }, [accessToken]);

    return (
        <div className="flex flex-col justify-start items-center w-full px-16 gap-2">
            <h1 className="text-5xl font-semibold text-content pb-4">Lists</h1>
            <div className="w-full flex justify-center items-end max-w-3/4">
                <div className="flex flex-col w-full gap-2 overflow-auto max-h-dvh">
                    {
                        lists.map((list, index) => (
                            <div key={index} className="border-b-2 w-full border-border flex pb-2">
                                <Link to={`/lists/${list.id}`} className="w-full hover:underline">
                                    {list.title}
                                </Link>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div >
    )
}

export default Lists;