/**
 * Dados do "The Cozy Map" — dados puros, sem React.
 *
 * Dois blocos, de propósito separados:
 *  - PLACES       → conteúdo DEFINITIVO, da Jules. Está vazio até ela passar a lista real.
 *  - DEMO_PLACES  → exemplos só para testar o mapa (pins, filtros, painel).
 *                   Aparecem apenas em dev / preview (ver `visiblePlaces`) e vêm
 *                   marcados com `demo: true` e rótulo "exemplo" na interface.
 *
 * Para publicar o conteúdo real: preencha PLACES. Nada mais precisa mudar.
 */

import { HOTSPOT_DEBUG } from "@/components/RoomScene/debug";

export type CityId = "new-york" | "sao-paulo" | "buenos-aires";

export type CozyPlace = {
  id: string;
  name: string;
  city: CityId;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  /** frase curta e pessoal, na voz da Jules */
  description: string;
  /** link do Google Maps */
  mapsUrl: string;
  /** foto opcional (caminho em /public ou URL) */
  imageUrl?: string;
  /** true = item de teste; nunca vai para a versão pública */
  demo?: boolean;
};

export type CityDef = {
  id: CityId;
  label: string;
  /** centro e zoom usados quando a cidade não tem lugares (estado vazio) */
  center: [lng: number, lat: number];
  zoom: number;
};

export const CITIES: CityDef[] = [
  { id: "new-york", label: "New York", center: [-73.9857, 40.7484], zoom: 10.6 },
  { id: "sao-paulo", label: "São Paulo", center: [-46.6333, -23.5505], zoom: 10.6 },
  { id: "buenos-aires", label: "Buenos Aires", center: [-58.3888, -34.6096], zoom: 11 },
];

/* ───────────── CONTEÚDO DEFINITIVO (Jules) ───────────── */

/**
 * Link do Google Maps por nome + endereço (em vez de só coordenada) — abre
 * já mostrando o nome certo do lugar, não um pin genérico.
 */
const mapsSearch = (name: string, address: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}, ${city}`)}`;

/**
 * Lote da lista salva da Jules no Google Maps (São Paulo + New York) —
 * endereços e coordenadas confirmados (OpenStreetMap/Nominatim, rua +
 * número exatos). Buenos Aires ainda não tem lugares reais (ver DEMO_PLACES).
 *
 * `description` está vazia em todos por enquanto: TROCAR por uma frase
 * pessoal e curta antes de publicar (ex. "meu lugar favorito pra brunch de
 * domingo"). Deixei vazia de propósito, em vez de um texto de placeholder —
 * a interface (CozyMapModal.tsx) só mostra a linha quando há frase, então
 * sem ela o card fica limpo (nome + bairro/endereço), sem aparentar
 * inacabado. Melhor assim do que eu inventar uma opinião sua.
 */
