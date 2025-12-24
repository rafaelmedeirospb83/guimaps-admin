import React, { useState } from 'react'
import { resetGuidePasswordAdmin } from '../api'
import { showToast } from '@shared/components/Toast'

interface Props {
  guideId: string | null
  guideName: string | undefined
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const ResetGuidePasswordModal: React.FC<Props> = ({
  guideId,
  guideName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen || !guideId) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (newPassword.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    try {
      setIsSubmitting(true)
      await resetGuidePasswordAdmin(guideId, { new_password: newPassword })
      setNewPassword('')
      showToast('Senha redefinida com sucesso', 'success')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setErrorMsg('Erro ao redefinir senha. Tente novamente.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Redefinir senha do guia</h2>
        <p className="text-sm text-gray-600 mb-4">
          Você está redefinindo a senha de <strong>{guideName}</strong>. Após salvar, envie a nova
          senha para o guia por um canal seguro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="new-password">
              Nova senha
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Mínimo de 6 caracteres. Você pode definir algo temporário e pedir que ele altere
              depois.
            </p>
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


