import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { OperationDay } from '../types';
import { formatBRL } from '../utils/currency';

interface ChartsProps {
  todayData: OperationDay;
}

export function Charts({ todayData }: ChartsProps) {
  if (!todayData || todayData.cycles.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl">
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum dado para exibir no gráfico ainda.
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  // We want cumulative profit over the cycles, but cycles are stored in reverse order (newest first).
  // So we reverse them for the chart.
  let cumulative = 0;
  const chartData = [...todayData.cycles].reverse().map((cycle, index) => {
    cumulative += cycle.totalProfit;
    return {
      name: `C${index + 1}`,
      lucro: cycle.totalProfit,
      acumulado: cumulative,
      isProfit: cumulative >= 0
    };
  });

  // Add initial point
  chartData.unshift({ name: 'Início', lucro: 0, acumulado: 0, isProfit: true });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isProfit = payload[0].value >= 0;
      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700">
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className={`text-sm font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
            Acumulado: {formatBRL(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Evolução do Dia</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888888' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888888' }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#e4e4e7" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="acumulado" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAcumulado)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
