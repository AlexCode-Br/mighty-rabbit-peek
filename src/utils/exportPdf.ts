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

  // --- FILTRAGEM DE DADOS ---
  const validDays = Object.values(data.history)
    .filter(day => day.cycles && day.cycles.length > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- 1. CABEÇALHO ESCURO (ESTILO IMAGEM ANEXADA) ---
  doc.setFillColor(24, 24, 27); // Fundo escuro (zinc-900)
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Desenhando o Ícone (Círculo Branco + Carteira Vetorial)
  const cx = 25;
  const cy = 20;
  
  // Círculo
  doc.setFillColor(250, 250, 250);
  doc.circle(cx, cy, 7, 'F');
  
  // Vetor da Carteira
  doc.setDrawColor(24, 24, 27);
  doc.setLineWidth(0.7);
  doc.roundedRect(cx - 3.5, cy - 2.5, 7, 5, 0.8, 0.8, 'S'); // Corpo
  doc.line(cx - 3.5, cy - 0.5, cx + 1, cy - 0.5); // Linha horizontal
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cx + 1.5, cy - 1.2, 2, 2.4, 0.5, 0.5, 'FD'); // Fecho da carteira (Fill & Draw)

  // Texto: "Trade Tracker"
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Trade', 35, 22);
  const tradeWidth = doc.getTextWidth('Trade');
  doc.setTextColor(161, 161, 170); // Cinza para o "Tracker"
  doc.text('Tracker', 35 + tradeWidth + 1, 22);

  // Informação de Geração
  const todayStr = format(new Date(), "dd MMM, yyyy • HH:mm", { locale: ptBR });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 161, 170);
  doc.text('Relatório Gerencial de Performance', pageWidth - 15, 18, { align: 'right' });
  doc.text(`Gerado em: ${todayStr}`, pageWidth - 15, 24, { align: 'right' });

  cursorY = 48;

  // --- 2. INTELIGÊNCIA DOS DADOS ---
  let totalProfit = 0;
  let completedCycles = 0;
  let winningCycles = 0;
  let pendingCycles = 0;

  validDays.forEach(day => {
    day.cycles.forEach(cycle => {
      if (cycle.completed) {
        completedCycles++;
        totalProfit += cycle.totalProfit;
        if (cycle.totalProfit > 0) winningCycles++;
      } else {
        pendingCycles++;
      }
    });
  });

  const losingCycles = completedCycles - winningCycles;
  const winRate = completedCycles > 0 ? ((winningCycles / completedCycles) * 100).toFixed(1) : '0.0';
  
  const profitDays = validDays.filter(d => d.dailyProfit >= 0).length;
  const lossDays = validDays.filter(d => d.dailyProfit < 0).length;
  
  const bestDayVal = validDays.length > 0 ? Math.max(...validDays.map(d => d.dailyProfit)) : 0;
  const worstDayVal = validDays.length > 0 ? Math.min(...validDays.map(d => d.dailyProfit)) : 0;

  const fC = (val: number) => `R$ ${Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- 3. CARDS AVANÇADOS (KPIs) ---
  const drawAdvancedCard = (x: number, y: number, w: number, h: number, title: string, value: string, subLeft: string, subRight: string, valColor: number[]) => {
    applyColor('fill', colors.bgLight);
    applyColor('draw', colors.border);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');

    applyColor('text', colors.textMuted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 5, y + 7);

    applyColor('text', valColor);
    doc.setFontSize(16);
    doc.text(value, x + 5, y + 16);

    applyColor('draw', colors.border);
    doc.setLineWidth(0.2);
    doc.line(x + 5, y + 21, x + w - 5, y + 21);

    applyColor('text', colors.textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(subLeft, x + 5, y + 26);
    doc.text(subRight, x + w - 5, y + 26, { align: 'right' });
  };

  const cW = 58; // Largura dos cards
  const cH = 30; // Altura dos cards
  const gap = 3; // Espaçamento

  const pColor = totalProfit > 0 ? colors.profit : totalProfit < 0 ? colors.loss : colors.textMain;
  
  drawAdvancedCard(15, cursorY, cW, cH, 
    'RESULTADO LÍQUIDO', 
    `${totalProfit > 0 ? '+' : totalProfit < 0 ? '-' : ''}${fC(totalProfit)}`, 
    `Melhor: ${bestDayVal > 0 ? '+' : ''}${fC(bestDayVal)}`, 
    `Pior: ${worstDayVal < 0 ? '-' : ''}${fC(worstDayVal)}`, 
    pColor
  );

  drawAdvancedCard(15 + cW + gap, cursorY, cW, cH, 
    'TAXA DE ACERTO (WIN RATE)', 
    `${winRate}%`, 
    `Dias: ${profitDays}W / ${lossDays}L`, 
    `Ciclos: ${winningCycles}W / ${losingCycles}L`, 
    colors.textMain
  );

  drawAdvancedCard(15 + (cW * 2) + (gap * 2), cursorY, cW, cH, 
    'VOLUME OPERACIONAL', 
    `${completedCycles} Ciclos`, 
    `Pendentes: ${pendingCycles}`, 
    `Média/dia: ${validDays.length > 0 ? (completedCycles / validDays.length).toFixed(1) : '0'}`, 
    colors.textMain
  );

  cursorY += cH + 12;

  // --- 4. GRÁFICO DE BARRAS DINÂMICO (Até 14 dias) ---
  const chartDays = validDays.slice(-14);

  applyColor('text', colors.textMain);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Evolução Financeira Diária', 15, cursorY);
  
  cursorY += 6;
  
  const chartHeight = 45;
  const chartWidth = pageWidth - 30;
  
  applyColor('fill', colors.bgLight);
  applyColor('draw', colors.border);
  doc.roundedRect(15, cursorY, chartWidth, chartHeight, 3, 3, 'FD');

  if (chartDays.length > 0) {
    const maxAbsVal = Math.max(...chartDays.map(d => Math.abs(d.dailyProfit)), 10);
    const zeroY = cursorY + (chartHeight / 2);
    
    // Eixo zero
    applyColor('draw', colors.textLight);
    doc.setLineWidth(0.5);
    doc.line(15, zeroY, 15 + chartWidth, zeroY);

    // Linhas Guia
    doc.setLineDashPattern([1, 2], 0);
    applyColor('draw', colors.border);
    doc.setLineWidth(0.3);
    doc.line(15, cursorY + 10, 15 + chartWidth, cursorY + 10);
    doc.line(15, cursorY + chartHeight - 10, 15 + chartWidth, cursorY + chartHeight - 10);
    doc.setLineDashPattern([], 0); 

    const barSpacing = chartWidth / Math.max(chartDays.length, 7);
    const maxBarHeight = (chartHeight / 2) - 8;
    const barWidth = Math.min(8, barSpacing - 2);

    chartDays.forEach((day, index) => {
      const isProfit = day.dailyProfit >= 0;
      const barH = (Math.abs(day.dailyProfit) / maxAbsVal) * maxBarHeight;
      const startX = 15 + ((chartWidth - (chartDays.length * barSpacing)) / 2);
      const barX = startX + (index * barSpacing) + (barSpacing / 2) - (barWidth / 2);
      const barY = isProfit ? zeroY - barH : zeroY;

      if (day.dailyProfit !== 0) {
        applyColor('fill', isProfit ? colors.profit : colors.loss);
        doc.rect(barX, barY, barWidth, Math.max(barH, 1), 'F');
      }

      applyColor('text', colors.textMuted);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(format(parseISO(day.date), 'dd/MM'), barX + (barWidth / 2), cursorY + chartHeight - 2, { align: 'center' });
      
      if (day.dailyProfit !== 0) {
        applyColor('text', isProfit ? colors.profit : colors.loss);
        doc.setFont('helvetica', 'bold');
        let valLabel = Math.abs(day.dailyProfit).toFixed(0);
        if (Math.abs(day.dailyProfit) >= 1000) valLabel = (Math.abs(day.dailyProfit) / 1000).toFixed(1).replace('.0', '') + 'k';
        const textY = isProfit ? barY - 1.5 : barY + barH + 3.5;
        doc.text(`${isProfit ? '+' : '-'}${valLabel}`, barX + (barWidth / 2), textY, { align: 'center' });
      }
    });
  } else {
    applyColor('text', colors.textLight);
    doc.setFontSize(9);
    doc.text('Não há operações suficientes.', pageWidth / 2, cursorY + (chartHeight/2), { align: 'center' });
  }

  cursorY += chartHeight + 15;

  // --- CONFIGURAÇÃO PREMIUM DAS TABELAS ---
  const tableStyles = {
    theme: 'plain' as const,
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, textColor: colors.textMain },
    headStyles: { fillColor: colors.bgLight, textColor: colors.textMuted, fontStyle: 'bold' as const, lineWidth: { bottom: 0.5 }, lineColor: colors.border },
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: colors.border },
    margin: { left: 15, right: 15 },
  };

  // --- 5. TABELA DE RESUMO DIÁRIO ---
  applyColor('text', colors.textMain);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Diária (Listagem)', 15, cursorY);
  cursorY += 5;

  const dailyTableData: any[][] = [];
  const dailyGoal = data.settings.dailyGoal;

  [...validDays].reverse().forEach((day) => {
    const profit = day.dailyProfit;
    const percent = dailyGoal > 0 ? (profit / dailyGoal) * 100 : 0;
    
    let status = 'Empate';
    if (profit > 0 && dailyGoal > 0 && profit >= dailyGoal) status = 'Meta Batida';
    else if (profit > 0) status = 'Lucro';
    else if (profit < 0) status = 'Loss';

    dailyTableData.push([
      format(parseISO(day.date), 'dd/MM/yyyy'),
      day.cycles.length.toString(),
      `${profit > 0 ? '+' : profit < 0 ? '-' : ''}${fC(profit)}`,
      dailyGoal > 0 ? `${percent.toFixed(0)}%` : '-',
      status
    ]);
  });

  autoTable(doc, {
    ...tableStyles,
    startY: cursorY,
    head: [['Data', 'Ciclos Totais', 'Resultado Líquido', '% Meta', 'Status Final']],
    body: dailyTableData,
    columnStyles: {
      1: { halign: 'center' },
      2: { fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const s = data.row.raw[4];
        if (s === 'Meta Batida' || s === 'Lucro') {
          if ([2, 4].includes(data.column.index)) data.cell.styles.textColor = colors.profit;
        } else if (s === 'Loss') {
          if ([2, 4].includes(data.column.index)) data.cell.styles.textColor = colors.loss;
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
  doc.text('Auditoria de Entradas (Ciclos)', 15, cursorY);
  cursorY += 5;

  const detailData: any[][] = [];
  
  [...validDays].reverse().forEach((day) => {
    (day.cycles || []).forEach(cycle => {
      const m = cycle.operations.find(op => op.type === 'MAE');
      const f = cycle.operations.find(op => op.type === 'FILHA');
      if (!m || !f) return;

      const dt = cycle.createdAt ? format(parseISO(cycle.createdAt), 'dd/MM/yy') : format(parseISO(day.date), 'dd/MM/yy');
      const tm = cycle.createdAt ? format(parseISO(cycle.createdAt), 'HH:mm') : '--:--';
      const c = (v: number | null) => v !== null ? fC(v) : '-';
      
      detailData.push([
        `${dt} às ${tm}`,
        `Entrada: ${c(m.deposit)}   |   Saída: ${c(m.withdraw)}`,
        `Entrada: ${c(f.deposit)}   |   Saída: ${c(f.withdraw)}`,
        `${cycle.totalProfit > 0 ? '+' : cycle.totalProfit < 0 ? '-' : ''}${c(cycle.totalProfit)}`,
        cycle.completed ? (cycle.totalProfit >= 0 ? 'WIN' : 'LOSS') : 'PENDENTE'
      ]);
    });
  });

  autoTable(doc, {
    ...tableStyles,
    startY: cursorY,
    head: [['Registro', 'Operação Mãe', 'Operação Filha', 'Total Ciclo', 'Resultado']],
    body: detailData,
    columnStyles: {
      3: { fontStyle: 'bold', halign: 'right' },
      4: { fontStyle: 'bold', halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const s = data.row.raw[4];
        if (s === 'WIN') {
          if ([3, 4].includes(data.column.index)) data.cell.styles.textColor = colors.profit;
        } else if (s === 'LOSS') {
          if ([3, 4].includes(data.column.index)) data.cell.styles.textColor = colors.loss;
        } else {
          if ([3, 4].includes(data.column.index)) data.cell.styles.textColor = colors.textLight;
        }
      }
    }
  });

  const fileName = `TradeTracker_Relatorio_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`;
  doc.save(fileName);
};