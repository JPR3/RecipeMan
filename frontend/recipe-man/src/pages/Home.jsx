import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import lists_dark from '../assets/Lists-Dark.png'
import lists_light from '../assets/Lists-Light.png'
import recipes_dark from '../assets/Recipes-Dark.png'
import recipes_light from '../assets/Recipes-Light.png'
import together_dark from '../assets/Together-Dark.png'
import together_light from '../assets/Together-Light.png'
import profile_dark from '../assets/Profile-Dark.png'
import profile_light from '../assets/Profile-Light.png'
import logo from '../assets/Logo.png'

const Home = () => {
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();
    const navigate = useNavigate();
    return (
        <div className="flex flex-col w-full items-center">
            <img src={logo} className="h-24" />
            <h1 className="text-5xl font-semibold text-primary mb-4">RecipeMan</h1>
            <div className="w-full flex justify-center mb-8">
                <div className="flex border-border border-2 bg-surface text-content px-2 py-2 rounded-lg ">
                    <p className="text-content text-xl content-center">Save and manage all your recipes and shopping lists in one place<br />
                        Seamlessly create shopping lists based on the ingredients you need for your recipes<br />
                        Organize your ingredients and recipes with customizable tags<br />
                        Create custom ingredients and measurement units to fit your needs</p>
                </div>
            </div>
            <div className="w-full flex justify-end mb-8">
                <div className="flex border-border border-t-2 border-b-2 border-l-2 bg-surface text-content px-2 py-2 rounded-l-lg max-w-11/12 gap-8">
                    <img
                        src={theme === "dark" ? recipes_dark : recipes_light}
                        className="max-w-full max-h-full h-75 rounded-lg border-1 border-border"
                    />
                    <p className="text-content text-xl content-center">[recipes info] Use the 'recipes' page to view, edit, and create new recipes<br />
                        Search and filter recipes by tags to find exactly what you're looking for<br />
                        Scale recipes to adjust ingredient quantities based on your needs<br />
                        {"Tip: You can use {{double brackets}} around a number in the instructions of your recipe to enable scaling"}</p>

                </div>
            </div>
            <div className="w-full flex justify-start mb-8">
                <div className="flex border-border border-t-2 border-b-2 border-r-2 bg-surface text-content px-2 py-2 rounded-r-lg max-w-11/12 gap-8">
                    <p className="text-content text-xl content-center">[Lists info] Use the 'lists' page to make and manage your shopping lists<br />
                        List items can be sorted by tags for easy organization<br />
                        Multiple instances of the same item with compatible units will be automatically converted</p>
                    <img
                        src={theme === "dark" ? lists_dark : lists_light}
                        className="h-50 rounded-lg border-1 border-border"
                    />
                </div>
            </div>
            <div className="w-full flex justify-end mb-8">
                <div className="flex border-border border-t-2 border-b-2 border-l-2 bg-surface text-content px-2 py-2 rounded-l-lg max-w-11/12 gap-8">
                    <img
                        src={theme === "dark" ? together_dark : together_light}
                        className="h-50 rounded-lg border-1 border-border"
                    />
                    <p className="text-content text-xl content-center">[Bringing it together] Use the 'Add to list' button when viewing a list to easily add all of the necessary ingredients to your lists<br />
                        Or, use the 'From Recipe' button when viewing a list to select ingredients from any of your saved recipes</p>
                </div>
            </div>
            <div className="w-full flex justify-start mb-8">
                <div className="flex border-border border-t-2 border-b-2 border-r-2 bg-surface text-content px-2 py-2 rounded-r-lg max-w-11/12 gap-8">
                    <p className="text-content text-xl content-center">Create and manage custom ingredients, tags, and units from the profile page<br />
                        These can also be created while adding to a recipe or list!</p>
                    <img
                        src={theme === "dark" ? profile_dark : profile_light}
                        className="h-50 rounded-lg border-1 border-border"
                    />
                </div>

            </div>
            {!user &&
                <button
                    className="mb-16 font-semibold text-2xl py-2 px-4 rounded-md bg-primary hover:bg-primary-hv text-content cursor-pointer"
                    onClick={() => navigate('/signup')}
                >
                    Get Started
                </button>
            }
        </div>
    );
};

export default Home;