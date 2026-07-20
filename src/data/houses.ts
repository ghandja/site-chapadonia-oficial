export interface House {
  id: number;
  name: string;
  city: string;
  size: number;       // sqm
  rent: number;       // gp
  beds: number;
  floors: number;
  rooms: number;      // salas
  owner: string | null;
  status: "Livre" | "Ocupada" | "Leilão";
  auctionEnd?: string;
  currentBid?: number;
}

export const houses: House[] = [
  // Thais
  { id: 1, name: "Thais Arena 1", city: "Thais", size: 28, rent: 100000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  { id: 2, name: "Magic Shop Quarter 1", city: "Thais", size: 32, rent: 150000, beds: 3, floors: 2, rooms: 3, owner: null, status: "Livre" },
  { id: 3, name: "Triumph Street 1", city: "Thais", size: 35, rent: 80000, beds: 2, floors: 2, rooms: 2, owner: null, status: "Livre" },
  { id: 16, name: "Thais Arena 2", city: "Thais", size: 45, rent: 200000, beds: 4, floors: 2, rooms: 4, owner: null, status: "Livre" },
  
  // Venore
  { id: 4, name: "Venore Diamond 1", city: "Venore", size: 22, rent: 50000, beds: 2, floors: 1, rooms: 1, owner: null, status: "Livre" },
  { id: 5, name: "Venore Diamond 2", city: "Venore", size: 40, rent: 100000, beds: 3, floors: 2, rooms: 3, owner: null, status: "Livre" },
  { id: 17, name: "Venore Street 3", city: "Venore", size: 60, rent: 120000, beds: 4, floors: 2, rooms: 4, owner: null, status: "Livre" },
  
  // Carlin
  { id: 6, name: "Carlin Street 1", city: "Carlin", size: 17, rent: 25000, beds: 1, floors: 1, rooms: 1, owner: null, status: "Livre" },
  { id: 18, name: "Carlin Castle Lane 2", city: "Carlin", size: 24, rent: 40000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  
  // Edron
  { id: 7, name: "Edron Magic 1", city: "Edron", size: 45, rent: 200000, beds: 4, floors: 3, rooms: 4, owner: null, status: "Livre" },
  { id: 8, name: "Edron Magic 2", city: "Edron", size: 26, rent: 80000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  { id: 19, name: "Edron Magic 3", city: "Edron", size: 38, rent: 110000, beds: 3, floors: 2, rooms: 3, owner: null, status: "Livre" },
  
  // Darashia
  { id: 9, name: "Darashia Desert 1", city: "Darashia", size: 20, rent: 50000, beds: 2, floors: 1, rooms: 1, owner: null, status: "Livre" },
  { id: 20, name: "Darashia Desert 2", city: "Darashia", size: 55, rent: 180000, beds: 4, floors: 2, rooms: 5, owner: null, status: "Livre" },
  
  // Liberty Bay
  { id: 10, name: "Liberty Bay Coast 1", city: "Liberty Bay", size: 50, rent: 150000, beds: 4, floors: 2, rooms: 4, owner: null, status: "Livre" },
  
  // Ankrahmun
  { id: 11, name: "Ankrahmun Pyramid 1", city: "Ankrahmun", size: 37, rent: 100000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  
  // Kazordoon
  { id: 12, name: "Kazordoon Mine 1", city: "Kazordoon", size: 15, rent: 25000, beds: 1, floors: 1, rooms: 1, owner: null, status: "Livre" },
  { id: 21, name: "Kazordoon Mine 2", city: "Kazordoon", size: 22, rent: 45000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  
  // Svargrond
  { id: 13, name: "Svargrond Ice 1", city: "Svargrond", size: 18, rent: 50000, beds: 1, floors: 1, rooms: 1, owner: null, status: "Livre" },
  { id: 22, name: "Svargrond Ice 2", city: "Svargrond", size: 35, rent: 90000, beds: 2, floors: 2, rooms: 3, owner: null, status: "Livre" },
  
  // Port Hope
  { id: 14, name: "Port Hope Jungle 1", city: "Port Hope", size: 12, rent: 25000, beds: 1, floors: 1, rooms: 1, owner: null, status: "Livre" },
  { id: 23, name: "Port Hope Jungle 2", city: "Port Hope", size: 28, rent: 60000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  
  // Moonfall
  { id: 15, name: "Moonfall Glade 1", city: "Moonfall", size: 30, rent: 80000, beds: 2, floors: 1, rooms: 2, owner: null, status: "Livre" },
  { id: 24, name: "Moonfall Glade 2", city: "Moonfall", size: 52, rent: 160000, beds: 4, floors: 2, rooms: 4, owner: null, status: "Livre" }
];
