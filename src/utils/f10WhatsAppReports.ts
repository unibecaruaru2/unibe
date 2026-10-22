import { MatriculaAcademicaF10 } from '../types/f10';

export interface WhatsAppReportOptions {
  includeExecutiveSummary?: boolean;
  nameDisplay?: 'FIRST_NAME' | 'FULL_NAME' | 'NONE';
  includeTotalDebt?: boolean;
}

/**
 * Formata um nome para exibição executiva curta (apenas primeiro nome ou primeiros dois)
 */
export function formatExecutiveName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return (parts[0] || '').toUpperCase();
  // Se segundo nome for preposição ("de", "da", "do", "dos", "das"), inclui o terceiro
  if (parts.length >= 3 && /^(de|da|do|dos|das|e)$/i.test(parts[1])) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`.toUpperCase();
  }
  return `${parts[0]} ${parts[1]}`.toUpperCase();
}

/**
 * Normaliza o identificador de contrato (ex: "2.388" -> "2388", ou mantém se for texto especial)
 */
export function formatContractNumber(contrato: string): string {
  if (!contrato) return 'S/N';
  const clean = contrato.trim();
  // Se for apenas número com ponto, ex: "2.388" -> "2388"
  if (/^\d+\.\d+$/.test(clean)) {
    return clean.replace('.', '');
  }
  return clean;
}

/**
 * Formata a linha executiva individual de um aluno para o WhatsApp
 * Prioriza notas manuais/tratativas se existirem.
 * Caso contrário, sintetiza os dados essenciais de forma direta, sem poluição.
 */
export function formatStudentReportLine(
  mat: MatriculaAcademicaF10,
  options: WhatsAppReportOptions = {}
): string {
  const ctr = formatContractNumber(mat.contrato);
  const nameStyle = options.nameDisplay ?? 'FIRST_NAME';

  let studentId = ctr;

  // Se o próprio contrato já contiver o nome do aluno (ex: "CTR (1) BUGADO THIAGO VINICIUS"), não duplica
  const contratoHasName = mat.alunoNome && ctr.toUpperCase().includes(mat.alunoNome.split(' ')[0].toUpperCase());

  if (!contratoHasName && nameStyle !== 'NONE') {
    const displayName = nameStyle === 'FULL_NAME' 
      ? mat.alunoNome.toUpperCase() 
      : formatExecutiveName(mat.alunoNome);
    
    studentId = `${ctr} (${displayName})`;
  }

  // 1. Se tem nota/tratativa manual inserida pelo operador, usa a tratativa
  const rawNote = mat.tratativaNotas?.trim();
  if (rawNote) {
    // Normaliza nota para não ter quebras extras
    const cleanNote = rawNote.replace(/\s+/g, ' ');
    return `${studentId} - ${cleanNote}`;
  }

  // 2. Se for Bolsa e estiver com débito pendente
  const isBolsa = /bolsa/i.test(mat.origemContratoF10 || '');
  if (isBolsa && mat.valorVencidoNum > 0) {
    return `${studentId} - BOLSA COM PARCELA PENDENTE (${mat.valorVencido || `R$ ${mat.valorVencidoNum.toFixed(2)}`})`;
  }

  // 3. Fila de Retenção / Aguardando Cancelamento
  if (mat.quadranteRisco === 'Q3_WAITING_CANCEL' || mat.statusContrato.toLowerCase().includes('aguardando')) {
    if (mat.isAguardandoQuitado) {
      return `${studentId} - QUITADO AGUARDANDO CANCELAMENTO (RISCO ESTORNO: ${mat.valorPago || 'R$ 0,00'})`;
    }
    const motivo = mat.motivoCancelamento ? `, ${mat.motivoCancelamento.toUpperCase()}` : '';
    return `${studentId} - AGUARDANDO CANCELAMENTO${motivo}, ENTRAR EM CONTATO P/ NEGOCIAR`;
  }

  // 4. Inadimplente Frequentando (Q1 Frequentando)
  if (mat.quadranteRisco === 'Q1_OVERDUE_ATTENDING') {
    const dataVenc = mat.proximoVencimento || '20/10';
    const valor = mat.valorVencido || `R$ ${mat.valorVencidoNum.toFixed(2)}`;
    const ultPresenca = mat.ultimaPresenca ? ` (PRESENÇA ${mat.ultimaPresenca.slice(0, 5)})` : '';
    return `${studentId} - FREQUENTE EM AULA E DEVENDO${ultPresenca}, VENCIMENTO ${dataVenc} (${valor})`;
  }

  // 5. Inadimplente Ausente (Q1 Ausente)
  if (mat.quadranteRisco === 'Q1_OVERDUE_ABSENT') {
    const dataVenc = mat.proximoVencimento || '20/10';
    const valor = mat.valorVencido || `R$ ${mat.valorVencidoNum.toFixed(2)}`;
    const faltasStr = mat.faltasTotais > 0 ? ` (${mat.faltasTotais} FALTAS)` : '';
    return `${studentId} - ATRASO COM AUSÊNCIA${faltasStr}, VENCIMENTO ${dataVenc} (${valor})`;
  }

  // 6. Débito geral
  if (mat.valorVencidoNum > 0) {
    const dataVenc = mat.proximoVencimento || '20/10';
    const valor = mat.valorVencido || `R$ ${mat.valorVencidoNum.toFixed(2)}`;
    return `${studentId} - ATRASO, VENCIMENTO ${dataVenc} (${valor})`;
  }

  // 7. Risco Crítico de Evasão (Q2 - Faltas >= 3 sem débito)
  if (mat.quadranteRisco === 'Q2_ABSENT_CHURN' || mat.faltasTotais >= 3) {
    return `${studentId} - RISCO CRÍTICO DE EVASÃO (${mat.faltasTotais} FALTAS CONSECUTIVAS)`;
  }

  // 8. Sem App Smart Aluno
  if (!mat.hasAppActive) {
    return `${studentId} - SEM ACESSO AO APP SMART ALUNO`;
  }

  // 9. Regular / Saudável (Q4)
  return `${studentId} - EM DIA / REGULAR (PRESENÇA ATIVA)`;
}

export interface GenerateReportParams {
  matriculas: MatriculaAcademicaF10[];
  tabTitle: string;
  periodoReferencia?: string;
  filterTurma?: string;
  filterRegime?: string;
  options?: WhatsAppReportOptions;
}

/**
 * Gera o relatório formatado completo para envio no WhatsApp
 */
export function generateWhatsAppExecutiveReport({
  matriculas,
  tabTitle,
  periodoReferencia,
  filterTurma,
  filterRegime,
  options = {}
}: GenerateReportParams): string {
  if (!matriculas || matriculas.length === 0) {
    return `*RELATÓRIO: ${tabTitle.toUpperCase()}*\n_Nenhum aluno encontrado nesta seleção._`;
  }

  const includeSummary = options.includeExecutiveSummary ?? true;

  // Totais
  const totalAlunos = matriculas.length;
  const totalDebitoNum = matriculas.reduce((acc, m) => acc + (m.valorVencidoNum || 0), 0);
  const totalDebitoStr = totalDebitoNum > 0 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebitoNum)
    : null;

  const headerLines: string[] = [];

  // Título em destaque do WhatsApp
  headerLines.push(`*${tabTitle.toUpperCase()}*`);

  // Subtítulo com filtros aplicados se houver
  const filterBadges: string[] = [];
  if (filterTurma && filterTurma !== 'TODOS') filterBadges.push(`Turma: ${filterTurma}`);
  if (filterRegime && filterRegime !== 'TODOS') filterBadges.push(`Regime: ${filterRegime === 'QUITADO' ? 'À Vista/SAV' : 'Carnê Mensalista'}`);
  if (periodoReferencia) filterBadges.push(`Ref: ${periodoReferencia}`);

  if (filterBadges.length > 0) {
    headerLines.push(`_${filterBadges.join(' | ')}_`);
  }

  // Resumo executivo em 1 linha
  if (includeSummary) {
    let summary = `📊 *Total:* ${totalAlunos} ${totalAlunos === 1 ? 'aluno' : 'alunos'}`;
    if (totalDebitoStr && totalDebitoNum > 0) {
      summary += ` | *Débito Total:* ${totalDebitoStr}`;
    }
    headerLines.push(summary);
  }

  // Lista dos alunos
  const studentLines = matriculas.map(m => formatStudentReportLine(m, options));

  return `${headerLines.join('\n')}\n\n${studentLines.join('\n')}`;
}
