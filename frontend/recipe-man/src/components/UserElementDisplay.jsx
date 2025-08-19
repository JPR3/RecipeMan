import { capitalizeEachWord } from "../helpers";
import TagDisplay from "./TagDisplay";
const UserElementDisplay = ({ element, onEdit, onDelete, borderStyle, tags }) => {
    return (
        <div className={borderStyle + " flex px-2 py-1 w-full"}>
            <p className="pr-2">{capitalizeEachWord(element.name)}</p>
            {tags && (
                <TagDisplay className="flex-1" tags={tags} />
            )}
            <button className="px-2 hover:text-primary cursor-pointer" onClick={() => onEdit(element)}>Edit</button>
            <button className="px-2 hover:text-red-700 cursor-pointer" onClick={() => onDelete(element)}>Delete</button>
        </div>
    )
}

export default UserElementDisplay;