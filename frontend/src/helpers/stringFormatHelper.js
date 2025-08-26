export const capitalizeEachWord = (str) => {
    // Convert the entire string to lowercase to handle cases where input might have mixed casing
    const words = str.toLowerCase().split(' ');

    for (let i = 0; i < words.length; i++) {
        // Check if the word is not empty to avoid errors with multiple spaces
        if (words[i].length > 0) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
    }

    return words.join(' ');
}