import React from "react";
import LegalLayout, { LegalSection } from "./LegalLayout";

const Privacy: React.FC = () => (
  <LegalLayout
    title="Política de Privacidade"
    subtitle="Como a Fronteira Airsoft coleta, usa e protege os seus dados, em conformidade com a LGPD (Lei nº 13.709/2018)."
    updatedAt="12 de julho de 2026"
    docTitle="Privacidade — Fronteira Airsoft"
  >
    <p className="text-gray-500 italic border-l-2 border-brand-border pl-4">
      Resumo em linguagem simples: coletamos o mínimo necessário para o site funcionar, não
      vendemos os seus dados e você pode pedir para acessar ou apagar as suas informações a
      qualquer momento.
    </p>

    <LegalSection n={1} title="Dados que coletamos">
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Cadastro:</strong> nome, e-mail, senha (armazenada de forma criptografada) e cidade.</li>
        <li><strong>Perfil:</strong> apelido, bio, foto e banner que você opcionalmente adicionar.</li>
        <li><strong>Conteúdo:</strong> anúncios, avaliações, times, campos e mensagens de denúncia.</li>
        <li><strong>Uso:</strong> registros técnicos mínimos (data/hora de acesso) para segurança e prevenção a abuso.</li>
      </ul>
    </LegalSection>

    <LegalSection n={2} title="Como usamos os dados">
      <ul className="list-disc pl-5 space-y-1">
        <li>Operar a plataforma (login, publicação de anúncios, avaliações);</li>
        <li>Enviar códigos de verificação e recuperação de senha por e-mail;</li>
        <li>Prevenir fraudes, spam e violações dos Termos de Uso;</li>
        <li>Melhorar a experiência e a organização do conteúdo.</li>
      </ul>
      <p>Não usamos os seus dados para publicidade de terceiros nem os vendemos.</p>
    </LegalSection>

    <LegalSection n={3} title="O que fica público">
      <p>
        Alguns dados são públicos por natureza do serviço: nome/apelido, foto de perfil, cidade,
        anúncios e avaliações. <strong>Seu e-mail e sua senha nunca são exibidos</strong> a outros
        usuários. O contato para negociação é feito pelo canal que você escolher divulgar (ex.: WhatsApp).
      </p>
    </LegalSection>

    <LegalSection n={4} title="Compartilhamento">
      <p>
        Compartilhamos dados apenas quando necessário para operar o serviço (ex.: provedor de e-mail
        para envio de códigos) ou por obrigação legal. Provedores de infraestrutura tratam os dados
        seguindo instruções da plataforma.
      </p>
    </LegalSection>

    <LegalSection n={5} title="Seus direitos (LGPD)">
      <p>Você pode, a qualquer momento:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Acessar e corrigir seus dados pelo painel de perfil e configurações;</li>
        <li>Solicitar a exclusão da sua conta e dos dados associados;</li>
        <li>Revogar consentimentos e pedir informações sobre o tratamento dos seus dados.</li>
      </ul>
      <p>
        Para exercer esses direitos, use a página de <a href="/contact" className="text-brand-primary-light hover:underline">Contato</a>.
      </p>
    </LegalSection>

    <LegalSection n={6} title="Segurança">
      <p>
        Senhas são armazenadas com hash (bcrypt) e o acesso é protegido por autenticação. Adotamos
        medidas técnicas razoáveis, mas nenhum sistema é 100% imune — mantenha a sua senha em sigilo.
      </p>
    </LegalSection>

    <LegalSection n={7} title="Retenção">
      <p>
        Mantemos os dados enquanto a sua conta existir. Ao excluir a conta, removemos ou anonimizamos
        os dados pessoais, exceto o que a lei exigir preservar.
      </p>
    </LegalSection>

    <p className="text-[11px] text-gray-600 border-t border-brand-border pt-6">
      Este documento é um modelo inicial e não substitui aconselhamento jurídico. Recomenda-se
      revisão por um profissional para adequação total à LGPD antes de operação comercial.
    </p>
  </LegalLayout>
);

export default Privacy;
