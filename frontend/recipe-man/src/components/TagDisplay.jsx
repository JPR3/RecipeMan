const TagDisplay = ({ tags, textSize, className }) => {
    console.log(tags)
    return (
        <div className={"flex flex-wrap gap-2 content-center " + (className ?? "")}>
            {tags.map((tag) => (
                <span key={tag} className={"bg-fields text-content rounded-full px-1.5 " + (textSize ?? "text-xs")}>
                    {tag}
                </span>
            ))}
        </div>
    );
};

export default TagDisplay;