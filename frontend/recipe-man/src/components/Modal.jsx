import { useEffect, useRef } from "react";

const Modal = ({ openModal, closeModal, children }) => {
    const ref = useRef();

    useEffect(() => {
        if (openModal) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [openModal]);

    return (
        <dialog ref={ref} onCancel={closeModal} className="backdrop:bg-black/25 rounded-xl p-0 border-none w-full max-w-md mx-auto my-auto max-h-dvh">
            <div className="bg-background border-2 border-black dark:border-border rounded-xl shadow-xl text-content max-h-dvh">
                <div className="w-full border-b-2 border-border flex justify-end pr-1 py-0.5 text-border">
                    <svg onClick={closeModal} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="var(--color-border)" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                    </svg>
                </div>
                <div className="px-6 w-full h-120 overflow-y-scroll">
                    {children}
                </div>

            </div>
        </dialog>
    );
}

export default Modal;