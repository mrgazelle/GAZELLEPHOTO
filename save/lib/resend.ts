import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = 'Gazelle Photo <noreply@gazellephoto.com>'
export async function sendBookingConfirmation({ to, name, service, priceMin, priceMax }: { to: string; name: string; service: string; priceMin?: number; priceMax?: number }) {
  const priceText = priceMin ? `Estimativa: ${priceMin}€ – ${priceMax}€` : 'O valor será acordado após análise'
  await resend.emails.send({ from: FROM, to, subject: `Pedido recebido — ${service} | Gazelle Photo`, html: `<p>Olá ${name}, o teu pedido foi recebido. ${priceText}</p>` })
}
export async function sendPhotosAvailable({ to, eventTitle, eventUrl }: { to: string; eventTitle: string; eventUrl: string }) {
  await resend.emails.send({ from: FROM, to, subject: `📸 Fotos disponíveis — ${eventTitle}`, html: `<p>As fotos de ${eventTitle} estão prontas. <a href="${eventUrl}">Ver galeria</a></p>` })
}
export async function sendAdminNewBooking({ clientName, clientEmail, service }: { clientName: string; clientEmail: string; service: string }) {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'contato@gazellephoto.com'
  await resend.emails.send({ from: FROM, to: adminEmail, subject: `🔔 Novo pedido de ${clientName} — ${service}`, html: `<p>${clientName} (${clientEmail}) pediu ${service}.</p>` })
}
