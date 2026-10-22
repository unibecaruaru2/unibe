-- ==============================================================================
-- UNIBE - Módulo de Treinamento Social
-- Schema para Supabase SQL Editor (PostgreSQL + RLS)
-- ==============================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Responsáveis Legais
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    phone_raw VARCHAR(20) NOT NULL,       -- Dígitos puros (Ex: 5511999998888)
    phone_formatted VARCHAR(30) NOT NULL, -- Formatado (Ex: +55 (11) 99999-8888)
    relationship VARCHAR(50) DEFAULT 'Mae',
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Alunos
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(32) UNIQUE NOT NULL, -- Ex: UNB-2026-001
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    birth_date DATE NOT NULL,
    is_underage BOOLEAN DEFAULT TRUE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    shift VARCHAR(10) NOT NULL CHECK (shift IN ('manha', 'tarde')),
    classroom VARCHAR(100) DEFAULT 'Sala 102',
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Ciclos de Treinamento (4 Sábados Consecutivos)
CREATE TABLE IF NOT EXISTS public.training_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    cohort_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,        -- Aula 1 (1º sábado)
    expected_end_date DATE NOT NULL, -- Aula 4 (4º sábado = start_date + 21 dias)
    status VARCHAR(30) DEFAULT 'EM_ANDAMENTO',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Presença Aula a Aula (A1 a A4)
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    training_cycle_id UUID REFERENCES public.training_cycles(id) ON DELETE CASCADE,
    lesson_number SMALLINT NOT NULL CHECK (lesson_number BETWEEN 1 AND 4),
    scheduled_date DATE NOT NULL,
    attendance_status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (attendance_status IN ('presente', 'falta', 'pendente')),
    recorded_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT uq_student_lesson UNIQUE (student_id, lesson_number)
);

-- 6. Tabela de Registros de Certificados
CREATE TABLE IF NOT EXISTS public.certificate_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('nao_elegivel', 'em_andamento', 'pendente_pagamento', 'pago_liberado')),
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
    certificate_code VARCHAR(64) UNIQUE,
    issued_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Logs e Confirmações do WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    recipient_phone VARCHAR(20) NOT NULL,
    template_type VARCHAR(50) DEFAULT 'lembrete',
    message_text TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'nao_contatado' CHECK (status IN ('nao_contatado', 'mensagem_enviada', 'confirmado')),
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Ativar Row Level Security (RLS)
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS para acesso autenticado e operadores
CREATE POLICY "Permitir leitura para operadores autenticados" ON public.students FOR SELECT USING (true);
CREATE POLICY "Permitir inserção e atualização para operadores" ON public.students FOR ALL USING (true);

CREATE POLICY "Acesso completo guardians" ON public.guardians FOR ALL USING (true);
CREATE POLICY "Acesso completo training_cycles" ON public.training_cycles FOR ALL USING (true);
CREATE POLICY "Acesso completo class_sessions" ON public.class_sessions FOR ALL USING (true);
CREATE POLICY "Acesso completo certificate_records" ON public.certificate_records FOR ALL USING (true);
CREATE POLICY "Acesso completo whatsapp_logs" ON public.whatsapp_logs FOR ALL USING (true);

-- 10. Função e Trigger para Sincronização Automática do Certificado
CREATE OR REPLACE FUNCTION public.fn_sync_certificate_status()
RETURNS TRIGGER AS $$
DECLARE
    v_absences INT;
    v_presences INT;
    v_fee_paid BOOLEAN;
    v_new_status VARCHAR(30);
    v_code VARCHAR(64);
