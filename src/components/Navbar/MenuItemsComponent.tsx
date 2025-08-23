import Dropdown from "./Dropdown/Dropdown";
import { Link } from "react-router-dom";

//define what the props are
interface MenuItemsProps {
    title: string;
    url: string;
}

//ensure props contain title and url
const MenuItemsComponent: React.FC<MenuItemsProps> = (items): JSX.Element => {
    return (
        <div className="navbar__right">
            <Link to={items.url} className="link">
                <span className="navbar__right__item">{items.title}</span>
            </Link>
        </div>
    )
}


export default MenuItemsComponent;