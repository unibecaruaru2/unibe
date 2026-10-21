-- ==============================================================================
-- SaaS Educacional UNIBE - Módulo de Treinamento Social
-- PostgreSQL Initial Migration DDL (Strict Normalized Architecture)
-- ==============================================================================

-- 0. Extensões Essenciais
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ------------------------------------------------------------------------------

CREATE TYPE student_status AS ENUM (
    'ATIVO',
    'CONCLUIDO',
    'DESISTENTE'
);

CREATE TYPE guardian_relationship AS ENUM (
    'MAE',
    'PAI',
    'RESPONSAVEL_LEGAL',
    'AVO',
    'TIO',
    'IRMAO',
    'OUTRO'
);

CREATE TYPE training_cycle_status AS ENUM (
    'EM_ANDAMENTO',
    'CONCLUIDO',
    'CANCELADO'
);

CREATE TYPE attendance_status AS ENUM (
    'PENDENTE',
    'PRESENTE',
    'FALTA'
);

CREATE TYPE whatsapp_contact_status AS ENUM (
    'NAO_CONTATADO',
    'MENSAGEM_ENVIADA',
    'CONFIRMADO',
    'SEM_RESPOSTA'
);

CREATE TYPE certificate_eligibility AS ENUM (
    'NAO_ELEGIVEL',
    'PENDENTE_PAGAMENTO',
    'PAGO_LIBERADO'
);

CREATE TYPE payment_method AS ENUM (
    'PIX',
    'CARTAO_CREDITO',
    'CARTAO_DEBITO',
    'BOLETO',
    'DINHEIRO',
    'ISENTO'
);

-- ------------------------------------------------------------------------------
-- 2. FUNÇÃO UTILITÁRIA PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. TABELAS BASE E RELACIONAMENTOS
-- ------------------------------------------------------------------------------

-- Tabela de Tenancy (Polos / Unidades Educacionais)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(60) NOT NULL,
    document_cnpj VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenants_slug UNIQUE (slug)
);

-- Tabela de Responsáveis (Guardiões legais dos alunos)
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    phone_raw VARCHAR(20) NOT NULL,
    phone_formatted VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    relationship guardian_relationship NOT NULL DEFAULT 'RESPONSAVEL_LEGAL',
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_guardians_phone_raw_numeric CHECK (phone_raw ~ '^[0-9]{10,15}$'),
    CONSTRAINT chk_guardians_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_guardians_tenant_id ON guardians(tenant_id);
CREATE INDEX idx_guardians_phone_raw ON guardians(phone_raw);

-- Tabela de Alunos
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    document_number VARCHAR(32) NOT NULL,
    birth_date DATE,
    status student_status NOT NULL DEFAULT 'ATIVO',
    registered_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_students_tenant_document UNIQUE (tenant_id, document_number),
    CONSTRAINT chk_students_birth_date CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE)
);

CREATE INDEX idx_students_tenant_status ON students(tenant_id, status);
CREATE INDEX idx_students_guardian_id ON students(guardian_id);
CREATE INDEX idx_students_full_name ON students(full_name);

-- Tabela de Ciclos de Treinamento (4 sábados consecutivos)
CREATE TABLE training_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    cycle_code VARCHAR(50),
    enrollment_date TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    expected_end_date DATE NOT NULL,
    status training_cycle_status NOT NULL DEFAULT 'EM_ANDAMENTO',
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Validação: Término deve ser posterior ou igual ao início
    CONSTRAINT chk_cycles_date_order CHECK (expected_end_date >= start_date),
    -- Validação de Negócio: Primeiro e último sábado devem ser sábados (ISODOW = 6)
    CONSTRAINT chk_cycles_start_saturday CHECK (EXTRACT(ISODOW FROM start_date) = 6),
    CONSTRAINT chk_cycles_end_saturday CHECK (EXTRACT(ISODOW FROM expected_end_date) = 6),
    -- Validação de Negócio: O ciclo de 4 sábados consecutivos dista exatamente 21 dias (3 semanas)
    CONSTRAINT chk_cycles_span_21_days CHECK ((expected_end_date - start_date) = 21)
);

