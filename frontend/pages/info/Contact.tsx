import React from "react";
import { Mail, Instagram, MessageCircle, ShieldAlert, Info } from "lucide-react";
import LegalLayout from "./LegalLayout";

const CHANNELS = [
  {
    icon: <Mail className="text-brand-primary" size={22} />,
    label: "E-mail",
    value: "contato@fronteiraairsoft.com.br",
    href: "mailto:contato@fronteiraairsoft.com.br",
    note: "Suporte, parcerias e solicitações de dados (LGPD).",
  },
  {
    icon: <Instagram className="text-brand-purple-light" size={22} />,
    label: "Instagram",
    value: "@fronteiraairsoft",
    href: "#",
    note: "Novidades, destaques da comunidade e bastidores.",
  },
  {
    icon: <MessageCircle className="text-brand-cyan" size={22} />,
    label: "Discord",
    value: "Servidor da Comunidade",
    href: "#",
    note: "Converse com outros operadores em tempo real.",
  },
];

const Contact: React.FC = () => (
  <LegalLayout
    title="Contato"
    subtitle="Fala, operador. Precisa de suporte, quer relatar um problema ou tem uma parceria em mente? Escolha um canal abaixo."
    updatedAt="12 de julho de 2026"
    docTitle="Contato — Fronteira Airsoft"
  >
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
      {CHANNELS.map((c) => (
        <a
          key={c.label}
          href={c.href}
          className="group bg-brand-card border border-brand-border tactical-panel-sm p-5 hover:border-brand-primary/50 transition-colors block"
        >
          <div className="mb-3 group-hover:scale-110 transition-transform w-fit">{c.icon}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{c.label}</div>
          <div className="text-white font-bold text-sm break-words">{c.value}</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{c.note}</p>
        </a>
      ))}
    </div>

    <div className="bg-brand-bg border border-brand-border tactical-panel-sm p-5 flex gap-4">
      <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={20} />
      <div>
        <h3 className="text-white font-bold text-sm mb-1">Denunciar abuso ou golpe</h3>
        <p className="text-gray-400 text-xs leading-relaxed">
          Encontrou um anúncio suspeito, um usuário mal-intencionado ou um bug? Use o botão
          <strong> "Reportar Erro"</strong> no rodapé de qualquer página, ou o botão de denúncia
          dentro do anúncio/perfil. Toda denúncia é analisada pela moderação.
        </p>
      </div>
    </div>

    <div className="bg-brand-bg border border-brand-border tactical-panel-sm p-5 flex gap-4">
      <Info className="text-brand-primary shrink-0 mt-0.5" size={20} />
      <div>
        <h3 className="text-white font-bold text-sm mb-1">Sobre negociações</h3>
        <p className="text-gray-400 text-xs leading-relaxed">
          Lembre-se: a Fronteira Airsoft apenas conecta pessoas. Não intermediamos pagamentos nem
          entregas. O contato para comprar/vender é feito diretamente com o anunciante pelo canal
          divulgado no anúncio (geralmente WhatsApp).
        </p>
      </div>
    </div>
  </LegalLayout>
);

export default Contact;
