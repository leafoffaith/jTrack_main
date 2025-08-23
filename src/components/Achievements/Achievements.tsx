/**
 * Achievements page with a list of achievements
 * User will achieve milestones based on their progress
 * Each milestone will be shown in the form for badge component that will be a png of a badge
    * @author Shaurya Dey s.dey2@ncl.ac.uk
    * @Purpose This component renders the achievements page
    * @PARAM none
    * @Reference https://dev.to/hackmamba/building-an-outstanding-learning-and-achievement-dashboard-with-pink-design-nextjs-44f4
    * @Returns Achievements page
 */

import Navbar from "../Navbar/Navbar";

export const Achievements = () => {

    const achievements = [
        {
            title: "First review",
            description: "You have completed your first review!",
            status: "unlocked",
        },
        {
            title: "10 reviews",
            description: "You have completed 10 reviews!",
            status: "unlocked",
        },
        {
            title: "50 reviews",
            description: "You have completed 50 reviews!",
            status: "unlocked",
        },
        {
            title: "100 reviews",
            description: "You have completed 100 reviews!",
            status: "locked"
        },
        {
            title: "500 reviews",
            description: "You have completed 500 reviews!",
            status: "locked"
        },
        {
            title: "1000 reviews",
            description: "You have completed 1000 reviews!",
            status: "locked"
        }
    ]

    return (
        <>
        <div className="header-navbar">
            <Navbar />
        </div>
         <div
            className='u-flex'
            style={{
                marginTop: '0px',
                boxShadow: 'var(--shadow-small)',
                paddingTop: '0px',
                paddingBottom: '0px',

            }}
        >
            <section
                style={{    
                    paddingTop: '33px',
                    paddingBottom: '20px',
                    width: '100%',
                    borderBottom: '1px solid #020101',

                }}
            >
                <div className='u-flex u-cross-center'>
                    <p
                        className='icon-academic-cap'
                    ></p>
                    <h5 className='u-bold'>Total achievements earned</h5>
                </div>
                <h1
                    className='u-bold'
                    style={{ fontSize: '80px', color: '#5D5FEF', 
                    marginTop: '0px', marginBottom: '0px'
                }}
                >
                    3
                </h1>
            </section>
            <section 
                style={{
                    marginTop: '0px',
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    width: '100%',
                    borderBottom: '1px solid #020101',
                }}
            >
                    <div className="grid-container">
                    {achievements.map((achievement, index) => (
                        // if locked, display locked badge
                        achievement.status === "locked" ? (
                            <div className="grid-item" key={index}>
                                <div className="locked-layer" >
                                    {/* Display achievement badge here */}
                                    <h3>{achievement.title}</h3>
                                    <p>{achievement.description}</p>
                                </div>
                            </div>
                        ) : (
                        // if unlocked, display unlocked badge
                        <div className="grid-item card" key={index}>
                        {/* Display unlocked badge here */}
                        <h3>{achievement.title}</h3>
                        <p>{achievement.description}</p>
                        {/* You can also add an image or icon for the badge */}
                        </div>
                    )    
                    

                    // <div className="grid-item" key={index}>
                    // {/* Display achievement badge here */}
                    // <h3>{achievement.title}</h3>
                    // <p>{achievement.description}</p>
                    // {/* You can also add an image or icon for the badge */}
                    // </div>
                ))}
            </div>
            </section>       
            </div>
        </>
       
    );
};
export default Achievements;
