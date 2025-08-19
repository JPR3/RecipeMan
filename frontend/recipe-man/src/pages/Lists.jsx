import { useEffect, useState } from 'react';
import { useAuth } from "../AuthProvider";
import { Link } from 'react-router-dom';
import NewListModal from '../components/NewListModal';
import DeleteListModal from '../components/DeleteListModal';

const Lists = () => {
    const [lists, setLists] = useState([]);
    const [newModal, setNewModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalData, setDeleteModalData] = useState({ id: "-1", title: "" })
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
    }, [accessToken, deleteModal]);

    const handleDelete = (list) => {
        setDeleteModalData({ id: list.id, title: list.title })
        setDeleteModal(true)
    }
    return (
        <div className="flex flex-col justify-start items-center w-full px-16 gap-2">
            <NewListModal
                openModal={newModal}
                closeModal={() => setNewModal(false)}
                existingLists={lists.map(l => l.title)}
            />
            <DeleteListModal
                openModal={deleteModal}
                closeModal={() => { setDeleteModal(false); setDeleteModalData({ id: "-1", title: "" }) }}
                listId={deleteModalData.id}
                listTitle={deleteModalData.title}
            />
            <h1 className="text-5xl font-semibold text-content mb-2">Lists</h1>
            <button
                className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 mb-2"
                onClick={() => setNewModal(true)}>
                New+
            </button>
            <div className="w-full flex justify-center items-end max-w-3/4">
                <div className="flex flex-col w-full gap-2 overflow-auto max-h-dvh">
                    {
                        lists.map((list, index) => (
                            <div key={index} className="border-b-2 w-full border-border flex pb-2 items-center">
                                <Link to={`/lists/${list.id}`} className="w-full hover:underline">
                                    {list.title}
                                </Link>
                                <svg onClick={() => handleDelete(list)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="bi bi-x fill-content hover:fill-red-700 cursor-pointer" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                </svg>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div >
    )
}

export default Lists;