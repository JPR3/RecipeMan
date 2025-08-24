import { useEffect, useState } from 'react';
import { useAuth } from "../AuthProvider";
import { Link } from 'react-router-dom';
import NewListModal from '../components/NewListModal';
import DeleteListModal from '../components/DeleteListModal';
import EditListModal from '../components/EditListModal';

const Lists = () => {
    const [lists, setLists] = useState([]);
    const [newModal, setNewModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteModalData, setDeleteModalData] = useState({ id: "-1", title: "" })
    const [editModal, setEditModal] = useState(false)
    const [editModalData, setEditModalData] = useState({ id: "-1", title: "" })
    const [width, setWidth] = useState(0)
    const { session, user, loading } = useAuth();
    if (loading) {
        return <div className="text-content p-4">Loading...</div>;
    }

    const accessToken = session?.access_token;
    const uid = user?.id;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => setWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        if (deleteModal || newModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            fetch(`http://localhost:3000/api/users/${uid}/lists`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => response.json()).then(data => {
                setLists(data);
            });
        }
    }, [accessToken, deleteModal, newModal, editModal]);

    const handleDelete = (list) => {
        setDeleteModalData({ id: list.id, title: list.title })
        setDeleteModal(true)
    }
    return (
        <div className="flex flex-col justify-start items-center w-full gap-2">
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
            <EditListModal
                openModal={editModal}
                closeModal={() => { setEditModal(false); setEditModalData({ id: "-1", title: "" }) }}
                existingLists={lists.map(l => l.title)}
                oldTitle={editModalData.title}
                listId={editModalData.id}
            />
            <h1 className="text-5xl font-semibold text-content mb-2">Lists</h1>
            <button
                className="cursor-pointer border border-border rounded-2xl bg-primary hover:bg-primary-hv px-2 mb-2"
                onClick={() => setNewModal(true)}>
                New+
            </button>
            <div className={"w-full flex justify-center items-end " + ((width < 768) ? "max-w-7/8" : "max-w-5/8")}>
                <div className="flex flex-col w-full gap-2 overflow-auto max-h-dvh">
                    {
                        lists.map((list, index) => (
                            <div key={index} className="border-b-2 w-full border-border flex pb-2 items-center">
                                <Link to={`/lists/${list.id}`} className="w-full hover:underline text-lg">
                                    {list.title}
                                </Link>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square hover:fill-primary cursor-pointer" viewBox="0 0 16 16" onClick={() => { setEditModalData({ id: list.id, title: list.title }); setEditModal(true) }}>
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                </svg>
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