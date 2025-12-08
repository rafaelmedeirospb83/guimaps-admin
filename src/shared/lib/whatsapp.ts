export function openWhatsApp(phone: string, message?: string) {
  const cleanPhone = phone.replace(/\D/g, '')
  const defaultMessage = encodeURIComponent('Olá! Gostaria de falar sobre minha reserva.')
  const finalMessage = message ? encodeURIComponent(message) : defaultMessage
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${finalMessage}`
  window.open(whatsappUrl, '_blank')
}

