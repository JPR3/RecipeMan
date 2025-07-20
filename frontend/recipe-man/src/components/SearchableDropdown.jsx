import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';

const SearchableDropdown = ({ ingredientPart, apiPath, onChangeEvent, index, fieldValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localVal, setLocalVal] = useState('');
    return (
        <div className='grid'>
            <input
                type="text"
                id={ingredientPart + "_" + index}
                name={ingredientPart + "_" + index}
                className="border border-border bg-fields text-content w-20 rounded-md h-6.5"
                // This can be a string instead of e.target.value, to override with dropdown selection!
                onChange={(e) => onChangeEvent(e.target.value)}
                value={fieldValue}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
            />
            {/* <button type="button" onClick={(e) => onChangeEvent("pie")}>pie button</button> */}
            {isOpen && (
                <div className="border border-border bg-fields text-content w-20 rounded-md h-6.5">Testing</div>
            )}
        </div>
    )
}

export default SearchableDropdown;