BEGIN
    -- Contar presenças e faltas do aluno
    SELECT 
        COUNT(*) FILTER (WHERE attendance_status = 'falta'),
        COUNT(*) FILTER (WHERE attendance_status = 'presente')
    INTO v_absences, v_presences
    FROM public.class_sessions
    WHERE student_id = NEW.student_id;

    -- Obter status atual do pagamento da taxa
    SELECT fee_paid INTO v_fee_paid
    FROM public.certificate_records
    WHERE student_id = NEW.student_id;

    IF v_fee_paid IS NULL THEN
        v_fee_paid := FALSE;
    END IF;

    -- Regra Estrita: 100% de Presença (4 de 4)
    IF v_absences > 0 THEN
        v_new_status := 'nao_elegivel';
        v_code := NULL;
    ELSIF v_presences = 4 THEN
        IF v_fee_paid = TRUE THEN
            v_new_status := 'pago_liberado';
            v_code := COALESCE(
                (SELECT certificate_code FROM public.certificate_records WHERE student_id = NEW.student_id),
                'UNIBE-CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
            );
        ELSE
            v_new_status := 'pendente_pagamento';
            v_code := NULL;
        END IF;
    ELSE
        v_new_status := 'em_andamento';
        v_code := NULL;
    END IF;

    -- Atualiza ou cria registro de certificado
    INSERT INTO public.certificate_records (student_id, status, fee_paid, certificate_code, updated_at)
    VALUES (NEW.student_id, v_new_status, v_fee_paid, v_code, NOW())
    ON CONFLICT (student_id) DO UPDATE SET
        status = v_new_status,
        certificate_code = COALESCE(v_code, certificate_records.certificate_code),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_certificate ON public.class_sessions;
CREATE TRIGGER trg_sync_certificate
AFTER INSERT OR UPDATE ON public.class_sessions
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_certificate_status();

-- ==============================================================================
-- 11. Tabela F10 Gestão de Evasão Acadêmica & Inadimplência Multi-Unidades
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.f10_matriculas (
    id VARCHAR(120) PRIMARY KEY,
    contrato VARCHAR(50) NOT NULL,
    unidade VARCHAR(100) NOT NULL DEFAULT 'Caruaru',
    aluno_nome VARCHAR(200) NOT NULL,
    status_contrato VARCHAR(50) NOT NULL,
    telefone_principal VARCHAR(50),
    telefone_secundario VARCHAR(50),
    whatsapp_url TEXT,
    nascimento VARCHAR(20),
    idade INT,
    sexo VARCHAR(10),
    bairro VARCHAR(100),
    turmas JSONB DEFAULT '[]'::jsonb,
    turmas_canonicas JSONB DEFAULT '[]'::jsonb,
    data_matricula VARCHAR(30),
    data_inicio VARCHAR(30),
    ultima_presenca VARCHAR(30),
    ultima_falta VARCHAR(30),
    faltas_totais INT DEFAULT 0,
    is_no_show BOOLEAN DEFAULT FALSE,
    nunca_compareceu BOOLEAN DEFAULT FALSE,
    origem_contrato_f10 VARCHAR(50),
    regime VARCHAR(30),
    proximo_vencimento VARCHAR(30),
    valor_total VARCHAR(30),
    valor_total_num NUMERIC(12,2) DEFAULT 0,
    valor_pago VARCHAR(30),
    valor_pago_num NUMERIC(12,2) DEFAULT 0,
    valor_aberto VARCHAR(30),
    valor_aberto_num NUMERIC(12,2) DEFAULT 0,
    valor_vencido VARCHAR(30),
    valor_vencido_num NUMERIC(12,2) DEFAULT 0,
    parcelas_vencidas INT DEFAULT 0,
    parcelas_aberto INT DEFAULT 0,
    link_pagamento_f10 TEXT,
    smart_aluno VARCHAR(100) DEFAULT 'Não Cadastrado',
    smart_titular VARCHAR(100) DEFAULT 'Não Cadastrado',
    has_app_active BOOLEAN DEFAULT FALSE,
    quadrante_risco VARCHAR(50),
    is_aguardando_quitado BOOLEAN DEFAULT FALSE,
    motivo_cancelamento TEXT,
    tratativa_tipo VARCHAR(100),
    tratativa_notas TEXT,
    periodo_referencia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir coluna unidade caso a tabela já exista
ALTER TABLE public.f10_matriculas ADD COLUMN IF NOT EXISTS unidade VARCHAR(100) DEFAULT 'Caruaru';
ALTER TABLE public.f10_matriculas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso completo f10_matriculas" ON public.f10_matriculas FOR ALL USING (true);

