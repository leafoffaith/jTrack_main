/**
 * Stats component that renders the user's stats
 * Take all the stats from the database, show for the user
 */


import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const StatsPage = () => {
// Data for user upcoming reviews not more than 7 days in the future and not more than 50 reviews per user
const reviewData = [{
    name: '21/09',
    reviews: 30,
},
{
    name: '22/09',
    reviews: 20,
},
{
    name: '23/09',
    reviews: 50,
},
{
    name: '24/09',
    reviews: 35,
},
{
    name: '25/09',
    reviews: 40,
},
{
    name: '26/09',
    reviews: 80,
},
{
    name: '27/09',
    reviews: 90,
}
]


const renderLineChart = (
//  <ResponsiveContainer width="75%" height="50%">
  <LineChart width={712} height={300} data={reviewData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
    <Line type="monotone" dataKey="reviews" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <XAxis dataKey='name' />
    <YAxis />
    <Tooltip />
  </LineChart>
// </ResponsiveContainer>
);

return (
    <div className="stats">
        <div className="stats__chart">
            {renderLineChart}
        </div>
    </div>
)
}

export default StatsPage;
