import { capitalizeEachWord } from "../helpers";
import TagDisplay from "./TagDisplay";
const UserElementDisplay = ({ element, onEdit, onDelete, borderStyle, tags }) => {
    return (
        <div className={borderStyle + " flex px-2 py-1 w-full gap-1 items-center"}>
            <p className={"pr-2 " + ((tags) ? "" : " flex-1")}>{capitalizeEachWord(element.name)}</p>
            {tags && (
                <TagDisplay className="flex-1" tags={tags} />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square hover:fill-primary cursor-pointer" viewBox="0 0 16 16" onClick={() => onEdit(element)}>
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
            </svg>
            <svg onClick={() => onDelete(element)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="bi bi-x fill-content hover:fill-red-700 cursor-pointer" viewBox="0 0 14 14">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
        </div>
    )
}

export default UserElementDisplay;