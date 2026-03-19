import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Button, Card, CardContent, Dialog, Combobox, Tabs, Input, Select, ConfirmDialog, SwipeableCard } from '../components';
import type { Currency, RatesConfig, BaseCurrency } from '../types';

export const RoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { rounds, establishments, visits, products, addVisit, updateVisitProduct, completeVisit, reopenVisit, deleteVisit, getBestPriceForProduct, isEstablishmentVisited, addEstablishment, getProductById, convertPrice, updateRound, addProductToRound, removeProductFromRound, restoreProductToRound, addProduct } = useStore();
  const [activeTab, setActiveTab] = useState('visits');
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; visitId: string | null }>({ show: false, visitId: null });
  const [showRatesEdit, setShowRatesEdit] = useState(false);
  const [editRates, setEditRates] = useState<RatesConfig>({ bcv: 0, usdt: 0, eur: 0 });
  const [editBaseCurrency, setEditBaseCurrency] = useState<BaseCurrency>('Bs');
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [showRemovedProducts, setShowRemovedProducts] = useState(false);

  const firstPriceInputRef = useRef<HTMLInputElement>(null);

  const round = rounds.find((r) => r.id === id);
  const roundVisits = visits.filter((v) => v.roundId === id);

  useEffect(() => {
    if (editingVisitId && firstPriceInputRef.current) {
      firstPriceInputRef.current.focus();
    }
  }, [editingVisitId]);

  if (!round) {
    return <div>Ronda no encontrada</div>;
  }

  const handleAddVisit = () => {
    if (selectedEstablishment && !isEstablishmentVisited(round.id, selectedEstablishment)) {
      const newVisitId = addVisit(round.id, selectedEstablishment);
      setShowAddVisit(false);
      setSelectedEstablishment('');
      setEditingVisitId(newVisitId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedEstablishment && !isEstablishmentVisited(round.id, selectedEstablishment)) {
      handleAddVisit();
    }
  };

  const handlePriceChange = (visitId: string, productId: string, price: number, currency: Currency) => {
    updateVisitProduct(visitId, productId, price, currency);
  };

  const handleToggleVisitStatus = (visitId: string, currentStatus: 'pending' | 'completed') => {
    if (currentStatus === 'completed') {
      reopenVisit(visitId);
      setEditingVisitId(visitId);
    } else {
      completeVisit(visitId);
      setEditingVisitId(null);
    }
  };

  const handleDeleteClick = (visitId: string) => {
    setDeleteConfirm({ show: true, visitId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.visitId) {
      deleteVisit(deleteConfirm.visitId);
      if (editingVisitId === deleteConfirm.visitId) {
        setEditingVisitId(null);
      }
    }
    setDeleteConfirm({ show: false, visitId: null });
  };

  const handleCreateEstablishment = (name: string) => {
    addEstablishment(name);
  };

  const tabs = [
    { id: 'visits', label: `Visitas (${roundVisits.length})` },
    { id: 'resumen', label: 'Resumen' },
  ];

  const isRoundCompleted = round.status === 'completed';
  const isRoundReadOnly = isRoundCompleted;
  const roundProducts = round.targetProductIds
    .map((productId) => getProductById(productId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
  
  const removedProducts = (round.removedTargetProductIds || [])
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);
  
  const availableProductsToAdd = products.filter(
    (p) => !round.targetProductIds.includes(p.id) && !(round.removedTargetProductIds || []).includes(p.id)
  );

  const handleEditPrices = (visitId: string, currentStatus: 'pending' | 'completed') => {
    if (currentStatus === 'completed') {
      reopenVisit(visitId);
      setEditingVisitId(visitId);
    } else {
      setEditingVisitId(editingVisitId === visitId ? null : visitId);
    }
  };

  const handleOpenAddVisit = () => {
    setShowAddVisit(true);
  };

  const openRatesEdit = () => {
    setEditRates({ ...round.rates });
    setEditBaseCurrency(round.baseCurrency);
    setShowRatesEdit(true);
  };

  const saveRates = () => {
    updateRound(round.id, { rates: { ...editRates }, baseCurrency: editBaseCurrency });
    setShowRatesEdit(false);
  };

  const handleRemoveProduct = (productId: string) => {
    removeProductFromRound(round.id, productId);
  };

  const handleRestoreProduct = (productId: string) => {
    restoreProductToRound(round.id, productId);
  };

  const handleAddExistingProduct = (productId: string) => {
    addProductToRound(round.id, productId);
  };

  const handleCreateNewProduct = () => {
    if (newProductName.trim()) {
      addProduct(newProductName.trim(), []);
      const state = useStore.getState();
      const newProduct = state.products.find((p) => p.name === newProductName.trim());
      if (newProduct) {
        addProductToRound(round.id, newProduct.id);
      }
      setNewProductName('');
      setShowNewProduct(false);
      setShowProductSelect(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">← Volver</Link>
        <div className="flex items-center gap-3 mt-2">
          <h2 className="text-2xl font-bold text-gray-900">{round.name}</h2>
          {isRoundCompleted && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">
              Completada
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-gray-500">{round.date}</p>
          <button 
            onClick={openRatesEdit}
            className="text-sm text-emerald-600 hover:text-emerald-700"
            disabled={isRoundReadOnly}
          >
            {round.baseCurrency} · {round.rates.bcv > 0 ? `BCV: ${round.rates.bcv}` : 'Sin tasas'}
          </button>
        </div>

        {!isRoundReadOnly && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Productos Objetivo ({roundProducts.length})</h3>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (showProductSelect) {
                      setShowProductSelect(false);
                    } else if (showNewProduct) {
                      setShowNewProduct(false);
                    } else if (availableProductsToAdd.length > 0) {
                      setShowProductSelect(true);
                    } else {
                      setShowNewProduct(true);
                    }
                  }}
                >
                  {showProductSelect || showNewProduct ? 'Cerrar' : 'Agregar'}
                </Button>
                {!showNewProduct && availableProductsToAdd.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewProduct(true)}
                  >
                    + Nuevo
                  </Button>
                )}
              </div>
            </div>

            {showProductSelect && availableProductsToAdd.length > 0 && (
              <div className="mb-3 p-2 bg-white rounded border max-h-40 overflow-y-auto">
                {availableProductsToAdd.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      handleAddExistingProduct(product.id);
                      setShowProductSelect(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-emerald-50 rounded flex items-center justify-between"
                  >
                    <span className="truncate">{product.name}</span>
                    {product.tags.length > 0 && (
                      <span className="text-xs text-gray-400 ml-2">{product.tags.join(', ')}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showNewProduct && (
              <div className="flex gap-2 mb-3">
                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Nombre del producto"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNewProduct();
                    if (e.key === 'Escape') {
                      setShowNewProduct(false);
                      setNewProductName('');
                    }
                  }}
                />
                <Button size="sm" onClick={handleCreateNewProduct}>Agregar</Button>
                <Button size="sm" variant="secondary" onClick={() => {
                  setShowNewProduct(false);
                  setNewProductName('');
                }}>Cancelar</Button>
              </div>
            )}

            {roundProducts.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {roundProducts.map((product) => (
                  <span
                    key={product.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm"
                  >
                    {product.name}
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="hover:text-emerald-900 font-medium"
                      title="Eliminar de la ronda"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin productos agregados</p>
            )}

            {removedProducts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowRemovedProducts(!showRemovedProducts)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span>{showRemovedProducts ? '▼' : '▶'}</span>
                  Eliminados ({removedProducts.length})
                </button>
                {showRemovedProducts && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {removedProducts.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 rounded text-sm line-through"
                      >
                        {product.name}
                        <button
                          onClick={() => handleRestoreProduct(product.id)}
                          className="hover:text-emerald-600 font-medium"
                          title="Restaurar"
                        >
                          ↩
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isRoundReadOnly && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-gray-600 text-sm">
          Esta ronda está completada. Solo puedes visualizar los datos.
        </div>
      )}

      

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'visits' && (
        <div className="space-y-4">
          {roundVisits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay visitas registradas</p>
                {!isRoundCompleted && <Button onClick={handleOpenAddVisit}>Registrar primera visita</Button>}
              </CardContent>
            </Card>
          ) : (
            roundVisits.map((visit, index) => {
              const establishment = establishments.find((e) => e.id === visit.establishmentId);
              const isEditing = editingVisitId === visit.id;

              const cardContent = (
                <div className={!isRoundReadOnly ? 'cursor-pointer' : ''}>
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{establishment?.name || 'Desconocido'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(visit.date).toLocaleString()}
                          {visit.status === 'completed' && ' · Completada'}
                          {visit.status === 'pending' && ' · Pendiente'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-2">
                        <Button 
                          size="sm" 
                          className="text-xs px-2 py-1"
                          onClick={() => handleEditPrices(visit.id, visit.status)}
                          disabled={isRoundReadOnly}
                        >
                          {isEditing ? 'Cerrar' : 'Editar'}
                        </Button>
                        {!isRoundReadOnly && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="text-xs px-2 py-1"
                            onClick={() => handleToggleVisitStatus(visit.id, visit.status)}
                          >
                            {visit.status === 'completed' ? 'Reabrir' : 'Completar'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {(isEditing || visit.status === 'completed') && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Productos</h4>
                        <div className="space-y-2">
                          {roundProducts.map((product, productIndex) => {
                            const visitProduct = visit.products.find((p) => p.productId === product.id);
                            const price = visitProduct?.price ?? '';
                            const currency = visitProduct?.currency ?? 'Bs';
                            return (
                              <div key={product.id} className="flex items-center gap-2">
                                <span className="flex-1 text-sm text-gray-700 truncate">{product.name}</span>
                                {isEditing ? (
                                  <div className="flex gap-1">
                                    <Input
                                      ref={index === 0 && productIndex === 0 ? firstPriceInputRef : null}
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="w-20 text-sm"
                                      value={price}
                                      onChange={(e) => handlePriceChange(visit.id, product.id, parseFloat(e.target.value) || 0, currency as Currency)}
                                    />
                                    <Select
                                      className="w-14 text-sm"
                                      value={currency}
                                      onChange={(e) => handlePriceChange(visit.id, product.id, typeof price === 'number' ? price : 0, e.target.value as Currency)}
                                      options={[
                                        { value: 'Bs', label: 'Bs' },
                                        { value: 'USD', label: '$' },
                                        { value: 'EUR', label: '€' },
                                      ]}
                                    />
                                  </div>
                                ) : (
                                  <span className="font-medium text-gray-900 text-sm whitespace-nowrap">
                                    {price ? `${price} ${currency}` : '-'}
                                    {price && currency !== round.baseCurrency && round.baseCurrency && (
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({convertPrice(price, currency, round.rates, round.baseCurrency).toFixed(2)} {round.baseCurrency})
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );

              if (isRoundReadOnly) {
                return <div key={visit.id}>{cardContent}</div>;
              }

              return (
                <SwipeableCard
                  key={visit.id}
                  onSwipe={() => handleDeleteClick(visit.id)}
                >
                  {cardContent}
                </SwipeableCard>
              );
            })
          )}
          {!isRoundCompleted && (
            <div className="flex justify-center mb-4">
              <Button variant="secondary" size="sm" onClick={handleOpenAddVisit}>
                + Nueva Visita
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'resumen' && (() => {
        let totalOptimo = 0;
        let totalPromedio = 0;
        let productosConPrecio = 0;

        roundProducts.forEach((product) => {
          const productPrices = roundVisits
            .filter(v => v.status === 'completed')
            .map(v => {
              const vp = v.products.find(p => p.productId === product.id);
              if (!vp) return null;
              return convertPrice(vp.price, vp.currency, round.rates, round.baseCurrency);
            })
            .filter((p): p is number => p !== null);

          if (productPrices.length > 0) {
            productosConPrecio++;
            const min = Math.min(...productPrices);
            const avg = productPrices.reduce((a, b) => a + b, 0) / productPrices.length;
            totalOptimo += min;
            totalPromedio += avg;
          }
        });

        const ahorro = totalPromedio - totalOptimo;

        return (
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">Precios más bajos por producto</h3>
            {roundProducts.length === 0 ? (
              <p className="text-gray-500">No hay productos objetivo</p>
            ) : (
              <div className="space-y-3">
                {roundProducts.map((product) => {
                  const best = getBestPriceForProduct(round.id, product.id);
                  return (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-gray-700">{product.name}</span>
                      {best ? (
                        <div className="text-right">
                          <span className="font-semibold text-emerald-600">
                            {convertPrice(best.price, best.currency, round.rates, round.baseCurrency).toFixed(2)} {round.baseCurrency}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">en {best.establishmentName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin datos</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {productosConPrecio > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Resumen de Ahorro</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total precio óptimo:</span>
                    <span className="font-medium">{totalOptimo.toFixed(2)} {round.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total promedio:</span>
                    <span className="font-medium">{totalPromedio.toFixed(2)} {round.baseCurrency}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-900 font-medium">Ahorro potencial:</span>
                    <span className="font-bold text-emerald-600">{ahorro.toFixed(2)} {round.baseCurrency}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        );
      })()}

      <Dialog open={showAddVisit} onClose={() => setShowAddVisit(false)} title="Nueva Visita">
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <Combobox
            label="Establecimiento"
            value={selectedEstablishment}
            onChange={setSelectedEstablishment}
            options={establishments.map((e) => ({ id: e.id, name: e.name }))}
            placeholder="Buscar o crear tienda..."
            onCreateNew={handleCreateEstablishment}
          />
          {selectedEstablishment && isEstablishmentVisited(round.id, selectedEstablishment) && (
            <p className="text-red-500 text-sm">Esta tienda ya fue visitada en esta ronda</p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAddVisit(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddVisit}
              disabled={!selectedEstablishment || isEstablishmentVisited(round.id, selectedEstablishment)}
            >
              Crear Visita
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, visitId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Visita"
        message="¿Estás seguro de que deseas eliminar esta visita? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
      />

      <Dialog open={showRatesEdit} onClose={() => setShowRatesEdit(false)} title="Configuración de Tasas">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda de destino
            </label>
            <div className="flex gap-2">
              {(['Bs', 'USD', 'EUR'] as BaseCurrency[]).map((curr) => (
                <Button
                  key={curr}
                  variant={editBaseCurrency === curr ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setEditBaseCurrency(curr)}
                >
                  {curr}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasas de cambio
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">BCV</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editRates.bcv || ''}
                  onChange={(e) => setEditRates(prev => ({ ...prev, bcv: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">USDT</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editRates.usdt || ''}
                  onChange={(e) => setEditRates(prev => ({ ...prev, usdt: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">EUR</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editRates.eur || ''}
                  onChange={(e) => setEditRates(prev => ({ ...prev, eur: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowRatesEdit(false)}>
              Cancelar
            </Button>
            <Button onClick={saveRates}>
              Guardar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
