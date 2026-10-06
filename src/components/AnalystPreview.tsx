import React from 'react';
import { MatchAnalysis } from './MatchAnalysis';
import { FixtureData, WeeklyCoefficients, MatchProbabilities } from '../types';

interface AnalystPreviewProps {
  fixture: FixtureData;
  cwHome: WeeklyCoefficients;
  cwAway: WeeklyCoefficients;
  dcnHome: number;
  dcnAway: number;
  probs: MatchProbabilities;
}

export const AnalystPreview: React.FC<AnalystPreviewProps> = (props) => {
  return <MatchAnalysis {...props} />;
};
