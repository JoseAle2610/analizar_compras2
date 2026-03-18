import React, { useState, useRef, useEffect } from 'react';

interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxProps {
  value: string;
  onChange: (id: string) => void;
  options: ComboboxOption[];
  placeholder: string;
  onCreateNew: (name: string) => void;
  label?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder,
  onCreateNew,
  label,
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    if (isOpen && search && filtered.length === 0 && !showCreate) {
      setShowCreate(true);
    }
  }, [search, filtered.length, showCreate]);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearch('');
    setIsOpen(false);
    setShowCreate(false);
  };

  const handleCreate = () => {
    if (search.trim()) {
      onCreateNew(search.trim());
      setSearch('');
      setIsOpen(false);
      setShowCreate(false);
    }
  };

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : selectedOption?.name || ''}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          setShowCreate(false);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filtered.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              {opt.name}
            </button>
          ))}
          {showCreate && (
            <button
              onClick={handleCreate}
              className="w-full px-4 py-2 text-left text-emerald-600 hover:bg-emerald-50 border-t"
            >
              + Crear "{search}"
            </button>
          )}
          {filtered.length === 0 && !showCreate && (
            <div className="px-4 py-2 text-gray-500 text-sm">
              Escribe para buscar o crear
            </div>
          )}
        </div>
      )}
    </div>
  );
};
