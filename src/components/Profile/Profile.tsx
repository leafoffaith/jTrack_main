import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supaClient } from '../Client/supaClient';
import { useAuth } from '../Client/useAuth';
import { getNumericUserId } from '../Client/userIdHelper';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, BookOpen, Calendar, TrendingUp, Clock } from 'lucide-react';
import dayjs from 'dayjs';

const Profile = () => {
  const navigate = useNavigate();
  const { userId, isLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  
  // Study statistics
  const [totalCards, setTotalCards] = useState(0);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [studyStreak, setStudyStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supaClient.auth.getSession();
      if (!session?.user) {
        setIsAuthenticated(false);
        navigate('/login');
        return;
      }

      setIsAuthenticated(true);
      setEmail(session.user.email || '');
      setUsername(session.user.user_metadata?.username || session.user.email || '');
      setJoinDate(dayjs(session.user.created_at).format('MMMM YYYY'));
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!userId || isLoading) return;

    const fetchStats = async () => {
      const numericUserId = await getNumericUserId(userId);

      // Fetch total cards studied
      const { data: studiedData, error: studiedError } = await supaClient
        .from('studied_flashcards')
        .select('id')
        .eq('user_id', numericUserId);

      if (!studiedError && studiedData) {
        setCardsStudied(studiedData.length);
      }

      // Fetch total available cards (hiragana + katakana + kanji)
      const { data: hiragana } = await supaClient.from('hiragana').select('id');
      const { data: katakana } = await supaClient.from('katakana').select('id');
      const totalAvailable = (hiragana?.length || 0) + (katakana?.length || 0);
      setTotalCards(totalAvailable);

      // Calculate study streak (simplified - consecutive days with study activity)
      const { data: recentStudies } = await supaClient
        .from('studied_flashcards')
        .select('last_studied')
        .eq('user_id', numericUserId)
        .order('last_studied', { ascending: false });

      if (recentStudies && recentStudies.length > 0) {
        let streak = 1;
        let currentDate = dayjs(recentStudies[0].last_studied);
        
        for (let i = 1; i < recentStudies.length; i++) {
          const studyDate = dayjs(recentStudies[i].last_studied);
          const daysDiff = currentDate.diff(studyDate, 'day');
          
          if (daysDiff === 1) {
            streak++;
            currentDate = studyDate;
          } else if (daysDiff > 1) {
            break;
          }
        }
        
        setStudyStreak(streak);
      }

      // Calculate accuracy (simplified - percentage of cards reviewed at least once)
      const accuracy = totalAvailable > 0 ? Math.round((studiedData?.length || 0) / totalAvailable * 100) : 0;
      setAccuracy(accuracy);
    };

    fetchStats();
  }, [userId, isLoading]);

  const handleSignOut = async () => {
    await supaClient.auth.signOut();
    navigate('/');
  };

  if (!isAuthenticated || isLoading) {
    return <div className="flex-1 flex items-center justify-center p-4">Loading...</div>;
  }

  return (
    <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your progress</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{username}</p>
                <p className="text-sm text-muted-foreground">Joined {joinDate}</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={username} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" disabled>Save Changes</Button>
              <Button variant="outline" disabled>Cancel</Button>
            </div>
          </CardContent>
        </Card>

        {/* Study Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Study Statistics</CardTitle>
            <CardDescription>Track your learning progress and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Total Cards</span>
                </div>
                <p className="text-3xl font-bold">{totalCards}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Cards Studied</span>
                </div>
                <p className="text-3xl font-bold">{cardsStudied}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Study Streak</span>
                </div>
                <p className="text-3xl font-bold">{studyStreak} days</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Accuracy</span>
                </div>
                <p className="text-3xl font-bold">{accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Settings - Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Study Settings</CardTitle>
            <CardDescription>Customize your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCardsPerDay">New Cards Per Day</Label>
              <p className="text-sm text-muted-foreground">Maximum number of new cards to study daily</p>
              <Input id="newCardsPerDay" type="number" value="20" disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewLimit">Review Limit</Label>
              <p className="text-sm text-muted-foreground">Maximum reviews per day</p>
              <Input id="reviewLimit" type="number" value="100" disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardFlipSpeed">Card Flip Speed</Label>
              <p className="text-sm text-muted-foreground">Animation duration in milliseconds</p>
              <Input id="cardFlipSpeed" type="number" value="600" disabled />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" disabled>Save Settings</Button>
              <Button variant="outline" disabled>Reset to Default</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that affect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Reset Progress</p>
                <p className="text-sm text-muted-foreground">Clear all study history and statistics</p>
              </div>
              <Button variant="destructive" disabled>Reset</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" disabled>Delete</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleSignOut} size="lg">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
