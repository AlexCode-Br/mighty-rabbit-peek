import { AppData } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (data: AppData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let cursorY = 0;

  // --- CORES DA PALETA ---
  const colors = {
    textMain: [24, 24, 27],     // zinc-900
    textMuted: [113, 113, 122], // zinc-500
    textLight: [161, 161, 170], // zinc-400
    border: [228, 228, 231],    // zinc-200
    bgLight: [250, 250, 250],   // zinc-50
    profit: [16, 185, 129],     // emerald-500
    loss: [244, 63, 94],        // rose-500
  };

  const applyColor = (type: 'text' | 'fill' | 'draw', color: number[]) => {
    if (type === 'text') doc.setTextColor(color[0], color[1], color[2]);
    if (type === 'fill') doc.setFillColor(color[0], color[1], color[2]);
    if (type === 'draw') doc.setDrawColor(color[0], color[1], color[2]);
  };

  // --- FILTRAGEM DE DADOS VALIDOS ---
  const validDays = Object.values(data.history)
    .filter(day => day.cycles && day.cycles.length > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- 1. CABEÇALHO EXECUTIVO ---
  cursorY = 20;
  
  applyColor('text', colors.textMain);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TradeTracker', 15, cursorY);

  applyColor('text', colors.textMuted);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Performance Operacional', 15, cursorY + 6);

  const todayStr = format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR });
  const timeStr = format(new Date(), "HH:mm");
  
  applyColor('text', colors.textLight);
  doc.setFontSize(9);
  doc.text(`Gerado em: ${todayStr} às ${timeStr}`, pageWidth - 15, cursorY + 6, { align: 'right' });

  cursorY += 12;

  applyColor('draw', colors.border);
  doc.setLineWidth(0.5);
  doc.line(15, cursorY, pageWidth - 15, cursorY);
  
  cursorY += 12;

  // --- 2. CÁLCULO DE ESTATÍSTICAS GERAIS ---
  let totalProfit = 0;
  let totalCycles = 0;
  let winningCycles = 0;

  validDays.forEach(day => {
    day.cycles.forEach(cycle => {
      if (cycle.completed) {
        totalCycles++;
        totalProfit += cycle.totalProfit;
        if (cycle.totalProfit > 0) winningCycles++;
      }
    });
  });

  const winRate = totalCycles > 0 ? ((winningCycles / totalCycles) * 100).toFixed(1) : '0.0';

  // --- 3. CARTÕES DE RESUMO (KPIs) ---
  const drawKpiCard = (x: number, y: number, w: number, title: string, value: string, isCurrency = false, profitStatus?: 'win' | 'loss' | 'neutral') => {
    const h = 26;
    
    applyColor('fill', colors.bgLight);
    applyColor('draw', colors.border);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');

    applyColor('text', colors.textMuted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), x + 6, y + 8);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    
    if (profitStatus === 'win') applyColor('text', colors.profit);
    else if (profitStatus === 'loss') applyColor('text', colors.loss);
    else applyColor('text', colors.textMain);

    doc.text(value, x + 6, y + 19);

    if (isCurrency && profitStatus) {
      doc.setFontSize(10);
      const sign = profitStatus === 'win' ? '+' : '';
      doc.text(sign, x + 4, y + 19);
    }
  };

  const cardW = (pageWidth - 40) / 3;
  
  const profitStr = `R$ ${Math.abs(totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pStatus = totalProfit > 0 ? 'win' : totalProfit < 0 ? 'loss' : 'neutral';
  
  drawKpiCard(15, cursorY, cardW, 'Lucro Líquido Total', profitStr, true, pStatus);
  drawKpiCard(15 + cardW + 5, cursorY, cardW, 'Taxa de Acerto', `${winRate}%`);
  drawKpiCard(15 + (cardW * 2) + 10, cursorY, cardW, 'Ciclos Finalizados', `${totalCycles}`);

  cursorY += 40;

  // --- 4. GRÁFICO DE BARRAS INTELIGENTE (Últimos 7 dias válidos) ---
  const chartDays = validDays.slice(-7);

  applyColor('text', colors.textMain);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Evolução Recente (Últimos dias operados)', 15, cursorY);
  
  cursorY += 8;
  
  const chartHeight = 45;
  const chartWidth = pageWidth - 30;
  
  applyColor('fill', colors.bgLight);
  applyColor('draw', colors.border);
  doc.roundedRect(15, cursorY, chartWidth, chartHeight, 3, 3, 'FD');

  if (chartDays.length > 0) {
    const maxAbsVal = Math.max(...chartDays.map(d => Math.abs(d.dailyProfit)), 10);
    const zeroY = cursorY + (chartHeight / 2);
    
    applyColor('draw', colors.textLight);
    doc.setLineWidth(0.5);
    doc.line(15, zeroY, 15 + chartWidth, zeroY);

    // Usa setLineDashPattern ao invés de setDrawDashPattern
    doc.setLineDashPattern([1, 2], 0);
    applyColor('draw', colors.border);
    doc.setLineWidth(0.3);
    doc.line(15, cursorY + 10, 15 + chartWidth, cursorY + 10);
    doc.line(15, cursorY + chartHeight - 10, 15 + chartWidth, cursorY + chartHeight - 10);
    doc.setLineDashPattern([], 0); // Reseta para linha sólida

    const barSpacing = chartWidth / Math.max(chartDays.length, 7);
    const maxBarHeight = (chartHeight / 2) - 8;
    const barWidth = 8;

    chartDays.forEach((day, index) => {
      const isProfit = day.dailyProfit >= 0;
      const barH = (Math.abs(day.dailyProfit) / maxAbsVal) * maxBarHeight;
      
      const startX = 15 + ((chartWidth - (chartDays.length * barSpacing)) / 2);
      const barX = startX + (index * barSpacing) + (barSpacing / 2) - (barWidth / 2);
      
      const barY = isProfit ? zeroY - barH : zeroY;

      if (day.dailyProfit !== 0) {
        if (isProfit) applyColor('fill', colors.profit);
        else applyColor('fill', colors.loss);
        
        doc.rect(barX, barY, barWidth, Math.max(barH, 1), 'F');
      }

      applyColor('text', colors.textMuted);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const dayLabel = format(parseISO(day.date), 'dd/MM');
      doc.text(dayLabel, barX + (barWidth / 2), cursorY + chartHeight - 2, { align: 'center' });
      
      if (day.dailyProfit !== 0) {
        if (isProfit) applyColor('text', colors.profit);
        else applyColor('text', colors.loss);
        
        doc.setFont('helvetica', 'bold');
        let valLabel = Math.abs(day.dailyProfit).toFixed(0);
        if (Math.abs(day.dailyProfit) >= 1000) valLabel = (Math.abs(day.dailyProfit) / 1000).toFixed(1).replace('.0', '') + 'k';
        
        const textY = isProfit ? barY - 2 : barY + barH + 4;
        doc.text(`${isProfit ? '+' : '-'}${valLabel}`, barX + (barWidth / 2), textY, { align: 'center' });
      }
    });
  } else {
    applyColor('text', colors.textLight);
    doc.setFontSize(9);
    doc.text('Não há operações suficientes para gerar o gráfico.', pageWidth / 2, cursorY + (chartHeight/2), { align: 'center' });
  }

  cursorY += chartHeight + 15;

  const defaultTableStyles = {
    theme: 'plain' as const,
    styles: { 
      font: 'helvetica', 
      fontSize: 9, 
      cellPadding: 4,
      textColor: colors.textMain 
    },
    headStyles: { 
      fillColor: colors.bgLight, 
      textColor: colors.textMuted, 
      fontStyle: 'bold' as const,
      lineWidth: { bottom: 0.5 },
      lineColor: colors.border
    },
    bodyStyles: {
      lineWidth: { bottom: 0.1 },
      lineColor: colors.border
    },
    margin: { left: 15, right: 15 },
  };

  // --- 5. TABELA DE RESUMO DIÁRIO ---
  applyColor('text', colors.textMain);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Diário (Filtrado)', 15, cursorY);
  cursorY += 5;

  const dailyTableData: any[][] = [];
  const dailyGoal = data.settings.dailyGoal;

  const tableDays = [...validDays].reverse();

  tableDays.forEach((day) => {
    const dateStr = format(parseISO(day.date), 'dd/MM/yyyy');
    const profit = day.dailyProfit;
    const formatCurr = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const percent = dailyGoal > 0 ? (profit / dailyGoal) * 100 : 0;
    const percentStr = dailyGoal > 0 ? `${percent.toFixed(0)}%` : '-';
    
    let status = 'Empate';
    if (profit > 0 && dailyGoal > 0 && profit >= dailyGoal) status = 'Meta Batida';
    else if (profit > 0) status = 'Lucro';
    else if (profit < 0) status = 'Loss';

    dailyTableData.push([
      dateStr,
      day.cycles.length.toString(),
      formatCurr(profit),
      percentStr,
      status
    ]);
  });

  autoTable(doc, {
    ...defaultTableStyles,
    startY: cursorY,
    head: [['Data', 'Ciclos', 'Resultado', '% Meta', 'Status']],
    body: dailyTableData,
    columnStyles: {
      1: { halign: 'center' },
      2: { fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const statusVal = data.row.raw[4];
        if (statusVal === 'Meta Batida' || statusVal === 'Lucro') {
          if (data.column.index === 2 || data.column.index === 4) {
            data.cell.styles.textColor = colors.profit;
          }
        } else if (statusVal === 'Loss') {
          if (data.column.index === 2 || data.column.index === 4) {
            data.cell.styles.textColor = colors.loss;
          }
        }
      }
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 15;

  if (cursorY > pageHeight - 40) {
    doc.addPage();
    cursorY = 20;
  }

  // --- 6. TABELA DE DETALHAMENTO DE CICLOS ---
  applyColor('text', colors.textMain);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento de Operações', 15, cursorY);
  cursorY += 5;

  const detailData: any[][] = [];
  
  tableDays.forEach((day) => {
    (day.cycles || []).forEach(cycle => {
      const maeOp = cycle.operations.find(op => op.type === 'MAE');
      const filhaOp = cycle.operations.find(op => op.type === 'FILHA');
      if (!maeOp || !filhaOp) return;

      const dateStr = cycle.createdAt ? format(parseISO(cycle.createdAt), 'dd/MM/yy') : format(parseISO(day.date), 'dd/MM/yy');
      const timeStr = cycle.createdAt ? format(parseISO(cycle.createdAt), 'HH:mm') : '--:--';
      
      const fC = (val: number | null) => val !== null ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
      
      detailData.push([
        `${dateStr}  ${timeStr}`,
        `Ent: ${fC(maeOp.deposit)}  |  Saq: ${fC(maeOp.withdraw)}`,
        `Ent: ${fC(filhaOp.deposit)}  |  Saq: ${fC(filhaOp.withdraw)}`,
        fC(cycle.totalProfit),
        cycle.completed ? (cycle.totalProfit >= 0 ? 'LUCRO' : 'LOSS') : 'PENDENTE'
      ]);
    });
  });

  autoTable(doc, {
    ...defaultTableStyles,
    startY: cursorY,
    head: [['Data / Hora', 'Operação Mãe', 'Operação Filha', 'Total do Ciclo', 'Status']],
    body: detailData,
    columnStyles: {
      3: { fontStyle: 'bold', halign: 'right' },
      4: { fontStyle: 'bold', halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const statusVal = data.row.raw[4];
        if (statusVal === 'LUCRO') {
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = colors.profit;
          }
        } else if (statusVal === 'LOSS') {
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = colors.loss;
          }
        } else {
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = colors.textLight;
          }
        }
      }
    }
  });

  const fileName = `TradeTracker_Relatorio_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
  doc.save(fileName);
};