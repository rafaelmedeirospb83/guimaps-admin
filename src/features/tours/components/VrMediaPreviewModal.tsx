import { X } from 'lucide-react'
import type { VrMediaType, TourVrMediaItem } from '../api/vrMedia'

interface Props {
  isOpen: boolean
  onClose: () => void
  mediaItem: TourVrMediaItem | null
  mediaType: VrMediaType
  isLoading?: boolean
}

/**
 * Modal para preview de mídia VR 360
 * Exibe foto ou vídeo com URL assinada temporária
 */
export function VrMediaPreviewModal({ isOpen, onClose, mediaItem, mediaType, isLoading = false }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Preview {mediaType === 'PHOTO_360' ? 'Foto 360' : 'Vídeo 360'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-gray-900">
          {isLoading ? (
            <div className="text-white">Carregando...</div>
          ) : mediaItem ? (
            <div className="w-full">
              {mediaType === 'PHOTO_360' ? (
                <img
                  src={mediaItem.signed_url}
                  alt="Foto VR 360"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem VR:', e)
                    ;(e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ccc" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EErro ao carregar imagem%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <video
                  src={mediaItem.signed_url}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                  poster={mediaItem.poster_url || undefined}
                  onError={(e) => {
                    console.error('Erro ao carregar vídeo VR:', e)
                  }}
                >
                  Seu navegador não suporta vídeo HTML5.
                </video>
              )}
            </div>
          ) : (
            <div className="text-white text-center">
              <p className="text-lg mb-2">Nenhuma mídia disponível</p>
              <p className="text-sm text-gray-400">A URL assinada pode ter expirado.</p>
            </div>
          )}
        </div>

        {mediaItem && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Tipo:</span> {mediaType === 'PHOTO_360' ? 'Foto 360°' : 'Vídeo 360°'}
              </p>
              {mediaItem.is_primary && (
                <p className="mt-1">
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                    Principal
                  </span>
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                URL assinada temporária (expira em {mediaItem.expires_in}s)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

