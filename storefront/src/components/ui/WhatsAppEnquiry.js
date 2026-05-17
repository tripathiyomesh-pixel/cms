'use client';
export default function WhatsAppEnquiry({ product, className = '' }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP;
  if (!number) return null;

  const msg = encodeURIComponent(
    `Hello, I'm interested in:\n\n` +
    `*${product.name || product.gemstone_type || 'Item'}*\n` +
    (product.sku ? `SKU: ${product.sku}\n` : '') +
    (product.carat ? `Carat: ${product.carat}ct\n` : '') +
    (product.color ? `Color: ${product.color} | Clarity: ${product.clarity}\n` : '') +
    (product.primary_cert_no ? `Cert: ${product.primary_cert_lab} ${product.primary_cert_no}\n` : '') +
    (product.final_price ? `\nPrice: ${product.currency || 'AED'} ${Number(product.final_price).toLocaleString()}\n` : '') +
    `\nPlease share more details and availability.`
  );

  return (
    <a href={`https://wa.me/${number.replace(/\D/g,'')}?text=${msg}`}
      target="_blank" rel="noreferrer"
      className={`flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all hover:scale-105 active:scale-95 ${className}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.854L.057 23.215a.75.75 0 00.918.924l5.492-1.437A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.596-.504-5.088-1.383l-.364-.215-3.76.985.998-3.653-.235-.376A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Enquire on WhatsApp
    </a>
  );
}
