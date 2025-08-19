const TagDisplay = ({ tags, textSize, className, bgColor }) => {
    const alphaTags = tags.sort((a, b) => { return a.localeCompare(b) })
    return (
        <div className={"flex flex-wrap gap-2 content-center " + (className ?? "")}>
            {alphaTags.map((tag) => (
                <span key={tag} className={(bgColor ?? "bg-fields") + " text-content rounded-full px-1.5 " + (textSize ?? "text-xs")}>
                    {tag}
                </span>
            ))}
        </div>
    );
};

export default TagDisplay;