import { useStore } from '../store';
import { Button, Card, CardContent, Input } from '../components';
import type { BaseCurrency } from '../types';

export const SettingsPage: React.FC = () => {
  const { rates, baseCurrency, updateRates, updateBaseCurrency } = useStore();

  const handleRateChange = (field: 'bcv' | 'usdt' | 'eur', value: string) => {
    const numValue = parseFloat(value) || 0;
    updateRates({ [field]: numValue });
  };

  const handleCurrencyChange = (currency: BaseCurrency) => {
    updateBaseCurrency(currency);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>

      <div className="space-y-6">
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">Moneda de destino</h3>
            <p className="text-sm text-gray-500 mb-3">
              Los precios se mostrarán convertidos a esta moneda
            </p>
            <div className="flex gap-2">
              {(['Bs', 'USD', 'EUR'] as BaseCurrency[]).map((curr) => (
                <Button
                  key={curr}
                  variant={baseCurrency === curr ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleCurrencyChange(curr)}
                >
                  {curr}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">Tasas del día</h3>
            <p className="text-sm text-gray-500 mb-4">
              Estas tasas se usarán por defecto al crear nuevas rondas
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa BCV (Bs por USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={rates.bcv || ''}
                  onChange={(e) => handleRateChange('bcv', e.target.value)}
                  placeholder="Ej: 36.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa USDT (Bs por USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={rates.usdt || ''}
                  onChange={(e) => handleRateChange('usdt', e.target.value)}
                  placeholder="Ej: 37.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa EUR (Bs por EUR)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={rates.eur || ''}
                  onChange={(e) => handleRateChange('eur', e.target.value)}
                  placeholder="Ej: 42.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
