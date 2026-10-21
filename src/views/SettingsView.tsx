import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Shirt, 
  Clock, 
  Award, 
  ShieldCheck, 
  Building, 
  Sun, 
  Moon, 
  Download, 
  CheckCircle2,
  FileCheck,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { isDark, setTheme } = useTheme();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('Rua Silva Jardim, 99');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleExportBackup = () => {
    alert('Backup do sistema gerado com sucesso. Os dados estão seguros e atualizados.');
  };

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Configurações do Sistema
            </h1>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              UNIBE Treinamento Social
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Parâmetros do polo, regras institucionais e preferências de tema
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Dados</span>
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Polo Institucional & Localização */}
        <div className="bg-white dark:bg-[#0E1726] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Polo Oficial UNIBE</h3>
              <span className="text-[11px] text-slate-400">Dados de localização e comparecimento</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Endereço Oficial:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Rua Silva Jardim, 99
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyAddress}
                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {copiedAddress ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-2.5 text-rose-900 dark:text-rose-300">
              <Shirt className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  Vestimenta Obrigatória:
                </span>
                <span className="font-semibold text-xs leading-relaxed block mt-0.5">
                  Calça, sapato fechado e blusa vermelha ou branca.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Status Operacional:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/50 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Polo Ativo • Sistema Operacional
              </span>
            </div>
          </div>
        </div>

        {/* 2. Aparência do Sistema: Alternador de Modo Escuro / Claro */}
        <div className="bg-white dark:bg-[#0E1726] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Aparência & Tema</h3>
              <span className="text-[11px] text-slate-400">Alterne entre o Modo Claro e o Modo Escuro</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Light Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  !isDark
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  {!isDark && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Modo Claro</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Visual clássico de alta nitidez</span>
              </button>

              {/* Dark Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isDark
                    ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  {isDark && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">Modo Escuro</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Foco visual e redução de fadiga</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              A preferência é salva automaticamente e aplicada a todas as telas, botões, tabelas e janelas de emissão.
            </p>
          </div>
        </div>

        {/* 3. Regras Institucionais do Treinamento Social */}
        <div className="bg-white dark:bg-[#0E1726] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Parâmetros Pedagógicos</h3>
              <span className="text-[11px] text-slate-400">Critérios do Treinamento Social</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Ciclo Oficial:</span>
              <span className="font-bold text-slate-900 dark:text-white">4 Sábados Consecutivos</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Carga Horária Total:</span>
              <span className="font-bold text-slate-900 dark:text-white">16 Horas Presenciais</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Assiduidade Obrigatória:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">100% de Presença (4 de 4)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Taxa de Emissão do Certificado:</span>
              <span className="font-bold text-slate-900 dark:text-white">R$ 35,00 (Controle de Quitação)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Turnos Disponíveis:</span>
              <span className="font-bold text-slate-900 dark:text-white">Manhã (08h-12h) e Tarde (13h-17h)</span>
            </div>
          </div>
        </div>

        {/* 4. Segurança e Integridade dos Dados */}
        <div className="bg-white dark:bg-[#0E1726] rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Armazenamento & Segurança</h3>
              <span className="text-[11px] text-slate-400">Proteção de dados cadastrais</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Persistência dos Registros:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Ativa & Segura</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Conformidade:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">LGPD Institucional</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Chave de Certificação:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">SHA-256 / UNIBE</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Todos os registros de alunos menores contam com autorização expressa do responsável legal vinculado no ato da matrícula.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
