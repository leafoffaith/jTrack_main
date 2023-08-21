import {ProgressDeck} from 'react-progress-deck'

export const Progress = () => {
    return (
        < ProgressDeck
        description="Check in 5 different place in canada"
        title="Monthly Hiking"
        size = {350}
        progressBackgroundColor = "#ffebee"
        progressForegroundColor = "#ef9a9a"
        percentage = {0.5}
      />
    )
}