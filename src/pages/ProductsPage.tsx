import { useState, useRef } from 'react';
import { useStore } from '../store';
import { Button, Card, CardContent, Dialog, Input, ConfirmDialog, SwipeableCard } from '../components';

export const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, getUnusedProducts, isProductInUse, getAllTags } = useStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showUnused, setShowUnused] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; productId: string | null }>({ show: false, productId: null });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const unusedProducts = getUnusedProducts();
  const existingTags = getAllTags();

  const handleOpen = (product?: { id: string; name: string; tags: string[] }) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setSelectedTags(product.tags || []);
    } else {
      setEditingId(null);
      setName('');
      setSelectedTags([]);
    }
    setShowDialog(true);
    setShowTagInput(false);
    setNewTag('');
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    if (name.trim()) {
      if (editingId) {
        updateProduct(editingId, name.trim(), selectedTags);
      } else {
        addProduct(name.trim(), selectedTags);
      }
      setShowDialog(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSelectExistingTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleOpenTagInput = () => {
    setShowTagInput(true);
    setTimeout(() => tagInputRef.current?.focus(), 100);
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteConfirm({ show: true, productId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.productId) {
      deleteProduct(deleteConfirm.productId);
    }
    setDeleteConfirm({ show: false, productId: null });
  };

  const displayProducts = showUnused ? unusedProducts : products;
  const availableTags = existingTags.filter((tag) => !selectedTags.includes(tag));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <p className="text-gray-500 text-sm">{products.length} productos en total</p>
        </div>
        <Button onClick={() => handleOpen()}>+ Nuevo Producto</Button>
      </div>

      {unusedProducts.length > 0 && (
        <div className="mb-4">
          <Button variant="secondary" size="sm" onClick={() => setShowUnused(!showUnused)}>
            {showUnused ? `Mostrar todos (${products.length})` : `Ver sin usar (${unusedProducts.length})`}
          </Button>
        </div>
      )}

      {displayProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No hay productos</p>
            <Button className="mt-4" onClick={() => handleOpen()}>Crear producto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {displayProducts.map((product) => (
            <SwipeableCard
              key={product.id}
              onSwipe={() => handleDeleteClick(product.id)}
              onClick={() => handleOpen(product)}
            >
              <div className="py-3 px-6">
                <div>
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SwipeableCard>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingId ? 'Editar Producto' : 'Nuevo Producto'}>
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <Input
            ref={nameInputRef}
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Coca-Cola 1.5L"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (opcional)
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {showTagInput ? (
              <div className="flex gap-2">
                <Input
                  ref={tagInputRef}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nuevo tag"
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') handleAddTag();
                    if (e.key === 'Escape') setShowTagInput(false);
                  }}
                />
                <Button size="sm" onClick={handleAddTag}>Agregar</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowTagInput(false)}>Cancelar</Button>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" size="sm" onClick={handleOpenTagInput}>
                  + Nuevo tag
                </Button>
                {availableTags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {availableTags.slice(0, 5).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSelectExistingTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingId ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, productId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={deleteConfirm.productId && isProductInUse(deleteConfirm.productId) 
          ? "Este producto está siendo usado en rondas o visitas. ¿Estás seguro de que deseas eliminarlo?"
          : "¿Estás seguro de que deseas eliminar este producto?"}
        confirmLabel="Eliminar"
      />
    </div>
  );
};
