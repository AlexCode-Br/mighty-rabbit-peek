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
  let cursorY = 0;

  // --- 1. CABEÇALHO COM IDENTIDADE VISUAL ---
  doc.setFillColor(24, 24, 27); // bg-zinc-900
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TradeTracker', 15, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 161, 170); // text-zinc-400
  doc.text('Relatório de Performance Operacional', 15, 30);

  const todayStr = format(new Date(), "dd 'de' MMMM, yyyy • HH:mm", { locale: ptBR });
  doc.setFontSize(9);
  doc.text(`Gerado em: ${todayStr}`, pageWidth - 15, 22, { align: 'right' });

  cursorY = 55;

  // --- 2. CÁLCULO DE ESTATÍSTICAS ---
  let totalProfit = 0;
  let totalCycles = 0;
  let winningCycles = 0;

  const allCycles = Object.values(data.history).flatMap(day => day.cycles || []);
  allCycles.forEach(cycle => {
    if (cycle.completed) {
      totalCycles++;
      totalProfit += cycle.totalProfit;
      if (cycle.totalProfit > 0) winningCycles++;
    }
  });

  const winRate = totalCycles > 0 ? ((winningCycles / totalCycles) * 100).toFixed(1) : '0.0';

  // --- 3. CARTÕES DE RESUMO ---
  const drawCard = (x: number, y: number, w: number, h: number, title: string, value: string, isPositive?: boolean) => {
    doc.setDrawColor(228, 228, 231);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(113, 113, 122);
    doc.text(title, x + 5, y + 8);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    if (isPositive === true) doc.setTextColor(16, 185, 129); // emerald-500
    else if (isPositive === false) doc.setTextColor(244, 63, 94); // rose-500
    else doc.setTextColor(24, 24, 27);

    doc.text(value, x + 5, y + 18);
    doc.setFont('helvetica', 'normal');
  };

  const cardW = (pageWidth - 40) / 3;
  drawCard(15, cursorY, cardW, 25, 'LUCRO LÍQUIDO', `R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalProfit === 0 ? undefined : totalProfit > 0);
  drawCard(15 + cardW + 5, cursorY, cardW, 25, 'TAXA DE ACERTO', `${winRate}%`);
  drawCard(15 + (cardW * 2) + 10, cursorY, cardW, 25, 'CICLOS TOTAIS', `${totalCycles}`);

  cursorY += 40;

  // --- 4. GRÁFICO DE BARRAS (ÚLTIMOS 7 DIAS DE OPERAÇÃO) ---
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Recente (Últimos 7 dias)', 15, cursorY);
  
  cursorY += 10;
  
  const chartHeight = 40;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(15, cursorY, pageWidth - 30, chartHeight, 3, 3, 'FD');

  const zeroY = cursorY + (chartHeight / 2);
  doc.setDrawColor(212, 212, 216);
  doc.setLineWidth(0.5);
  doc.line(15, zeroY, pageWidth - 15, zeroY);

  const sortedDays = Object.values(data.history)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  if (sortedDays.length > 0) {
    const maxVal = Math.max(...sortedDays.map(d => Math.abs(d.dailyProfit)), 10); // Evita divisão por zero
    const barSpacing = (pageWidth - 40) / 7;
    
    sortedDays.forEach((day, index) => {
      const isProfit = day.dailyProfit >= 0;
      const barH = (Math.abs(day.dailyProfit) / maxVal) * (chartHeight / 2 - 5);
      const barX = 25 + (index * barSpacing);
      const barY = isProfit ? zeroY - barH : zeroY;

      if (isProfit) doc.setFillColor(16, 185, 129);
      else doc.setFillColor(244, 63, 94);
      
      doc.rect(barX, barY, 10, Math.max(barH, 1), 'F');

      doc.setFontSize(7);
      doc.setTextColor(113, 113, 122);
      const dayLabel = format(parseISO(day.date), 'dd/MM');
      doc.text(dayLabel, barX + 5, chartHeight + cursorY - 2, { align: 'center' });
      
      if (day.dailyProfit !== 0) {
        doc.setTextColor(isProfit ? 16 : 244, isProfit ? 185 : 63, isProfit ? 129 : 94);
        
        // Exibição mais compacta do valor (ex: +1.2k ou +1500)
        let valLabel = day.dailyProfit.toFixed(0);
        if (Math.abs(day.dailyProfit) >= 1000) {
          valLabel = (day.dailyProfit / 1000).toFixed(1).replace('.0', '') + 'k';
        }
        
        const finalLabel = `${isProfit ? '+' : ''}${valLabel}`;
        doc.text(finalLabel, barX + 5, isProfit ? barY - 2 : barY + barH + 4, { align: 'center' });
      }
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(161, 161, 170);
    doc.text('Sem dados suficientes para o gráfico.', pageWidth / 2, cursorY + 20, { align: 'center' });
  }

  cursorY += chartHeight + 15;

  // --- 5. RESUMO DIÁRIO ---
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('Desempenho Diário', 15, cursorY);
  
  cursorY += 5;

  const dailyTableData: any[][] = [];
  const dailyGoal = data.settings.dailyGoal;
  
  const allSortedDates = Object.keys(data.history).sort((a, b) => b.localeCompare(a));
  allSortedDates.forEach((dateKey) => {
    const day = data.history[dateKey];
    if (!day.cycles || day.cycles.length === 0) return;

    const dateStr = format(parseISO(day.date), 'dd/MM/yyyy');
    const profit = day.dailyProfit;
    const formatCurr = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Evita infinity/NaN se a meta for 0
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
    startY: cursorY,
    head: [['Data', 'Ciclos', 'Resultado', '% da Meta', 'Status']],
    body: dailyTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 24, 27], // zinc-900
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: [39, 39, 42],
      valign: 'middle',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    styles: {
      cellPadding: 3,
      fontSize: 9,
      lineColor: [228, 228, 231],
      lineWidth: 0.1,
    },
    // Método CORRETO para customizar cores de células específicas (não afeta global)
    didParseCell: (data) => {
      if (data.section === 'body') {
        const statusVal = data.row.raw[4];
        if (statusVal === 'Meta Batida' || statusVal === 'Lucro') {
          if ([2, 3, 4].includes(data.column.index)) {
            data.cell.styles.textColor = [16, 185, 129]; // emerald
            data.cell.styles.fontStyle = 'bold';
          }
        } else if (statusVal === 'Loss') {
          if ([2, 3, 4].includes(data.column.index)) {
            data.cell.styles.textColor = [244, 63, 94]; // rose
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 15;

  // --- 6. TABELA DE CICLOS DETALHADOS ---
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico Detalhado (Operações)', 15, cursorY);
  
  cursorY += 5;

  const tableData: any[][] = [];
  
  allSortedDates.forEach((dateKey) => {
    const day = data.history[dateKey];
    (day.cycles || []).forEach(cycle => {
      const maeOp = cycle.operations.find(op => op.type === 'MAE');
      const filhaOp = cycle.operations.find(op => op.type === 'FILHA');
      if (!maeOp || !filhaOp) return;

      const dateStr = cycle.createdAt ? format(parseISO(cycle.createdAt), 'dd/MM/yy') : format(parseISO(day.date), 'dd/MM/yy');
      const timeStr = cycle.createdAt ? format(parseISO(cycle.createdAt), 'HH:mm') : '--:--';
      
      const formatCurr = (val: number | null) => val !== null ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
      
      tableData.push([
        `${dateStr}\n${timeStr}`,
        `E: ${formatCurr(maeOp.deposit)}\nS: ${formatCurr(maeOp.withdraw)}`,
        `E: ${formatCurr(filhaOp.deposit)}\nS: ${formatCurr(filhaOp.withdraw)}`,
        formatCurr(cycle.totalProfit),
        cycle.completed ? (cycle.totalProfit >= 0 ? 'Lucro' : 'Loss') : 'Pendente'
      ]);
    });
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['Data', 'Mãe', 'Filha', 'Lucro Total', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: [39, 39, 42],
      valign: 'middle',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    styles: {
      cellPadding: 3,
      fontSize: 9,
      lineColor: [228, 228, 231],
      lineWidth: 0.1,
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const statusVal = data.row.raw[4];
        if (statusVal === 'Lucro') {
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = [16, 185, 129]; // emerald
            data.cell.styles.fontStyle = 'bold';
          }
        } else if (statusVal === 'Loss') {
          if (data.column.index === 3 || data.column.index === 4) {
            data.cell.styles.textColor = [244, 63, 94]; // rose
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    }
  });

  // Salvar PDF
  const fileName = `TradeTracker_Relatorio_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
  
  // Agora apenas fazemos o download direto do arquivo. Evita bugs no celular e bloqueadores de pop-up no Desktop.
  doc.save(fileName);
};