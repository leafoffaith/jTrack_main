//create navbar component
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import Dropdown from "./Dropdown/Dropdown";
import { menuItems } from "./menuItems";
import SuperMemoTest from "../SuperMemo/SuperMemoTest";
import MenuItemsComponent from "./MenuItemsComponent";

const Navbar = () => {
    //dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //toggle dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    return (

        <div className="navbar">
            <div className="navbar__left">
                <Link to="/" className="link">
                    <span className="logo">JTrack</span>
                </Link>
            </div>
            {menuItems.map((item, index) => {
                return (
                    <MenuItemsComponent title={item.title} url={item.url} key={index} />
                )
            })}
             <span className="navbar__right__item input-container">
             <input id="Search" type="text" placeholder="Search for Kanji, Sentences and more" className="input-field" />
             </span>
        </div>
    );
};

export default Navbar;