CREATE INDEX idx_cycles_tenant_status ON training_cycles(tenant_id, status);
CREATE INDEX idx_cycles_student_id ON training_cycles(student_id);
CREATE INDEX idx_cycles_date_span ON training_cycles(start_date, expected_end_date);

-- Tabela de Sessões de Aula e Frequência (Aulas 1, 2, 3 e 4)
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_cycle_id UUID NOT NULL REFERENCES training_cycles(id) ON DELETE CASCADE,
    session_number SMALLINT NOT NULL,
    scheduled_date DATE NOT NULL,
    attendance_status attendance_status NOT NULL DEFAULT 'PENDENTE',
    registered_by VARCHAR(120),
    recorded_at TIMESTAMPTZ(6),
    absence_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Validação: Exatamente 4 aulas por ciclo numeradas de 1 a 4
    CONSTRAINT uq_cycle_session_number UNIQUE (training_cycle_id, session_number),
    CONSTRAINT chk_sessions_number_range CHECK (session_number BETWEEN 1 AND 4),
    -- Validação: Sessão deve obrigatoriamente cair em um sábado
    CONSTRAINT chk_sessions_must_be_saturday CHECK (EXTRACT(ISODOW FROM scheduled_date) = 6),
    -- Coerência temporal do registro
    CONSTRAINT chk_sessions_recorded_at CHECK (
        (attendance_status = 'PENDENTE') OR (attendance_status IN ('PRESENTE', 'FALTA') AND recorded_at IS NOT NULL)
    )
);

CREATE INDEX idx_sessions_cycle_id ON class_sessions(training_cycle_id);
CREATE INDEX idx_sessions_scheduled_date ON class_sessions(scheduled_date);
CREATE INDEX idx_sessions_attendance_status ON class_sessions(attendance_status);

-- Tabela de Logs de Contato e Disparos de WhatsApp
CREATE TABLE whatsapp_contact_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
    training_cycle_id UUID REFERENCES training_cycles(id) ON DELETE SET NULL,
    class_session_id UUID REFERENCES class_sessions(id) ON DELETE SET NULL,
    status whatsapp_contact_status NOT NULL DEFAULT 'NAO_CONTATADO',
    message_text TEXT NOT NULL,
    phone_destination VARCHAR(20) NOT NULL,
    operator_name VARCHAR(120) NOT NULL,
    sent_at TIMESTAMPTZ(6),
    confirmed_at TIMESTAMPTZ(6),
    response_summary TEXT,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_whatsapp_phone_numeric CHECK (phone_destination ~ '^[0-9]{10,15}$')
);

CREATE INDEX idx_whatsapp_tenant_status ON whatsapp_contact_logs(tenant_id, status);
CREATE INDEX idx_whatsapp_student_id ON whatsapp_contact_logs(student_id);
CREATE INDEX idx_whatsapp_guardian_id ON whatsapp_contact_logs(guardian_id);
CREATE INDEX idx_whatsapp_session_id ON whatsapp_contact_logs(class_session_id);
CREATE INDEX idx_whatsapp_sent_at ON whatsapp_contact_logs(sent_at);

-- Tabela de Registro de Certificação e Controle Financeiro
CREATE TABLE certificate_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    training_cycle_id UUID NOT NULL UNIQUE REFERENCES training_cycles(id) ON DELETE CASCADE,
    attendance_count SMALLINT NOT NULL DEFAULT 0,
    absence_count SMALLINT NOT NULL DEFAULT 0,
    eligibility certificate_eligibility NOT NULL DEFAULT 'NAO_ELEGIVEL',
    fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ(6),
    payment_method payment_method,
    payment_reference VARCHAR(100),
    certificate_code VARCHAR(64) UNIQUE,
    issued_at TIMESTAMPTZ(6),
    pdf_url VARCHAR(500),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Restrições de valores e contagem de presenças/faltas
    CONSTRAINT chk_cert_attendance_count CHECK (attendance_count BETWEEN 0 AND 4),
    CONSTRAINT chk_cert_absence_count CHECK (absence_count BETWEEN 0 AND 4),
    CONSTRAINT chk_cert_total_sessions CHECK ((attendance_count + absence_count) <= 4),
    CONSTRAINT chk_cert_fee_amount CHECK (fee_amount >= 0),
    -- Invariante de elegibilidade:
    -- PAGO_LIBERADO só é válido se 4 presenças, 0 faltas e taxa paga
    CONSTRAINT chk_cert_pago_liberado_invariable CHECK (
        eligibility != 'PAGO_LIBERADO' OR (attendance_count = 4 AND absence_count = 0 AND is_paid = true)
    ),
    -- PENDENTE_PAGAMENTO só é válido se 4 presenças, 0 faltas e taxa não paga
    CONSTRAINT chk_cert_pendente_pagamento_invariable CHECK (
        eligibility != 'PENDENTE_PAGAMENTO' OR (attendance_count = 4 AND absence_count = 0 AND is_paid = false)
    )
);