export const PLACES: CozyPlace[] = [
  {
    id: "mef-cafe-brunch",
    name: "Mef's Café & Brunch",
    city: "sao-paulo",
    neighborhood: "Pinheiros",
    address: "R. Inácio Pereira da Rocha, 248",
    latitude: -23.55978,
    longitude: -46.6893143,
    description: "",
    mapsUrl: mapsSearch("Mef's Café & Brunch", "R. Inácio Pereira da Rocha, 248, Pinheiros", "São Paulo"),
  },
  {
    id: "le-jazz-boulangerie",
    name: "Le Jazz Boulangerie",
    city: "sao-paulo",
    neighborhood: "Pinheiros",
    address: "R. Joaquim Antunes, 501",
    latitude: -23.5643727,
    longitude: -46.6817595,
    description: "",
    mapsUrl: mapsSearch("Le Jazz Boulangerie", "R. Joaquim Antunes, 501, Pinheiros", "São Paulo"),
  },
  {
    id: "mug-sp-barao-de-tatui",
    name: "mug.sp - Casarão Barão de Tatuí",
    city: "sao-paulo",
    neighborhood: "Vila Buarque",
    address: "R. Barão de Tatuí, 361",
    latitude: -23.5391462,
    longitude: -46.6540898,
    description: "",
    mapsUrl: mapsSearch("mug.sp - Casarão Barão de Tatuí", "R. Barão de Tatuí, 361, Vila Buarque", "São Paulo"),
  },
  {
    id: "mag-market",
    name: "MAG Market",
    city: "sao-paulo",
    neighborhood: "Itaim Bibi",
    address: "R. Dr. Renato Paes de Barros, 433",
    latitude: -23.5823724,
    longitude: -46.6741233,
    description: "",
    mapsUrl: mapsSearch("MAG Market", "R. Dr. Renato Paes de Barros, 433, Itaim Bibi", "São Paulo"),
  },
  {
    id: "ame-cafe-patisserie",
    name: "Âme Café & Patisserie",
    city: "sao-paulo",
    neighborhood: "Pinheiros",
    address: "R. Artur de Azevedo, 1711",
    latitude: -23.5659205,
    longitude: -46.6870795,
    description: "",
    mapsUrl: mapsSearch("Âme Café & Patisserie", "R. Artur de Azevedo, 1711, Pinheiros", "São Paulo"),
  },
  {
    id: "matcha-minka",
    name: "Matcha minka",
    city: "sao-paulo",
    neighborhood: "Liberdade",
    address: "R. Américo de Campos, 28",
    latitude: -23.5572826,
    longitude: -46.6356939,
    description: "",
    mapsUrl: mapsSearch("Matcha minka", "R. Américo de Campos, 28, Liberdade", "São Paulo"),
  },
  {
    id: "mintchi-croissant",
    name: "Mintchi Croissant",
    city: "sao-paulo",
    neighborhood: "Pinheiros",
    address: "R. Simão Álvares, 114",
    latitude: -23.5662108,
    longitude: -46.6869567,
    description: "",
    mapsUrl: mapsSearch("Mintchi Croissant", "R. Simão Álvares, 114, Pinheiros", "São Paulo"),
  },
  {
    id: "la-cabra",
    name: "La Cabra",
    city: "new-york",
    neighborhood: "East Village",
    address: "152 2nd Ave",
    latitude: 40.7293547,
    longitude: -73.9866878,
    description: "",
    mapsUrl: mapsSearch("La Cabra", "152 2nd Ave", "New York, NY"),
  },
  {
    id: "blank-street-nomad",
    name: "Blank Street",
    city: "new-york",
    neighborhood: "NoMad",
    address: "298 5th Ave #1004",
    latitude: 40.7465325,
    longitude: -73.986267,
    description: "",
    mapsUrl: mapsSearch("Blank Street Coffee", "298 5th Ave, New York, NY 10016", "New York, NY"),
  },
  {
    id: "culture-espresso",
    name: "Culture Espresso",
    city: "new-york",
    neighborhood: "Midtown South",
    address: "72 W 38th St",
    latitude: 40.7518497,
    longitude: -73.9850613,
    description: "",
    mapsUrl: mapsSearch("Culture Espresso", "72 W 38th St", "New York, NY"),
  },
  {
    id: "ralphs-coffee",
    name: "Ralph's Coffee",
    city: "new-york",
    neighborhood: "Upper East Side",
    address: "888 Madison Ave",
    latitude: 40.7716285,
    longitude: -73.9657301,
    description: "",
    mapsUrl: mapsSearch("Ralph's Coffee", "888 Madison Ave", "New York, NY"),
  },
  {
    id: "maman-ues",
    name: "Maman",
    city: "new-york",
    neighborhood: "Upper East Side",
    address: "1424 3rd Ave",
    latitude: 40.7755174,
    longitude: -73.9566349,
    description: "",
    mapsUrl: mapsSearch("Maman", "1424 3rd Ave", "New York, NY"),
  },
  {
    id: "apollo-bagels",
    name: "Apollo Bagels",
    city: "new-york",
    neighborhood: "Garment District",
    address: "224 W 35th St",
    latitude: 40.7519242,
    longitude: -73.9912869,
    description: "",
    mapsUrl: mapsSearch("Apollo Bagels", "224 W 35th St", "New York, NY"),
  },
  {
    id: "devocion-williamsburg",
    name: "Devoción (Williamsburg)",
    city: "new-york",
    neighborhood: "Williamsburg, Brooklyn",
    address: "148 Grand St",
    latitude: 40.7147568,
    longitude: -73.9622348,
    description: "",
    mapsUrl: mapsSearch("Devoción", "148 Grand St, Brooklyn, NY", "New York, NY"),
  },
];

/* ───────────── EXEMPLOS DE TESTE — não são recomendações reais ─────────────
   As coordenadas são pontos de bairros reais, só para o mapa ter onde posicionar
   os pins. Nenhum nome, endereço ou texto aqui é um estabelecimento de verdade.
   São Paulo e New York já têm conteúdo real (ver PLACES) e não precisam de
   exemplo; Buenos Aires ainda não tem lugares reais, então fica com exemplo
   pra testar o mapa/painel até a lista real chegar. */

const mapsAt = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const demo = (p: Omit<CozyPlace, "demo" | "mapsUrl" | "address"> & { address?: string }): CozyPlace => ({
  address: "endereço de exemplo",
  ...p,
  mapsUrl: mapsAt(p.latitude, p.longitude),
  demo: true,
});

export const DEMO_PLACES: CozyPlace[] = [
  demo({
    id: "demo-ba-1",
    name: "Lugar de exemplo 1",
    city: "buenos-aires",
    neighborhood: "Palermo",
    latitude: -34.5803362,
    longitude: -58.4245236,
    description: "texto de exemplo, troque pelo comentário real da Jules",
  }),
  demo({
    id: "demo-ba-2",
    name: "Lugar de exemplo 2",
    city: "buenos-aires",
    neighborhood: "Recoleta",
    latitude: -34.587358,
    longitude: -58.39157,
    description: "texto de exemplo, troque pelo comentário real da Jules",
  }),
];

/** Lista que a interface usa: definitiva sempre; exemplos só em dev/preview. */
export const visiblePlaces: CozyPlace[] = HOTSPOT_DEBUG ? [...PLACES, ...DEMO_PLACES] : PLACES;

/** O hotspot da máquina de café só fica ativo na versão pública quando há conteúdo real. */
export const HAS_REAL_PLACES = PLACES.length > 0;

export const placesIn = (city: CityId): CozyPlace[] => visiblePlaces.filter((p) => p.city === city);
