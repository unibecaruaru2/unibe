import { MatriculaAcademicaF10 } from '../types/f10';
import { canonicalizeTurma, parseCurrencyNumber, classifyRiskQuadrant } from '../utils/f10Analytics';

function createMatricula(params: {
  contrato: string;
  alunoNome: string;
  statusContrato: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  bairro: string;
  rawTurma: string;
  dataMatricula: string;
  dataInicio?: string;
  ultimaPresenca?: string;
  ultimaFalta?: string;
  faltasTotais: number;
  origemContratoF10: string;
  valorTotal: string;
  valorPago: string;
  valorAberto: string;
  valorVencido?: string;
  parcelasVencidas?: number;
  parcelasAberto?: number;
  smartAluno: string;
  smartTitular: string;
  linkPagamentoF10: string;
  idade?: number;
  nascimento?: string;
  sexo?: 'M' | 'F';
}): MatriculaAcademicaF10 {
  const valorVencidoNum = parseCurrencyNumber(params.valorVencido);
  const valorTotalNum = parseCurrencyNumber(params.valorTotal);
  const valorPagoNum = parseCurrencyNumber(params.valorPago);
  const valorAbertoNum = parseCurrencyNumber(params.valorAberto);

  const turmasArray = params.rawTurma.split(',').map(chunk => {
    const parts = chunk.split(' - ').map(p => p.trim());
    const codigoTurma = parts[0];
    const professor = parts.length >= 3 ? parts.slice(2).join(' - ') : (parts[1] || 'Instrutor');
    let turno: string | undefined;
    if (chunk.toLowerCase().includes('manhã')) turno = 'Manhã';
    if (chunk.toLowerCase().includes('tarde')) turno = 'Tarde';
    return {
      raw: chunk.trim(),
      codigoTurma,
      codigoCanonico: canonicalizeTurma(codigoTurma),
      professor,
      turno
    };
  });

  const turmasCanonicas = Array.from(new Set(turmasArray.map(t => t.codigoCanonico)));

  const isQuitado = /^(A\.?V|S\.?A\.?V)$/i.test(params.origemContratoF10.trim());
  const regime = isQuitado ? 'QUITADO' : 'CARNE_MENSALISTA';

  const quadranteRisco = classifyRiskQuadrant({
    statusContrato: params.statusContrato,
    valorVencidoNum,
    faltasTotais: params.faltasTotais,
    ultimaPresenca: params.ultimaPresenca
  });

  const isNoShow = params.faltasTotais >= 3 && !params.ultimaPresenca;
  const isAguardando = params.statusContrato.toLowerCase().includes('aguardando');
  const isAguardandoQuitado = isAguardando && isQuitado;

  const hasAppActive = params.smartAluno.includes('Cadastrado') || params.smartTitular.includes('Cadastrado');

  // WhatsApp E164
  const digits = params.telefonePrincipal.replace(/\D/g, '');
  const cleanDigits = digits.length <= 11 ? '55' + digits : digits;

  return {
    id: `f10-${params.contrato.replace(/\D/g, '')}`,
    contrato: params.contrato,
    alunoNome: params.alunoNome,
    statusContrato: params.statusContrato,
    telefonePrincipal: params.telefonePrincipal,
    telefoneSecundario: params.telefoneSecundario,
    whatsappUrl: `https://wa.me/${cleanDigits}`,
    nascimento: params.nascimento,
    idade: params.idade,
    sexo: params.sexo,
    bairro: params.bairro,
    turmas: turmasArray,
    turmasCanonicas,
    dataMatricula: params.dataMatricula,
    dataInicio: params.dataInicio,
    ultimaPresenca: params.ultimaPresenca,
    ultimaFalta: params.ultimaFalta,
    faltasTotais: params.faltasTotais,
    isNoShow,
    origemContratoF10: params.origemContratoF10,
    regime,
    valorTotal: params.valorTotal,
    valorTotalNum,
    valorPago: params.valorPago,
    valorPagoNum,
    valorAberto: params.valorAberto,
    valorAbertoNum,
    valorVencido: params.valorVencido || 'R$ 0,00',
    valorVencidoNum,
    parcelasVencidas: params.parcelasVencidas || 0,
    parcelasAberto: params.parcelasAberto || 0,
    linkPagamentoF10: params.linkPagamentoF10,
    smartAluno: params.smartAluno,
    smartTitular: params.smartTitular,
    hasAppActive,
    quadranteRisco,
    isAguardandoQuitado,
    createdAt: new Date().toISOString()
  };
}