CREATE INDEX idx_cert_tenant_eligibility ON certificate_records(tenant_id, eligibility);
CREATE INDEX idx_cert_student_id ON certificate_records(student_id);
CREATE INDEX idx_cert_is_paid ON certificate_records(is_paid);
CREATE INDEX idx_cert_code ON certificate_records(certificate_code);

-- ------------------------------------------------------------------------------
-- 4. TRIGGERS DE UPDATED_AT (AUDITORIA TEMPORAL)
-- ------------------------------------------------------------------------------

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_guardians_updated_at
    BEFORE UPDATE ON guardians
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_training_cycles_updated_at
    BEFORE UPDATE ON training_cycles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_class_sessions_updated_at
    BEFORE UPDATE ON class_sessions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_whatsapp_contact_logs_updated_at
    BEFORE UPDATE ON whatsapp_contact_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_certificate_records_updated_at
    BEFORE UPDATE ON certificate_records
    FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 5. WORKFLOW ENGINE AUTOMÁTICO (TRIGGERS DE NEGÓCIO)
-- ------------------------------------------------------------------------------

-- Trigger 5.1: Criação automática das 4 sessões (sábados) e inicialização do certificado ao matricular ciclo
CREATE OR REPLACE FUNCTION fn_on_training_cycle_created()
RETURNS TRIGGER AS $$
DECLARE
    i INT;
    v_session_date DATE;
