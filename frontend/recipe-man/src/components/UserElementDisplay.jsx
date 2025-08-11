import { capitalizeEachWord } from "../helpers";
const UserElementDisplay = ({ element, onEdit, onDelete, borderStyle }) => {
    return (
        <div className={borderStyle + " flex px-2 py-1 w-full"}>
            <p className="flex-1">{capitalizeEachWord(element.name)}</p>
            <button className="px-2 hover:text-primary cursor-pointer" onClick={() => onEdit(element)}>Edit</button>
            <button className="px-2 hover:text-red-700 cursor-pointer" onClick={() => onDelete(element)}>Delete</button>
        </div>
    )
}

export default UserElementDisplay;