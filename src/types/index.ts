export type RoundStatus = 'in_process' | 'completed' | 'deleted';
export type VisitStatus = 'pending' | 'completed';
export type Currency = 'Bs' | 'USD' | 'EUR';
export type RateType = 'bcv' | 'usdt' | 'eur';
export type BaseCurrency = 'Bs' | 'USD' | 'EUR';

export interface RatesConfig {
  bcv: number;
  usdt: number;
  eur: number;
}

export interface Product {
  id: string;
  name: string;
  tags: string[];
  createdAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  createdAt: string;
}

export interface VisitProduct {
  productId: string;
  price: number;
  currency: Currency;
}

export interface Visit {
  id: string;
  roundId: string;
  establishmentId: string;
  date: string;
  status: VisitStatus;
  products: VisitProduct[];
  createdAt: string;
}

export interface BuyingRound {
  id: string;
  name: string;
  date: string;
  status: RoundStatus;
  targetProductIds: string[];
  removedTargetProductIds?: string[];
  rates: RatesConfig;
  baseCurrency: BaseCurrency;
  createdAt: string;
}

export interface AppState {
  products: Product[];
  establishments: Establishment[];
  rounds: BuyingRound[];
  visits: Visit[];
  rates: RatesConfig;
  baseCurrency: BaseCurrency;
}

export interface AppActions {
  // Products
  addProduct: (name: string, tags?: string[]) => void;
  updateProduct: (id: string, name: string, tags?: string[]) => void;
  deleteProduct: (id: string) => void;
  getUnusedProducts: () => Product[];
  getAllTags: () => string[];
  
  // Establishments
  addEstablishment: (name: string) => void;
  updateEstablishment: (id: string, name: string) => void;
  deleteEstablishment: (id: string) => void;
  getUnusedEstablishments: () => Establishment[];
  
  // Rounds
  addRound: (name: string, date: string, targetProductIds: string[]) => string;
  updateRound: (id: string, updates: Partial<BuyingRound>) => void;
  deleteRound: (id: string) => void;
  completeRound: (id: string) => void;
  reopenRound: (id: string) => void;
  
  // Visits
  addVisit: (roundId: string, establishmentId: string) => string;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  updateVisitProduct: (visitId: string, productId: string, price: number, currency: Currency) => void;
  completeVisit: (id: string) => void;
  reopenVisit: (id: string) => void;
  deleteVisit: (id: string) => void;
  getVisitsByRound: (roundId: string) => Visit[];
  isEstablishmentVisited: (roundId: string, establishmentId: string) => boolean;
  
  // Resumen
  getBestPriceForProduct: (roundId: string, productId: string) => { price: number; establishmentName: string; currency: Currency } | null;
  getProductById: (productId: string) => Product | undefined;
  isProductInUse: (productId: string) => boolean;
  isEstablishmentInUse: (establishmentId: string) => boolean;
  
  // Rates & Currency
  updateRates: (rates: Partial<RatesConfig>) => void;
  updateBaseCurrency: (currency: BaseCurrency) => void;
  convertPrice: (amount: number, fromCurrency: Currency, rates: RatesConfig, toCurrency: BaseCurrency) => number;
  
  // Round Product Management
  addProductToRound: (roundId: string, productId: string) => void;
  removeProductFromRound: (roundId: string, productId: string) => void;
  restoreProductToRound: (roundId: string, productId: string) => void;
}

export type Store = AppState & AppActions;
