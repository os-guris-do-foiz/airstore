import React from "react";
import LegalLayout, { LegalSection } from "./LegalLayout";

const Terms: React.FC = () => (
  <LegalLayout
    title="Termos de Uso"
    subtitle="As regras para usar a plataforma Fronteira Airsoft. Ao criar uma conta ou anunciar, você concorda com os termos abaixo."
    updatedAt="12 de julho de 2026"
    docTitle="Termos de Uso — Fronteira Airsoft"
  >
    <p className="text-gray-500 italic border-l-2 border-brand-border pl-4">
      Resumo em linguagem simples: somos um ponto de encontro entre pessoas da comunidade de
      airsoft. Não vendemos nada, não intermediamos pagamentos e não garantimos negócios —
      quem anuncia é responsável pelo que anuncia, e quem compra negocia por conta e risco.
    </p>

    <LegalSection n={1} title="O que é a Fronteira Airsoft">
      <p>
        A Fronteira Airsoft é uma plataforma comunitária que conecta praticantes de airsoft para
        anunciar e encontrar equipamentos, serviços, campos e times. Atuamos apenas como um
        <strong> intermediário de divulgação</strong>: não somos parte das negociações, não
        processamos pagamentos e não realizamos entregas.
      </p>
    </LegalSection>

    <LegalSection n={2} title="Conta e responsabilidade">
      <p>Para anunciar ou interagir, você precisa criar uma conta com informações verdadeiras.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Você é responsável por manter a sua senha em segurança.</li>
        <li>Você responde por todo conteúdo publicado a partir da sua conta.</li>
        <li>É proibido criar contas em nome de terceiros ou fornecer dados falsos.</li>
      </ul>
    </LegalSection>

    <LegalSection n={3} title="Anúncios e condutas proibidas">
      <p>Ao anunciar, você declara ser o responsável legal pelo item ou serviço. É proibido anunciar:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Armas de fogo, munição real ou qualquer item ilegal;</li>
        <li>Produtos falsificados, roubados ou de origem duvidosa;</li>
        <li>Conteúdo ofensivo, discriminatório, fraudulento ou enganoso;</li>
        <li>Itens que violem as leis brasileiras aplicáveis à réplica/simulacro de armas.</li>
      </ul>
      <p>
        Réplicas de airsoft devem seguir a legislação vigente (incluindo regras sobre marcação de
        ponta laranja e comercialização). A responsabilidade legal é de quem anuncia.
      </p>
    </LegalSection>

    <LegalSection n={4} title="Negociações entre usuários">
      <p>
        Todo contato e pagamento acontece <strong>diretamente entre as partes</strong>, fora da
        plataforma (normalmente por WhatsApp). A Fronteira Airsoft não garante a qualidade, a
        entrega, a procedência ou a idoneidade de nenhum anúncio. Recomendamos cautela: prefira
        encontros em locais públicos e desconfie de preços bons demais.
      </p>
    </LegalSection>

    <LegalSection n={5} title="Doações e destaque (Premium)">
      <p>
        O projeto se mantém por doações voluntárias. Doações podem conceder benefícios de destaque
        temporário (selo "Doador" e prioridade nas buscas). Doações não são reembolsáveis e não
        representam compra de produto ou garantia de resultado comercial.
      </p>
    </LegalSection>

    <LegalSection n={6} title="Moderação e remoção de conteúdo">
      <p>
        Podemos remover anúncios, suspender ou banir contas que violem estes termos, sem aviso
        prévio, especialmente em casos de denúncia, fraude ou risco à comunidade.
      </p>
    </LegalSection>

    <LegalSection n={7} title="Limitação de responsabilidade">
      <p>
        A plataforma é oferecida "como está". Não nos responsabilizamos por prejuízos decorrentes de
        negociações entre usuários, indisponibilidade temporária do serviço ou conteúdo publicado por
        terceiros.
      </p>
    </LegalSection>

    <LegalSection n={8} title="Alterações e contato">
      <p>
        Estes termos podem ser atualizados a qualquer momento; a data acima indica a última revisão.
        Dúvidas podem ser enviadas pela página de <a href="/contact" className="text-brand-primary-light hover:underline">Contato</a>.
      </p>
    </LegalSection>

    <p className="text-[11px] text-gray-600 border-t border-brand-border pt-6">
      Este documento é um modelo inicial da plataforma e não substitui aconselhamento jurídico
      profissional. Recomenda-se revisão por um advogado antes de operação comercial.
    </p>
  </LegalLayout>
);

export default Terms;
