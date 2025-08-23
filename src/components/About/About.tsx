/**
 * @fileoverview About page for the application.
 * @author Shaurya Dey s.dey2@ncl.ac.uk
 */
import Navbar from "../Navbar/Navbar";

const About = () => {
    return (
        <>
            <div className="header-navbar">
                <Navbar />
            </div>
            {/* iFrame that spans half the width of the page */}
            {/* <iframe src=""></iframe> */}
            <iframe width="" height="" src="https://guidetojapanese.org/learn/" title="Grammar Guide" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </>
    );
};

export default About;