export const SAMPLE_F10_MATRICULAS: MatriculaAcademicaF10[] = [
  // 1. Q1: Inadimplente Frequente (Tem valor vencido e frequentou recentemente no mês 10/2026)
  createMatricula({
    contrato: '2.349',
    alunoNome: 'Davi Eliaquim Ferreira dos Santos',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99280-4886',
    bairro: 'Kennedy',
    rawTurma: 'Mirim.7- Manhã - Raphael Nonato',
    dataMatricula: '21/07/2026',
    dataInicio: '25/07/2026',
    ultimaPresenca: '17/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 3.500,00',
    valorPago: 'R$ 740,00',
    valorAberto: 'R$ 2.760,00',
    valorVencido: 'R$ 230,00',
    parcelasVencidas: 1,
    parcelasAberto: 12,
    smartAluno: 'Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/KFWHGO',
    idade: 11,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.388',
    alunoNome: 'Pietro Guilherme Amorim da Silva',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99156-4607',
    bairro: 'Caiuca',
    rawTurma: 'Mirim.7- Manhã - Raphael Nonato',
    dataMatricula: '05/09/2026',
    dataInicio: '12/09/2026',
    ultimaPresenca: '17/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 3.445,00',
    valorPago: 'R$ 265,00',
    valorAberto: 'R$ 3.180,00',
    valorVencido: 'R$ 265,00',
    parcelasVencidas: 1,
    parcelasAberto: 12,
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/LX7MUI',
    idade: 6,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.379',
    alunoNome: 'Rodrigo Klebersom Supriano da Silva',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 99147-1702',
    bairro: 'Universitário',
    rawTurma: 'Epcar-707-1 - Dayana Silva',
    dataMatricula: '21/08/2026',
    dataInicio: '22/08/2026',
    ultimaPresenca: '17/10/2026',
    ultimaFalta: '22/08/2026',
    faltasTotais: 7,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 3.975,00',
    valorPago: 'R$ 265,00',
    valorAberto: 'R$ 3.710,00',
    valorVencido: 'R$ 265,00',
    parcelasVencidas: 1,
    parcelasAberto: 14,
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/3T7S0Y',
    idade: 11,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.358',
    alunoNome: 'Carlos Henrique dos Santos Silva',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99188-9103',
    bairro: 'Boa Vista',
    rawTurma: 'Ad.713-1 - Raphael Nonato,Epcar-707-1 - Dayana Silva',
    dataMatricula: '01/08/2026',
    dataInicio: '08/08/2026',
    ultimaPresenca: '17/10/2026',
    ultimaFalta: '10/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 4.085,00',
    valorPago: 'R$ 640,00',
    valorAberto: 'R$ 3.445,00',
    valorVencido: 'R$ 265,00',
    parcelasVencidas: 1,
    parcelasAberto: 13,
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/DR4ZPA',
    idade: 13,
    sexo: 'M'
  }),

  // 2. Q2: Risco Crítico de Evasão (Faltas >= 3, Ativo)
  createMatricula({
    contrato: '2.333',
    alunoNome: 'Darfiny Josiane da Silva',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 98999-5595',
    bairro: 'Centro',
    rawTurma: 'Pm.35-1 - Raphael Nonato',
    dataMatricula: '08/07/2026',
    dataInicio: '09/07/2026',
    ultimaPresenca: '13/08/2026',
    ultimaFalta: '21/09/2026',
    faltasTotais: 7,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 3.975,00',
    valorPago: 'R$ 265,00',
    valorAberto: 'R$ 3.710,00',
    parcelasAberto: 14,
    smartAluno: 'Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/NFQ379',
    idade: 17,
    sexo: 'F'
  }),
  createMatricula({
    contrato: '2.381',
    alunoNome: 'José Wellington de Arruda Ferreira',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 99513-4132',
    bairro: 'Alto do Moura',
    rawTurma: 'Pm.713-1 - Raphael Nonato',
    dataMatricula: '24/08/2026',
    dataInicio: '29/08/2026',
    ultimaFalta: '10/10/2026',
    faltasTotais: 6,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 1.875,00',
    valorPago: 'R$ 265,00',
    valorAberto: 'R$ 1.610,00',
    parcelasAberto: 7,
    smartAluno: 'Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/JV3ILX',
    idade: 32,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.335',
    alunoNome: 'Ícaro Kauan Lima Peixoto',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 98308-7748',
    bairro: 'Beira Rio',
    rawTurma: 'Pm.35-1 - Raphael Nonato,Pm.707-1 - Raphael Nonato',
    dataMatricula: '09/07/2026',
    dataInicio: '11/07/2026',
    ultimaPresenca: '21/07/2026',
    ultimaFalta: '17/10/2026',
    faltasTotais: 24,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 1.810,00',
    valorPago: 'R$ 430,00',
    valorAberto: 'R$ 1.380,00',
    parcelasAberto: 6,
    smartAluno: 'Acesso em 10/07/26',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/AC4WG3',
    idade: 23,
    sexo: 'M'
  }),

  // 3. Q3: Aguardando Cancelamento (Especialmente os Quitados com Risco de Estorno!)
  createMatricula({
    contrato: '2.355',
    alunoNome: 'Gael Oliveira Santos',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 99261-4507',
    bairro: 'Petrópolis',
    rawTurma: 'Mirim.7- Manhã - Raphael Nonato',
    dataMatricula: '29/07/2026',
    dataInicio: '01/08/2026',
    ultimaFalta: '26/09/2026',
    faltasTotais: 3,
    origemContratoF10: 'A.V',
    valorTotal: 'R$ 3.110,00',
    valorPago: 'R$ 3.110,00',
    valorAberto: 'R$ 0,00',
    smartAluno: 'Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/PBOUMR',
    idade: 4,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.394',
    alunoNome: 'Lucas Samuel da Silva',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 99703-2304',
    telefoneSecundario: '(81) 99511-6202',
    bairro: 'Rendeiras',
    rawTurma: 'Mirim.7- Manhã - Raphael Nonato,Mirim.7- Tarde - Raphael Nonato',
    dataMatricula: '15/09/2026',
    dataInicio: '19/09/2026',
    faltasTotais: 5,
    origemContratoF10: 'A.V',
    valorTotal: 'R$ 3.180,00',
    valorPago: 'R$ 3.180,00',
    valorAberto: 'R$ 0,00',
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/GU5EZ9',
    idade: 8,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.390',
    alunoNome: 'Nicolas Pietro de Oliveira Mota',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 98925-7219',
    bairro: 'Vila Nova/ Altinho',
    rawTurma: 'Mirim.35-3 - Raphael Nonato',
    dataMatricula: '08/09/2026',
    ultimaPresenca: '06/10/2026',
    ultimaFalta: '01/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'A.V',
    valorTotal: 'R$ 3.360,00',
    valorPago: 'R$ 3.360,00',
    valorAberto: 'R$ 0,00',
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/VKLZFQ',
    idade: 7,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.344',
    alunoNome: 'Henrique Bruno Basilio Alves',
    statusContrato: 'Aguardando',
    telefonePrincipal: '(81) 99678-8131',
    bairro: 'Cidade Alta',
    rawTurma: 'Pm.713-1 - Raphael Nonato',
    dataMatricula: '16/07/2026',
    dataInicio: '18/07/2026',
    ultimaFalta: '10/10/2026',
    faltasTotais: 9,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 1.875,00',
    valorPago: 'R$ 265,00',
    valorAberto: 'R$ 1.610,00',
    parcelasAberto: 7,
    smartAluno: 'Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/QVD5IQ',
    idade: 25,
    sexo: 'M'
  }),

  // 4. Q4: Regular / Saudável
  createMatricula({
    contrato: '2.415',
    alunoNome: 'Everly Beatriz de Almeida Carvalho',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99429-5928',
    telefoneSecundario: '(81) 98162-7167',
    bairro: 'Kennedy',
    rawTurma: 'Mirim.35-3 - Raphael Nonato,Mirim.7- Manhã - Raphael Nonato',
    dataMatricula: '20/10/2026',
    dataInicio: '24/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'A.V',
    valorTotal: 'R$ 3.180,00',
    valorPago: 'R$ 3.180,00',
    valorAberto: 'R$ 0,00',
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/CWJ8XQ',
    idade: 11,
    sexo: 'F'
  }),
  createMatricula({
    contrato: '2.416',
    alunoNome: 'Marcos Vinicius de Souza Jeferino',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 98188-9103',
    bairro: 'Serras do Vale',
    rawTurma: 'Mirim.707-1 - Raphael Nonato',
    dataMatricula: '21/10/2026',
    dataInicio: '31/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 3.870,00',
    valorPago: 'R$ 690,00',
    valorAberto: 'R$ 3.180,00',
    parcelasAberto: 12,
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/CBKZWO',
    idade: 15,
    sexo: 'M'
  }),
  createMatricula({
    contrato: '2.414',
    alunoNome: 'Diana Priscilla Silva Muniz',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99671-6787',
    bairro: 'Rendeiras',
    rawTurma: 'Mirim.7- Manhã - Raphael Nonato',
    dataMatricula: '16/10/2026',
    dataInicio: '17/10/2026',
    ultimaPresenca: '17/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'A.V',
    valorTotal: 'R$ 3.180,00',
    valorPago: 'R$ 3.180,00',
    valorAberto: 'R$ 0,00',
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Não Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/SHAVIM',
    idade: 8,
    sexo: 'F'
  }),
  createMatricula({
    contrato: '2.372',
    alunoNome: 'Ana Sofia da Silva',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99118-2481',
    bairro: 'Caiuca',
    rawTurma: 'Ad.2402-1 - Raphael Nonato,Epcar-707-1 - Dayana Silva',
    dataMatricula: '17/08/2026',
    dataInicio: '22/08/2026',
    ultimaPresenca: '17/10/2026',
    ultimaFalta: '10/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'S.A.V',
    valorTotal: 'R$ 3.120,00',
    valorPago: 'R$ 3.120,00',
    valorAberto: 'R$ 0,00',
    smartAluno: 'Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/VUPXMJ',
    idade: 0,
    sexo: 'F'
  }),
  createMatricula({
    contrato: '2.383',
    alunoNome: 'Hugo Jadson Pereira Calixto',
    statusContrato: 'Ativo',
    telefonePrincipal: '(81) 99445-5733',
    bairro: 'Rendeiras',
    rawTurma: 'Ad.713-1 - Raphael Nonato,Epcar-707-1 - Dayana Silva',
    dataMatricula: '26/08/2026',
    dataInicio: '02/09/2026',
    ultimaPresenca: '17/10/2026',
    faltasTotais: 0,
    origemContratoF10: 'Venda',
    valorTotal: 'R$ 4.385,00',
    valorPago: 'R$ 1.205,00',
    valorAberto: 'R$ 3.180,00',
    parcelasAberto: 12,
    smartAluno: 'Não Cadastrado',
    smartTitular: 'Cadastrado',
    linkPagamentoF10: 'https://r.f10.com.br/2I5BYK',
    idade: 0,
    sexo: 'M'
  })
];
