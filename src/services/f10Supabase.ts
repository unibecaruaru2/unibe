import { supabase } from '../lib/supabase';
import { MatriculaAcademicaF10 } from '../types/f10';

export interface SupabaseF10SyncResult {
  matriculas: MatriculaAcademicaF10[];
  periodoReferencia: string;
  lastSyncedAt?: string;
}

/**
 * Carrega as matrículas salvas no Supabase
 */
export async function fetchF10MatriculasFromSupabase(): Promise<SupabaseF10SyncResult | null> {
  try {
    const { data, error } = await supabase
      .from('f10_matriculas')
      .select('*')
      .order('aluno_nome', { ascending: true });

    if (error) {
      console.warn('Erro ao carregar f10_matriculas do Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const periodoReferencia = data[0]?.periodo_referencia || 'Consolidado F10';
    const lastSyncedAt = data[0]?.updated_at || new Date().toISOString();

    const matriculas: MatriculaAcademicaF10[] = data.map((row: any) => ({
      id: row.id,
      contrato: row.contrato,
      alunoNome: row.aluno_nome,
      statusContrato: row.status_contrato,
      telefonePrincipal: row.telefone_principal || 'Sem telefone',
      telefoneSecundario: row.telefone_secundario || undefined,
      whatsappUrl: row.whatsapp_url || '',
      nascimento: row.nascimento || undefined,
      idade: row.idade || undefined,
      sexo: row.sexo || undefined,
      bairro: row.bairro || undefined,
      turmas: Array.isArray(row.turmas) ? row.turmas : [],
      turmasCanonicas: Array.isArray(row.turmas_canonicas) ? row.turmas_canonicas : [],
      dataMatricula: row.data_matricula,
      dataInicio: row.data_inicio || undefined,
      ultimaPresenca: row.ultima_presenca || undefined,
      ultimaFalta: row.ultima_falta || undefined,
      faltasTotais: row.faltas_totais || 0,
      isNoShow: Boolean(row.is_no_show),
      origemContratoF10: row.origem_contrato_f10,
      regime: row.regime as any,
      proximoVencimento: row.proximo_vencimento || undefined,
      valorTotal: row.valor_total || undefined,
      valorTotalNum: parseFloat(row.valor_total_num) || 0,
      valorPago: row.valor_pago || undefined,
      valorPagoNum: parseFloat(row.valor_pago_num) || 0,
      valorAberto: row.valor_aberto || undefined,
      valorAbertoNum: parseFloat(row.valor_aberto_num) || 0,
      valorVencido: row.valor_vencido || 'R$ 0,00',
      valorVencidoNum: parseFloat(row.valor_vencido_num) || 0,
      parcelasVencidas: row.parcelas_vencidas || 0,
      parcelasAberto: row.parcelas_aberto || 0,
      linkPagamentoF10: row.link_pagamento_f10 || undefined,
      smartAluno: row.smart_aluno || 'Não Cadastrado',
      smartTitular: row.smart_titular || 'Não Cadastrado',
      hasAppActive: Boolean(row.has_app_active),
      quadranteRisco: row.quadrante_risco as any,
      isAguardandoQuitado: Boolean(row.is_aguardando_quitado),
      motivoCancelamento: row.motivo_cancelamento || undefined,
      tratativaTipo: row.tratativa_tipo || undefined,
      tratativaNotas: row.tratativa_notas || undefined,
      createdAt: row.created_at || new Date().toISOString()
    }));

    return {
      matriculas,
      periodoReferencia,
      lastSyncedAt
    };
  } catch (err: any) {
    console.warn('Falha inesperada ao consultar Supabase:', err);
    return null;
  }
}

/**
 * Salva/Sincroniza um lote completo de matrículas no Supabase
 */
export async function syncF10MatriculasToSupabase(
  matriculas: MatriculaAcademicaF10[],
  periodoReferencia: string
): Promise<boolean> {
  if (matriculas.length === 0) return false;

  try {
    const payload = matriculas.map(m => ({
      id: m.id,
      contrato: m.contrato,
      aluno_nome: m.alunoNome,
      status_contrato: m.statusContrato,
      telefone_principal: m.telefonePrincipal,
      telefone_secundario: m.telefoneSecundario || null,
      whatsapp_url: m.whatsappUrl,
      nascimento: m.nascimento || null,
      idade: m.idade || null,
      sexo: m.sexo || null,
      bairro: m.bairro || null,
      turmas: m.turmas,
      turmas_canonicas: m.turmasCanonicas,
      data_matricula: m.dataMatricula,
      data_inicio: m.dataInicio || null,
      ultima_presenca: m.ultimaPresenca || null,
      ultima_falta: m.ultimaFalta || null,
      faltas_totais: m.faltasTotais,
      is_no_show: m.isNoShow,
      origem_contrato_f10: m.origemContratoF10,
      regime: m.regime,
      proximo_vencimento: m.proximoVencimento || null,
      valor_total: m.valorTotal || null,
      valor_total_num: m.valorTotalNum,
      valor_pago: m.valorPago || null,
      valor_pago_num: m.valorPagoNum,
      valor_aberto: m.valorAberto || null,
      valor_aberto_num: m.valorAbertoNum,
      valor_vencido: m.valorVencido || null,
      valor_vencido_num: m.valorVencidoNum,
      parcelas_vencidas: m.parcelasVencidas,
      parcelas_aberto: m.parcelasAberto,
      link_pagamento_f10: m.linkPagamentoF10 || null,
      smart_aluno: m.smartAluno,
      smart_titular: m.smartTitular,
      has_app_active: m.hasAppActive,
      quadrante_risco: m.quadranteRisco,
      is_aguardando_quitado: m.isAguardandoQuitado,
      motivo_cancelamento: m.motivoCancelamento || null,
      tratativa_tipo: m.tratativaTipo || null,
      tratativa_notas: m.tratativaNotas || null,
      periodo_referencia: periodoReferencia,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('f10_matriculas')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao realizar upsert no Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error('Exceção ao sincronizar com Supabase:', err);
    return false;
  }
}

/**
 * Atualiza tratativa de retenção no banco de dados
 */
export async function updateF10RetentionInSupabase(
  contrato: string,
  tratativaTipo: string,
  notes: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('f10_matriculas')
      .update({
        tratativa_tipo: tratativaTipo,
        tratativa_notas: notes,
        updated_at: new Date().toISOString()
      })
      .eq('contrato', contrato);

    if (error) {
      console.warn('Erro ao atualizar tratativa:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Erro ao salvar tratativa no Supabase:', err);
    return false;
  }
}

/**
 * Limpa todos os dados da tabela f10_matriculas no Supabase
 */
export async function clearF10MatriculasInSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('f10_matriculas')
      .delete()
      .neq('id', '___non_existent___');

    if (error) {
      console.warn('Erro ao limpar f10_matriculas:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
