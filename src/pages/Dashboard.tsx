import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button, Card, CardContent, Dialog, Input, ConfirmDialog, SwipeableCard } from '../components';
import type { RatesConfig, BaseCurrency } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { rounds, products, addRound, completeRound, reopenRound, deleteRound, addProduct, getVisitsByRound, rates, baseCurrency } = useStore();
  const [showNewRound, setShowNewRound] = useState(false);
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; roundId: string | null }>({ show: false, roundId: null });
  const [roundRates, setRoundRates] = useState<RatesConfig>({ bcv: 0, usdt: 0, eur: 0 });
  const [roundBaseCurrency, setRoundBaseCurrency] = useState<BaseCurrency>('Bs');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewRound) {
      setRoundRates({ ...rates });
      setRoundBaseCurrency(baseCurrency);
    }
  }, [showNewRound, rates, baseCurrency]);

  const activeRounds = rounds.filter((r) => r.status === 'in_process');
  const completedRounds = rounds.filter((r) => r.status === 'completed');

  const handleCreateRound = () => {
    if (roundName.trim() && selectedProducts.length > 0) {
      const newRoundId = addRound(roundName, roundDate, selectedProducts);
      const state = useStore.getState();
      state.updateRound(newRoundId, { rates: { ...roundRates }, baseCurrency: roundBaseCurrency });
      setShowNewRound(false);
      setRoundName('');
      setSelectedProducts([]);
      navigate(`/rounds/${newRoundId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roundName.trim() && selectedProducts.length > 0) {
      handleCreateRound();
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddNewProduct = () => {
    if (newProductName.trim()) {
      addProduct(newProductName.trim(), []);
      const newProduct = useStore.getState().products.find(p => p.name === newProductName.trim());
      if (newProduct) {
        setSelectedProducts(prev => [...prev, newProduct.id]);
      }
      setNewProductName('');
      setShowNewProduct(false);
    }
  };

  const handleDeleteClick = (roundId: string) => {
    setDeleteConfirm({ show: true, roundId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.roundId) {
      deleteRound(deleteConfirm.roundId);
    }
    setDeleteConfirm({ show: false, roundId: null });
  };

  const handleToggleStatus = (roundId: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      reopenRound(roundId);
    } else if (currentStatus === 'in_process') {
      completeRound(roundId);
    }
  };

  const handleOpenDialog = () => {
    setShowNewRound(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rondas de Compra</h2>
        <Button onClick={handleOpenDialog}>+ Nueva Ronda</Button>
      </div>

      {activeRounds.length === 0 && completedRounds.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay rondas todavía</p>
            <Button onClick={handleOpenDialog}>Crear primera ronda</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {activeRounds.map((round) => {
            const visits = getVisitsByRound(round.id);
            const completedVisits = visits.filter((v) => v.status === 'completed').length;
            return (
              <SwipeableCard
                key={round.id}
                onSwipe={() => handleDeleteClick(round.id)}
                onClick={() => navigate(`/rounds/${round.id}`)}
              >
                <CardContent className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-emerald-700">
                      {round.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {round.date} · {round.targetProductIds.length} productos · {completedVisits}/{visits.length} visitas
                    </p>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleStatus(round.id, round.status)}
                    >
                      Completar
                    </Button>
                  </div>
                </CardContent>
              </SwipeableCard>
            );
          })}

          {completedRounds.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Rondas Completadas</h3>
              {completedRounds.map((round) => (
                <SwipeableCard
                  key={round.id}
                  onSwipe={() => handleDeleteClick(round.id)}
                  onClick={() => navigate(`/rounds/${round.id}`)}
                >
                  <CardContent className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-lg font-medium text-gray-700">
                        {round.name}
                      </span>
                      <p className="text-sm text-gray-500">
                        {round.date} · {round.targetProductIds.length} productos
                      </p>
                    </div>
                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                        Completada
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(round.id, round.status)}
                      >
                        Reabrir
                      </Button>
                    </div>
                  </CardContent>
                </SwipeableCard>
              ))}
            </>
          )}
        </div>
      )}

      <Dialog open={showNewRound} onClose={() => setShowNewRound(false)} title="Nueva Ronda de Compra">
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <Input
            ref={nameInputRef}
            label="Nombre de la ronda"
            value={roundName}
            onChange={(e) => setRoundName(e.target.value)}
            placeholder="ej: Reposición Golosinas"
          />
          <Input
            label="Fecha"
            type="date"
            value={roundDate}
            onChange={(e) => setRoundDate(e.target.value)}
          />
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda de destino
            </label>
            <div className="flex gap-2 mb-3">
              {(['Bs', 'USD', 'EUR'] as BaseCurrency[]).map((curr) => (
                <Button
                  key={curr}
                  variant={roundBaseCurrency === curr ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setRoundBaseCurrency(curr)}
                >
                  {curr}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasas de cambio
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">BCV</label>
                <Input
                  type="number"
                  step="0.01"
                  value={roundRates.bcv || ''}
                  onChange={(e) => setRoundRates(prev => ({ ...prev, bcv: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">USDT</label>
                <Input
                  type="number"
                  step="0.01"
                  value={roundRates.usdt || ''}
                  onChange={(e) => setRoundRates(prev => ({ ...prev, usdt: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">EUR</label>
                <Input
                  type="number"
                  step="0.01"
                  value={roundRates.eur || ''}
                  onChange={(e) => setRoundRates(prev => ({ ...prev, eur: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productos objetivo
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedProducts.map((id) => {
                const product = products.find((p) => p.id === id);
                return product ? (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm"
                  >
                    {product.name}
                    <button
                      onClick={() => toggleProduct(id)}
                      className="hover:text-emerald-900"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            
            {showNewProduct ? (
              <div className="flex gap-2 mb-2">
                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Nombre del producto"
                  autoFocus
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') handleAddNewProduct();
                    if (e.key === 'Escape') setShowNewProduct(false);
                  }}
                />
                <Button size="sm" onClick={handleAddNewProduct}>Agregar</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowNewProduct(false)}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowProductSelect(!showProductSelect)}
                >
                  {showProductSelect ? 'Cerrar' : 'Agregar existentes'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewProduct(true)}
                >
                  + Nuevo producto
                </Button>
              </div>
            )}
            
            {showProductSelect && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-auto">
                {products.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">No hay productos disponibles</div>
                ) : (
                  products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                      />
                      {product.name}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowNewRound(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRound}
              disabled={!roundName.trim() || selectedProducts.length === 0}
            >
              Crear Ronda
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, roundId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Ronda"
        message="¿Estás seguro de que deseas eliminar esta ronda? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
      />
    </div>
  );
};
