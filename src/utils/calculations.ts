/**
 * Trata precisão de ponto flutuante para somas e subtrações financeiras.
 */
const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const calculateOperationProfit = (
  deposit: number, 
  withdraw: number | null, 
  isMae: boolean = false, 
  hasBau: boolean = false
): number => {
  if (withdraw === null) return 0;
  const finalWithdraw = (isMae && hasBau) ? withdraw + 20 : withdraw;
  return roundToTwoDecimals(finalWithdraw - deposit);
};

export const calculateCycleProfit = (maeProfit: number, filhaProfit: number): number => {
  return roundToTwoDecimals(maeProfit + filhaProfit);
};

export const calculateDailyProfit = (cycles: readonly { readonly totalProfit: number }[]): number => {
  return roundToTwoDecimals(cycles.reduce((acc, cycle) => acc + cycle.totalProfit, 0));
};

export const checkDailyStatus = (dailyProfit: number, dailyGoal: number, stopLoss: number) => {
  return {
    goalReached: dailyGoal > 0 && dailyProfit >= dailyGoal,
    stopLossReached: stopLoss > 0 && dailyProfit <= -stopLoss,
  };
};