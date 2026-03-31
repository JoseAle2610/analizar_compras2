import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

/**
 * Small install button for the header.
 * Shows a download icon on supported browsers, or iOS instructions.
 */
function InstallButton() {
  const { isInstallable, isInstalled, isIOS, handleInstall } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed
  if (isInstalled) return null;

  // iOS: always show the button since beforeinstallprompt doesn't fire
  if (isIOS) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowIOSInstructions(!showIOSInstructions)}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          aria-label="Instalar app"
          title="Instalar app"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
        {showIOSInstructions && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 animate-slide-up">
            <p className="text-sm font-medium text-gray-900 mb-2">Instalá Kiosco</p>
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>Tocá el botón <strong>Compartir</strong> en Safari</li>
              <li>Seleccioná <strong>"Agregar a inicio"</strong></li>
              <li>Confirmá con <strong>"Agregar"</strong></li>
            </ol>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIOSInstructions(false)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Android/Desktop: show button only when the browser fires beforeinstallprompt
  if (!isInstallable) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
      aria-label="Instalar app"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span className="hidden sm:inline">Instalar</span>
    </button>
  );
}

/**
 * Toast-style install prompt (for auto-dismissed banners).
 * Shows when the browser fires beforeinstallprompt and we want a more visible prompt.
 */
function InstallPromptToast() {
  const { isInstallable, isInstalled, handleInstall } = useInstallPrompt();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:max-w-sm z-40 animate-slide-up">
      <div className="bg-emerald-700 text-white rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Instalá Kiosco</p>
            <p className="text-xs text-emerald-200 mt-0.5">
              Agregala a tu pantalla de inicio para acceso rápido
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button
            type="button"
            onClick={handleInstall}
            className="px-4 py-1.5 text-xs font-medium bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}

export { InstallButton, InstallPromptToast };
