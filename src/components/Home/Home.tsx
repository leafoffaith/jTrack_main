//create Home component that will use the navbar component

//silence the error for now
// eslint-disable-next-line
import Navbar from "../Navbar/Navbar";
import "./Home.css";

const Home = () => {

    return (
        <div className="home">
            <Navbar />
        </div>
    );
}

export default Home;

