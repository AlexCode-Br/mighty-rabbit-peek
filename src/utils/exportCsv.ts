import { AppData } from '../types';
import { format, parseISO } from 'date-fns';

export const exportToCSV = (data: AppData) => {
  // Cabeçalhos que refletem o layout exato das informações do aplicativo
  const headers = [
    'Data',
    'Hora',
    'Mãe: Entrada',
    'Mãe: Baú',
    'Mãe: Saque',
    'Mãe: Lucro',
    'Filha: Entrada',
    'Filha: Saque',
    'Filha: Lucro',
    'Lucro Total do Ciclo',
    'Status'
  ];

  const rows: string[][] = [];

  // Pega todos os dias do histórico, ordenados do mais recente para o mais antigo
  const sortedDates = Object.keys(data.history).sort((a, b) => b.localeCompare(a));

  sortedDates.forEach((dateKey) => {
    const day = data.history[dateKey];
    const cycles = day.cycles || [];
    
    cycles.forEach((cycle) => {
      const maeOp = cycle.operations.find(op => op.type === 'MAE');
      const filhaOp = cycle.operations.find(op => op.type === 'FILHA');
      
      if (!maeOp || !filhaOp) return;

      // Extrai a data e a hora precisas (se não houver hora exata, usa os dados do dia)
      const dateStr = cycle.createdAt ? format(parseISO(cycle.createdAt), 'dd/MM/yyyy') : format(parseISO(day.date), 'dd/MM/yyyy');
      const timeStr = cycle.createdAt ? format(parseISO(cycle.createdAt), 'HH:mm') : '--:--';

      // Formata como Moeda Real para ficar perfeito na leitura
      const formatCurrency = (val: number | null | undefined) => {
        if (val === null || val === undefined) return '-';
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      const bauStr = maeOp.bau ? 'Sim' : 'Não';
      
      // Classifica o status da operação de forma inteligente
      let statusStr = 'Pendente';
      if (cycle.completed) {
        if (cycle.totalProfit > 0) statusStr = 'Lucro (+)';
        else if (cycle.totalProfit < 0) statusStr = 'Prejuízo (-)';
        else statusStr = 'Empate';
      }

      // Adiciona a linha seguindo exatamente a ordem dos cabeçalhos
      rows.push([
        dateStr,
        timeStr,
        formatCurrency(maeOp.deposit),
        bauStr,
        formatCurrency(maeOp.withdraw),
        formatCurrency(maeOp.profit),
        formatCurrency(filhaOp.deposit),
        formatCurrency(filhaOp.withdraw),
        formatCurrency(filhaOp.profit),
        formatCurrency(cycle.totalProfit),
        statusStr
      ]);
    });
  });

  // Transforma em CSV usando ponto-e-vírgula para o Excel BR reconhecer as colunas corretamente
  const csvContent = [
    headers.join(';'),
    // Envolvemos as células em aspas para garantir que os espaços de "R$" não quebrem o CSV
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  // Adiciona o BOM (Byte Order Mark) invisível que força o Excel a ler a acentuação em UTF-8 perfeitamente
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Rotina de download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `TradeTracker_Planilha_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};