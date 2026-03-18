import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState({
      products: [],
      establishments: [],
      rounds: [],
      visits: [],
    });
  });

  it('adds a product', () => {
    useStore.getState().addProduct('Coca-Cola 1.5L', ['Gaseosas']);
    expect(useStore.getState().products.length).toBe(1);
    expect(useStore.getState().products[0].name).toBe('Coca-Cola 1.5L');
  });

  it('adds an establishment', () => {
    useStore.getState().addEstablishment('Mayorista El Sol');
    expect(useStore.getState().establishments.length).toBe(1);
    expect(useStore.getState().establishments[0].name).toBe('Mayorista El Sol');
  });

  it('creates a round with target products', () => {
    useStore.getState().addProduct('Coca-Cola');
    useStore.getState().addEstablishment('Tienda 1');
    
    const product = useStore.getState().products[0];
    useStore.getState().addRound('Ronda Prueba', '2026-03-17', [product.id]);
    
    expect(useStore.getState().rounds.length).toBe(1);
    expect(useStore.getState().rounds[0].name).toBe('Ronda Prueba');
    expect(useStore.getState().rounds[0].status).toBe('in_process');
  });

  it('adds a visit to a round', () => {
    useStore.getState().addProduct('Coca-Cola');
    useStore.getState().addEstablishment('Tienda 1');
    
    const product = useStore.getState().products[0];
    const establishment = useStore.getState().establishments[0];
    
    useStore.getState().addRound('Ronda Prueba', '2026-03-17', [product.id]);
    const round = useStore.getState().rounds[0];
    
    useStore.getState().addVisit(round.id, establishment.id);
    
    expect(useStore.getState().visits.length).toBe(1);
    expect(useStore.getState().visits[0].establishmentId).toBe(establishment.id);
  });

  it('prevents duplicate establishment visits in same round', () => {
    useStore.getState().addProduct('Coca-Cola');
    useStore.getState().addEstablishment('Tienda 1');
    
    const product = useStore.getState().products[0];
    const establishment = useStore.getState().establishments[0];
    
    useStore.getState().addRound('Ronda Prueba', '2026-03-17', [product.id]);
    const round = useStore.getState().rounds[0];
    
    useStore.getState().addVisit(round.id, establishment.id);
    const alreadyVisited = useStore.getState().isEstablishmentVisited(round.id, establishment.id);
    
    expect(alreadyVisited).toBe(true);
  });

  it('finds best price for product', () => {
    useStore.getState().addProduct('Coca-Cola');
    useStore.getState().addEstablishment('Tienda Barata');
    useStore.getState().addEstablishment('Tienda Cara');
    
    const product = useStore.getState().products[0];
    const cheapStore = useStore.getState().establishments[0];
    const expensiveStore = useStore.getState().establishments[1];
    
    useStore.getState().addRound('Ronda Prueba', '2026-03-17', [product.id]);
    const round = useStore.getState().rounds[0];
    
    useStore.getState().addVisit(round.id, cheapStore.id);
    useStore.getState().addVisit(round.id, expensiveStore.id);
    
    const visits = useStore.getState().getVisitsByRound(round.id);
    
    useStore.getState().updateVisitProduct(visits[0].id, product.id, 10, 'Bs');
    useStore.getState().updateVisitProduct(visits[1].id, product.id, 20, 'Bs');
    
    useStore.getState().completeVisit(visits[0].id);
    useStore.getState().completeVisit(visits[1].id);
    
    const best = useStore.getState().getBestPriceForProduct(round.id, product.id);
    
    expect(best?.price).toBe(10);
    expect(best?.establishmentName).toBe('Tienda Barata');
  });
});
