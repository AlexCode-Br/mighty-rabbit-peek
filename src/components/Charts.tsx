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
      <Card className="border border-white/5 shadow-xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl">
        <CardContent className="p-8 text-center text-zinc-500 font-medium">
          Nenhum dado para exibir no gráfico ainda.
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  let cumulative = 0;
  const chartData = [...todayData.cycles].reverse().map((cycle, index) => {
    cumulative += cycle.totalProfit;
    return {
      name: `Op ${index + 1}`,
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
        <div className="bg-zinc-900/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10">
          <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-1">{label}</p>
          <p className={`text-xl font-black font-mono tracking-tight ${isProfit ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}>
            {formatBRL(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-white/5 shadow-xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Evolução do Dia</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={0} stroke="#ffffff10" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAcumulado)"
                style={{ filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.3))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
