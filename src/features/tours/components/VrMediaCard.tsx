import { Star, Trash2, Eye, Video } from 'lucide-react'
import type { TourVrMediaItem, VrMediaType } from '../api/vrMedia'

interface Props {
  mediaItem: TourVrMediaItem
  mediaType: VrMediaType
  onSetPrimary?: () => void
  onDelete?: () => void
  onPreview?: () => void
  isSettingPrimary?: boolean
  isDeleting?: boolean
}

/**
 * Card para exibir mídia VR 360 (foto ou vídeo)
 * Segue o mesmo padrão visual dos cards de fotos do tour
 */
export function VrMediaCard({
  mediaItem,
  mediaType,
  onSetPrimary,
  onDelete,
  onPreview,
  isSettingPrimary = false,
  isDeleting = false,
}: Props) {
  const isPhoto = mediaType === 'PHOTO_360'
  const thumbnailUrl = mediaItem.thumbnail_url || mediaItem.poster_url || mediaItem.signed_url

  return (
    <div className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square">
      {/* Thumbnail ou preview */}
      {isPhoto ? (
        <img
          src={thumbnailUrl}
          alt={isPhoto ? 'Foto VR 360' : 'Vídeo VR 360'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback em caso de erro
            ;(e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E360°%3C/text%3E%3C/svg%3E'
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 relative">
          {mediaItem.poster_url ? (
            <img
              src={mediaItem.poster_url}
              alt="Poster do vídeo VR 360"
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="w-16 h-16 text-gray-400" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Badge "Principal" */}
      {mediaItem.is_primary && (
        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          Principal
        </div>
      )}

      {/* Badge de tipo */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
        {isPhoto ? '360°' : 'VR'}
      </div>

      {/* Overlay com ações ao hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="Ver preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {!mediaItem.is_primary && onSetPrimary && (
          <button
            type="button"
            onClick={onSetPrimary}
            disabled={isSettingPrimary}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors disabled:opacity-50"
            title="Definir como principal"
          >
            <Star className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-white hover:bg-red-600/80 rounded transition-colors disabled:opacity-50"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

