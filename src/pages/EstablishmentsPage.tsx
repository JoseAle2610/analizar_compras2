import { useState, useRef } from 'react';
import { useStore } from '../store';
import { Button, Card, CardContent, Dialog, Input, ConfirmDialog, SwipeableCard } from '../components';

export const EstablishmentsPage: React.FC = () => {
  const { establishments, addEstablishment, updateEstablishment, deleteEstablishment, getUnusedEstablishments, isEstablishmentInUse } = useStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [showUnused, setShowUnused] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; establishmentId: string | null }>({ show: false, establishmentId: null });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const unusedEstablishments = getUnusedEstablishments();

  const handleOpen = (establishment?: { id: string; name: string }) => {
    if (establishment) {
      setEditingId(establishment.id);
      setName(establishment.name);
    } else {
      setEditingId(null);
      setName('');
    }
    setShowDialog(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    if (name.trim()) {
      if (editingId) {
        updateEstablishment(editingId, name.trim());
      } else {
        addEstablishment(name.trim());
      }
      setShowDialog(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  const handleDeleteClick = (establishmentId: string) => {
    setDeleteConfirm({ show: true, establishmentId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.establishmentId) {
      deleteEstablishment(deleteConfirm.establishmentId);
    }
    setDeleteConfirm({ show: false, establishmentId: null });
  };

  const displayEstablishments = showUnused ? unusedEstablishments : establishments;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tiendas</h2>
          <p className="text-gray-500 text-sm">{establishments.length} tiendas en total</p>
        </div>
        <Button onClick={() => handleOpen()}>+ Nueva Tienda</Button>
      </div>

      {unusedEstablishments.length > 0 && (
        <div className="mb-4">
          <Button variant="secondary" size="sm" onClick={() => setShowUnused(!showUnused)}>
            {showUnused ? `Mostrar todos (${establishments.length})` : `Ver sin usar (${unusedEstablishments.length})`}
          </Button>
        </div>
      )}

      {displayEstablishments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No hay tiendas</p>
            <Button className="mt-4" onClick={() => handleOpen()}>Crear tienda</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {displayEstablishments.map((establishment) => (
            <SwipeableCard
              key={establishment.id}
              onSwipe={() => handleDeleteClick(establishment.id)}
              onClick={() => handleOpen(establishment)}
            >
              <div className="py-3 px-6">
                <span className="font-medium text-gray-900">{establishment.name}</span>
              </div>
            </SwipeableCard>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingId ? 'Editar Tienda' : 'Nueva Tienda'}>
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <Input
            ref={nameInputRef}
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Mayorista El Sol"
          />
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
        onClose={() => setDeleteConfirm({ show: false, establishmentId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Tienda"
        message={deleteConfirm.establishmentId && isEstablishmentInUse(deleteConfirm.establishmentId) 
          ? "Esta tienda tiene visitas asociadas. ¿Estás seguro de que deseas eliminarla?"
          : "¿Estás seguro de que deseas eliminar esta tienda?"}
        confirmLabel="Eliminar"
      />
    </div>
  );
};
