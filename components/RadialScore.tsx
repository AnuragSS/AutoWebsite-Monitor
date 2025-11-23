import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadialScoreProps {
  score: number;
}

const RadialScore: React.FC<RadialScoreProps> = ({ score }) => {
  const data = [{ name: 'score', value: score }];
  
  let fill = '#22c55e'; // Green
  if (score < 50) fill = '#ef4444'; // Red
  else if (score < 80) fill = '#f59e0b'; // Amber

  return (
    <div className="relative w-full h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={15} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#1e293b' }}
            clockWise
            dataKey="value"
            cornerRadius={10}
            fill={fill}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-xl text-slate-500 font-medium ml-1">/100</span>
        </div>
        <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Health Score</span>
      </div>
    </div>
  );
};

export default RadialScore;