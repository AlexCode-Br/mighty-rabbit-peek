export const calculateOperationProfit = (deposit: number, withdraw: number | null): number => {
  if (withdraw === null) return 0;
  return withdraw - deposit;
};

export const calculateCycleProfit = (maeProfit: number, filhaProfit: number): number => {
  return maeProfit + filhaProfit;
};

export const calculateDailyProfit = (cycles: { totalProfit: number }[]): number => {
  return cycles.reduce((acc, cycle) => acc + cycle.totalProfit, 0);
};

export const checkDailyStatus = (dailyProfit: number, dailyGoal: number, stopLoss: number) => {
  return {
    goalReached: dailyProfit >= dailyGoal,
    stopLossReached: dailyProfit <= -stopLoss,
  };
};