BEGIN
    -- Gera automaticamente as 4 sessões nos 4 sábados consecutivos
    FOR i IN 1..4 LOOP
        v_session_date := NEW.start_date + ((i - 1) * 7);
        INSERT INTO class_sessions (
            training_cycle_id,
            session_number,
            scheduled_date,
            attendance_status
        ) VALUES (
            NEW.id,
            i,
            v_session_date,
            'PENDENTE'
        );
    END LOOP;

    -- Inicializa o registro de certificação como NAO_ELEGIVEL
    INSERT INTO certificate_records (
        tenant_id,
        student_id,
        training_cycle_id,
        attendance_count,
        absence_count,
        eligibility,
        is_paid
    ) VALUES (
        NEW.tenant_id,
        NEW.student_id,
        NEW.id,
        0,
        0,
        'NAO_ELEGIVEL',
        false
    ) ON CONFLICT (training_cycle_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_training_cycle_after_insert
    AFTER INSERT ON training_cycles
    FOR EACH ROW EXECUTE FUNCTION fn_on_training_cycle_created();

-- Trigger 5.2: Recálculo automático de assiduidade e elegibilidade de certificado ao alterar frequências
CREATE OR REPLACE FUNCTION fn_sync_certificate_on_attendance_change()
RETURNS TRIGGER AS $$
DECLARE
    v_cycle_id UUID;
    v_tenant_id UUID;
    v_student_id UUID;
    v_presencas SMALLINT;
    v_faltas SMALLINT;
    v_is_paid BOOLEAN;
    v_new_eligibility certificate_eligibility;
    v_cert_code VARCHAR(64);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_cycle_id := OLD.training_cycle_id;
    ELSE
        v_cycle_id := NEW.training_cycle_id;
    END IF;

    -- Busca metadados do ciclo
    SELECT tenant_id, student_id INTO v_tenant_id, v_student_id
    FROM training_cycles
    WHERE id = v_cycle_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Apura contagem real das 4 sessões
    SELECT
        COALESCE(COUNT(*) FILTER (WHERE attendance_status = 'PRESENTE'), 0)::SMALLINT,
        COALESCE(COUNT(*) FILTER (WHERE attendance_status = 'FALTA'), 0)::SMALLINT
    INTO v_presencas, v_faltas
    FROM class_sessions
    WHERE training_cycle_id = v_cycle_id;

    -- Consulta status de pagamento atual
    SELECT is_paid, certificate_code INTO v_is_paid, v_cert_code
    FROM certificate_records
    WHERE training_cycle_id = v_cycle_id;

    IF v_is_paid IS NULL THEN
        v_is_paid := false;
    END IF;

    -- Aplica as regras de negócio de elegibilidade:
    -- Presenças < 4 ou Faltas > 0 -> NAO_ELEGIVEL
    -- Presenças == 4 e Faltas == 0 -> PENDENTE_PAGAMENTO (se taxa não paga) ou PAGO_LIBERADO (se paga)
    IF v_presencas = 4 AND v_faltas = 0 THEN
        IF v_is_paid = true THEN
            v_new_eligibility := 'PAGO_LIBERADO';
            IF v_cert_code IS NULL THEN
                v_cert_code := 'UNIBE-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 12));
            END IF;
        ELSE
            v_new_eligibility := 'PENDENTE_PAGAMENTO';
        END IF;
    ELSE
        v_new_eligibility := 'NAO_ELEGIVEL';
    END IF;

    -- Atualiza ou insere o registro no certificate_records
    INSERT INTO certificate_records (
        tenant_id,
        student_id,
        training_cycle_id,
        attendance_count,
        absence_count,
        eligibility,
        is_paid,
        certificate_code,
        issued_at
    ) VALUES (
        v_tenant_id,
        v_student_id,
        v_cycle_id,
        v_presencas,
        v_faltas,
        v_new_eligibility,
        v_is_paid,
        v_cert_code,
        CASE WHEN v_new_eligibility = 'PAGO_LIBERADO' THEN CURRENT_TIMESTAMP ELSE NULL END
    )
    ON CONFLICT (training_cycle_id) DO UPDATE SET
        attendance_count = EXCLUDED.attendance_count,
        absence_count = EXCLUDED.absence_count,
        eligibility = EXCLUDED.eligibility,
        certificate_code = COALESCE(certificate_records.certificate_code, EXCLUDED.certificate_code),
        issued_at = CASE 
            WHEN EXCLUDED.eligibility = 'PAGO_LIBERADO' AND certificate_records.issued_at IS NULL 
            THEN CURRENT_TIMESTAMP 
            ELSE certificate_records.issued_at 
        END,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_certificate_attendance
    AFTER INSERT OR UPDATE OF attendance_status OR DELETE ON class_sessions
    FOR EACH ROW EXECUTE FUNCTION fn_sync_certificate_on_attendance_change();

-- Trigger 5.3: Liberação de certificado na quitação financeira (se presenças == 4)
CREATE OR REPLACE FUNCTION fn_on_certificate_payment_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_paid = true AND (OLD.is_paid = false OR OLD.is_paid IS NULL) THEN
        IF NEW.paid_at IS NULL THEN
            NEW.paid_at := CURRENT_TIMESTAMP;
        END IF;

        -- Se cumpriu 100% de frequência (4 presenças e 0 faltas), libera o certificado e emite o código
        IF NEW.attendance_count = 4 AND NEW.absence_count = 0 THEN
            NEW.eligibility := 'PAGO_LIBERADO';
            IF NEW.certificate_code IS NULL THEN
                NEW.certificate_code := 'UNIBE-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 12));
            END IF;
            IF NEW.issued_at IS NULL THEN
                NEW.issued_at := CURRENT_TIMESTAMP;
            END IF;
        ELSE
            -- Pagou a taxa, mas não tem 100% de presença
            NEW.eligibility := 'NAO_ELEGIVEL';
        END IF;
    ELSIF NEW.is_paid = false AND OLD.is_paid = true THEN
        IF NEW.attendance_count = 4 AND NEW.absence_count = 0 THEN
            NEW.eligibility := 'PENDENTE_PAGAMENTO';
        ELSE
            NEW.eligibility := 'NAO_ELEGIVEL';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_certificate_payment_status
    BEFORE UPDATE OF is_paid ON certificate_records
    FOR EACH ROW EXECUTE FUNCTION fn_on_certificate_payment_update();
