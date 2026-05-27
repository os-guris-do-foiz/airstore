import { Field, GameList } from "../types/fields";

export const MOCK_FIELDS: Field[] = [
  {
    id: "campo-foz",
    name: "Campo Foz Airsoft",
    city: "Foz do Iguaçu",
    address: "Rua das Missões, 1234 - Centro",
    price: 35,
    description:
      "O maior campo de CQB da região, com mais de 2000m² de área construída e diversos obstáculos realistas.",
    rules: [
      "Uso obrigatório de máscara facial completa",
      "Limite de 380 FPS para rifles",
      "Proibido o uso de granadas pirotécnicas",
      "Respeitar a distância mínima de engajamento",
    ],
    contact: "5545999999999",
    photos: [
      "https://picsum.photos/seed/field1/1200/800",
      "https://picsum.photos/seed/field1b/1200/800",
      "https://picsum.photos/seed/field1c/1200/800",
      "https://picsum.photos/seed/field1d/1200/800",
    ],
    coordinates: { lat: -25.5478, lng: -54.5882 },
    amenities: ["Estacionamento", "Lanchonete", "Banheiros", "Área de Safe"],
    schedules: [
      { day: "Sábado", slots: ["08:00", "10:00", "14:00", "16:00"] },
      { day: "Domingo", slots: ["09:00", "14:00", "16:00"] },
    ],
  },
  {
    id: "campo-ctb",
    name: "CTB - Centro de Treinamento",
    city: "Curitiba",
    address: "Av. das Torres, 500",
    price: 50,
    description:
      "Campo focado em Milsim e treinamentos táticos. Área de mata e edificações.",
    rules: [
      "Bio-BBs obrigatórias",
      "Ponta laranja sempre visível",
      "Fair play acima de tudo",
    ],
    contact: "5541988888888",
    photos: ["https://picsum.photos/seed/field2/800/600"],
    coordinates: { lat: -25.4284, lng: -49.2733 },
    amenities: ["Aluguel de Equipamento", "Oficina", "Vestiários"],
    schedules: [
      { day: "Sábado", slots: ["08:00", "13:00"] },
      { day: "Domingo", slots: ["08:00", "13:00"] },
    ],
  },
];

export const MOCK_LISTS: GameList[] = [
  {
    id: "list-1",
    name: "Operação Foz",
    date: "2026-04-12",
    time: "08:00",
    type: "public",
    maxPlayers: 20,
    observation: "Trazer BBs biodegradáveis. Teremos cronagem no local.",
    createdBy: "user1",
    participants: [
      {
        id: "p1",
        name: "Lucas",
        hasOwnGear: true,
        needsRental: false,
        peopleCount: 2,
      },
      {
        id: "p2",
        name: "João",
        hasOwnGear: false,
        needsRental: false,
        peopleCount: 1,
      },
      {
        id: "p3",
        name: "Carlos",
        hasOwnGear: false,
        needsRental: true,
        peopleCount: 1,
      },
    ],
  },
];
