import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Construction } from 'lucide-react';

const KanjiScheduler = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/learn')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Decks
            </Button>
          </div>

          {/* Under Construction Card */}
          <div className="flex items-center justify-center py-16">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center space-y-6">
                <Construction className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Under Construction</h2>
                  <p className="text-muted-foreground">
                    The Kanji study mode is currently under development. Check back soon!
                  </p>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate('/learn')}>
                  Back to Decks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanjiScheduler;
