import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-4 border border-gray-700">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {offlineReady ? (
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {offlineReady
                ? 'App lista para funcionar offline'
                : 'Nueva versión disponible'}
            </p>
            {needRefresh && (
              <p className="text-xs text-gray-400 mt-1">
                Hay contenido nuevo disponible. Recargá para actualizar.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <button
            type="button"
            onClick={close}
            className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
          {needRefresh && (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Recargar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ReloadPrompt };
