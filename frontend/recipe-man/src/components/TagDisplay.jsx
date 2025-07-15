const TagDisplay = ({ tags }) => {
    return (
        <div className="flex flex-wrap gap-2 content-center">
            {tags.map((tag) => (
                <span key={tag.id} className="bg-fields text-content rounded-full px-1.5 text-xs">
                    {tag.name}
                </span>
            ))}
        </div>
    );
};

export default TagDisplay;