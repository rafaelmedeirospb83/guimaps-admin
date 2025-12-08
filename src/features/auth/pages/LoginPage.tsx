import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { adminLogin, getMe } from '../api'
import { showToast } from '@shared/components/Toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@shared/contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      showToast('Por favor, informe seu email', 'error')
      return
    }

    if (!formData.password) {
      showToast('Por favor, informe sua senha', 'error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      showToast('Email inválido', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await adminLogin({
        email: formData.email.trim(),
        password: formData.password,
      })

      localStorage.setItem('guimaps_admin_access_token', response.access_token)
      localStorage.setItem('guimaps_admin_refresh_token', response.refresh_token)

      const userData = await getMe()

      if (userData.role !== 'admin') {
        showToast('Acesso negado. Apenas administradores podem acessar.', 'error')
        localStorage.removeItem('guimaps_admin_access_token')
        localStorage.removeItem('guimaps_admin_refresh_token')
        return
      }

      login(
        response.access_token,
        response.refresh_token,
        {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: 'admin',
        }
      )

      showToast('Login realizado com sucesso!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; detail?: string }>
      showToast(
        axiosError.response?.data?.message || axiosError.response?.data?.detail || 'Erro ao fazer login',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">GM</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GuiMaps Admin</h1>
          <p className="text-gray-600">Entre com suas credenciais de administrador</p>
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@guimaps.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 placeholder-gray-400"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={formData.showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite sua senha"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 placeholder-gray-400"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {formData.showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3.5 rounded-lg font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

