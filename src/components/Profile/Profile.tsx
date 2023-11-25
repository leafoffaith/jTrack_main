import { useState, useEffect } from 'react'
import { supaClient } from '../Client/supaClient'
import Navbar from '../Navbar/Navbar'
import StatsPage from './Stats'
import { Link } from 'react-router-dom'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)

  useEffect(() => {
    async function getProfile() {
      setLoading(true)
      const { user } = session

      let { data, error } = await supaClient
        .from('auth.users')
        .select(`username, website, avatar_url`)
        .single()

      if (error) {
        console.warn(error)
      } else if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }

      setLoading(false)
    }

    getProfile()
  }, [session])

  async function updateProfile(event, avatarUrl) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      username,
      website,
      avatarUrl,
      updated_at: new Date(),
    }

    let { error } = await supaClient.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    } else {
      setAvatarUrl(avatarUrl)
    }
    setLoading(false)
  }

  return (
    <>
    <div>
      <Navbar />
    </div>
    <div style={{
      marginTop: '5rem',
    }}>
      <h1>Welcome back Shaurya Dey!</h1>
    <div className='flashcard card'>
      <StatsPage />
      <h4>Upcoming reviews</h4>
      <hr />
            <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        textAlign: 'center',
        gap: '10px',
      }}>
        <div>
          <h2>Kanji Mastered</h2>
          <h3>20</h3>
        </div>
        <div>
          <h2>Vocabulary Mastered</h2>
          <h3>37</h3>
        </div>
        <div>
          <h2>Study Streak</h2>
          <h3>10</h3>
        </div>
      </div>
      
    </div>
        {/* Link to awards page */}
      <Link to="/awards">View Achievements</Link>
    <form onSubmit={updateProfile} style={{
      maxWidth: '40%',
      margin: '0 auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h3>Change your account details</h3>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          required
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Password</label>
        <input
          id="website"
          type="url"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button className="button block primary" type="submit" disabled={loading}>
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" type="button" onClick={() => supaClient.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </form>
    </div>
    
    </>
  )
}