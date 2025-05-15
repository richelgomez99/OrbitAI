import React, { useState } from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ReflectDashboardContent: React.FC = () => {
  const { addReflection } = useOrbit();
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [journalEntry, setJournalEntry] = useState('');

  const handleSaveReflection = () => {
    if (wins.trim() === '' && struggles.trim() === '' && journalEntry.trim() === '') {
      // Optional: Add some user feedback, e.g., a toast notification
      console.log("No content to save.");
      return; // Don't save if all fields are empty
    }
    addReflection({ wins, struggles, journalEntry });
    // Clear fields after save
    setWins('');
    setStruggles('');
    setJournalEntry('');
    // Optional: Add user feedback, e.g., a toast message "Reflection Saved!"
    console.log("Reflection saved!");
  };
  return (
    <div className="animate-fade-in">
      <div className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Daily Reflection</CardTitle>
            <CardDescription>Take a moment to process your day. What stood out?</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Wins</CardTitle>
              <CardDescription>What went well? What are you proud of?</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="wins-textarea" className="sr-only">Today's Wins</Label>
              <Textarea 
                id="wins-textarea"
                placeholder="List your accomplishments, big or small..."
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                className="min-h-[120px] bg-background/70 border-border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Challenges</CardTitle>
              <CardDescription>What obstacles did you face? What was difficult?</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="struggles-textarea" className="sr-only">Today's Challenges</Label>
              <Textarea 
                id="struggles-textarea"
                placeholder="Describe any setbacks or areas for growth..."
                value={struggles}
                onChange={(e) => setStruggles(e.target.value)}
                className="min-h-[120px] bg-background/70 border-border"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Journal Entry</CardTitle>
            <CardDescription>A space for your thoughts, feelings, and deeper reflections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="journal-textarea" className="sr-only">Journal Entry</Label>
            <Textarea 
              id="journal-textarea"
              placeholder="Write freely about your day, your mood, or anything on your mind..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="min-h-[200px] bg-background/70 border-border"
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveReflection} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Save Reflection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReflectDashboardContent;
