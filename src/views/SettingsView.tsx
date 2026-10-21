import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Clock, 
  Award, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { getSupabaseConfigStatus } from '../services/supabase';

export const SettingsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const supabaseStatus = getSupabaseConfigStatus();

  const handleCopySqlInstructions = () => {
    navigator.clipboard.writeText(`-- O script completo está salvo em /supabase/schema.sql no projeto.`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Configurações do Sistema
            </h1>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              Módulo Treinamento Social
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Parâmetros do curso, conexão com o Supabase e regras institucionais
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Connection Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Banco de Dados Supabase</h3>
              <span className="text-xs text-slate-400">PostgreSQL gerenciado + RLS</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-600 font-medium">Status da Conexão:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {supabaseStatus.isConfigured ? 'Conectado ao Supabase' : 'Modo Operacional Local (Ativo)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Instância URL:</span>
                <span className="text-slate-900">{supabaseStatus.url}</span>
              </div>
              <div className="flex justify-between">
                <span>Chave Anon Pública:</span>
                <span className="text-slate-900">{supabaseStatus.hasAnonKey ? 'Configurada' : 'Pendente em .env'}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-bold text-slate-800 block mb-1">Como conectar seu banco Supabase:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
                <li>Abra o <strong>SQL Editor</strong> no dashboard do seu projeto Supabase.</li>
                <li>Execute o script criado em <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">supabase/schema.sql</code>.</li>
                <li>Preencha <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">VITE_SUPABASE_URL</code> e <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">.env</code>.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Academic Course Rules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Parâmetros do Treinamento Social</h3>
              <span className="text-xs text-slate-400">Regras de negócio e certificação</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-600 font-medium">Formato do Ciclo:</span>
              <span className="font-bold text-slate-900">4 Sábados Consecutivos</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-600 font-medium">Carga Horária Total:</span>
              <span className="font-bold text-slate-900">16 Horas Presenciais</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-600 font-medium">Exigência de Assiduidade:</span>
              <span className="font-bold text-emerald-700">100% de Presença (4 de 4)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-600 font-medium">Taxa de Emissão do Certificado:</span>
              <span className="font-bold text-slate-900">R$ 35,00 (Controle de Quitação)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-600 font-medium">Turnos Ofertados:</span>
              <span className="font-bold text-slate-900">Manhã (08h-12h) e Tarde (13h-17h)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
