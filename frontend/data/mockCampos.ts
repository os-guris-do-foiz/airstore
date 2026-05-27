export interface Campo {
  id: string;
  name: string;
  description: string;
  rules: string[];
  infrastructure: string[];
  image: string;
  basePrice: number;    // Price for entry only (has own gear)
  rentalPrice: number;  // Additional price for rental kit (weapon + mask)
  location: string;
  type: string;
}

export const mockCampos: Campo[] = [
  {
    id: "c1",
    name: "Base Alpha - CQB",
    description: "Referência nacional em combate e simulação CQB (Close Quarters Battle). O campo apresenta um cenário de combate urbano denso com estruturas verticais, prédios de 2 andares, muitas barricadas, passagens secretas e respawns táticos. Projetado por ex-operadores de forças especiais, é ideal para jogos rápidos e com bastante adrenalina.",
    rules: [
      "FPS Máximo: 350 (medido com BBs 0.20g)",
      "Apenas tiro INTERMITENTE (Semi-Auto) dentro dos prédios",
      "Proibido uso de granadas sonoras (apenas fumaça ou BBs mecânicas)",
      "Obrigatório uso de proteção facial rígida (máscara meia face)",
      "Distância mínima de engajamento nula, prevalecendo a regra do 'Rendido' a menos de 3 metros"
    ],
    infrastructure: [
      "Estacionamento Privativo (50 vagas)",
      "Safe Zone Coberta e Ventilada",
      "Lanchonete Completa e Food Trucks aos finais de semana",
      "Loja de consumíveis (BBs, Gás, Baterias)",
      "Banheiros e Vestiários com chuveiro"
    ],
    image: "https://images.unsplash.com/photo-1549646543-de6304bfa4a6?q=80&w=1200&auto=format&fit=crop",
    basePrice: 20,
    rentalPrice: 50, // Total 70
    location: "Zona Oeste, São Paulo - SP",
    type: "CQB PPU",
  },
  {
    id: "c2",
    name: "Mata do Lobo - Floresta",
    description: "Um verdadeiro inferno verde para quem busca simulação militar (Milsim) autêntica. Mais de 50.000m² de mata nativa densa, cortada por um riacho. O terreno possui trincheiras cavadas à mão, posições fortificadas no alto dos morros, uma firebase central e inúmeros pontos de emboscada naturais.",
    rules: [
      "Assault: Máx 400 FPS (distância mín 5m)",
      "DMR: Máx 450 FPS (distância mín 15m)",
      "Sniper Action: Máx 500 FPS (distância mín 20m, sidearm obrigatória)",
      "Obrigatório pano vermelho (dead rag) para todos os jogadores",
      "Magazines limitados a MID-CAPs (exceto LMGs)"
    ],
    infrastructure: [
      "Estacionamento amplo (100+ vagas)",
      "Churrasqueiras disponíveis na Safe Zone",
      "Oficina rápida de manutenção",
      "Aluguel de equipamento disponível (mediante reserva)",
      "Área de camping noturno (para operações 24h)"
    ],
    image: "https://images.unsplash.com/photo-1601633519119-a9aecd77db0a?q=80&w=1200&auto=format&fit=crop",
    basePrice: 25,
    rentalPrice: 55, // Total 80
    location: "Serra da Cantareira - SP",
    type: "MATA / MILSIM",
  },
  {
    id: "c3",
    name: "Complexo Factory",
    description: "Situada em uma antiga fábrica abandonada e adaptada para esporte, o Complexo Factory oferece a mistura perfeita entre zonas de CQB (galpões fechados, salas escuras, corredores apertados) e combates Mid-Range nos pátios abertos industriais. Múltiplos pontos de elevação perfeitos para atiradores designados.",
    rules: [
      "FPS Máximo: 400 (CQB rigorosamente controlado com sidearms)",
      "Proibido subir em telhados improvisados (apenas torres demarcadas)",
      "Escadarias contam como zona de 'fogo livre' (permitido auto em lances curtos)",
      "Proibido cruzar janelas demarcadas com fita vermelha"
    ],
    infrastructure: [
      "Ampla Safe Zone industrial (pé direito de 10m)",
      "Loja completa e armeiro residente",
      "Área VIP para esquadrões (reserva a parte)",
      "Food park na entrada do complexo",
      "Estande de Tiro de Precisão (50m)"
    ],
    image: "https://images.unsplash.com/photo-1634567220261-26c7d2424fa7?q=80&w=1200&auto=format&fit=crop",
    basePrice: 30,
    rentalPrice: 50, // Total 80
    location: "Guarulhos - SP",
    type: "MISTO / URBANO",
  }
];
