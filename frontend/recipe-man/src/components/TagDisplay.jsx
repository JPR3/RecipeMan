const TagDisplay = ({ tags }) => {
    return (
        <div className="flex flex-wrap gap-2 content-center">
            {tags.map((tag) => (
                <span key={tag} className="bg-fields text-content rounded-full px-1.5 text-xs">
                    {tag}
                </span>
            ))}
        </div>
    );
};

export default TagDisplay;