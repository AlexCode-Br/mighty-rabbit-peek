import { AppData } from '../types';
import { format } from 'date-fns';

export const exportToCSV = (data: AppData) => {
  const rows: string[] = [];
  rows.push('Data,Ciclo,Operação,Depósito,Saque,Lucro');

  Object.values(data.history).forEach((day) => {
    const dateStr = format(new Date(day.date), 'dd/MM/yyyy');
    
    day.cycles.forEach((cycle, index) => {
      cycle.operations.forEach((op) => {
        rows.push(`${dateStr},Ciclo ${index + 1},${op.type},${op.deposit},${op.withdraw ?? ''},${op.profit}`);
      });
    });
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `controle_ciclos_${format(new Date(), 'yyyyMMdd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
