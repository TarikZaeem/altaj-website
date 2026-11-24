import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  MessageCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CONTACT_INFO, TRANSLATIONS } from '../data/translations';
import { PRODUCTS } from '../data/products';

export const ContactSection: React.FC = () => {
  const { lang, pushToast } = useAppStore();
  const t = TRANSLATIONS[lang];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [product, setProduct] = useState(PRODUCTS[0].name);
  const [quantity, setQuantity] = useState('500');
  const [message, setMessage] = useState('');

  const buildPayload = () => {
    return [
      lang === 'ar' ? 'طلب عرض سعر — شركة التاج المميزة' : 'Quote Request — Al Taj Al Mumayyaz',
      `${t.contact.nameLabel}: ${name || '-'}`,
      `${t.contact.phoneLabel}: ${phone || '-'}`,
      company ? `${t.contact.companyLabel}: ${company}` : '',
      `${t.contact.productLabel}: ${product}`,
      `${t.contact.quantityLabel}: ${quantity}`,
      message ? `${t.contact.messageLabel}: ${message}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleSubmitWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(buildPayload());
    pushToast(t.toast.quoteReady);
    window.open(
      `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encoded}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(
      lang === 'ar'
        ? `طلب تسعيرة: ${product}`
        : `Wholesale Inquiry: ${product}`
    );
    const body = encodeURIComponent(buildPayload());
    window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/55"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-[var(--accent-teal-deep)] mb-2">
            {t.contact.kicker}
          </p>
          <h2 className="fluid-section-title font-bold text-[var(--text-primary)]">
            {t.contact.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details & Embedded Map */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-7 space-y-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[var(--accent-teal-deep)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    {t.contact.addressLabel}
                  </p>
                  <p className="text-sm font-medium mt-0.5 leading-relaxed">
                    {t.contact.addressValue}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-start gap-3">
                  <Phone className="w-4.5 h-4.5 text-[var(--accent-teal-deep)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)]">
                      {t.contact.phonesLabel}
                    </p>
                    <div className="mt-1 space-y-1 text-sm font-semibold tabular-nums" dir="ltr">
                      {CONTACT_INFO.phones.map((ph) => (
                        <a
                          key={ph}
                          href={`tel:${ph}`}
                          className="block hover:text-[var(--accent-teal-deep)] transition-colors"
                        >
                          {ph}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4.5 h-4.5 text-[var(--accent-teal-deep)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)]">
                      {t.contact.hoursLabel}
                    </p>
                    <p className="text-sm font-semibold mt-1">{t.contact.hoursValue}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <Mail className="w-4.5 h-4.5 text-[var(--accent-teal-deep)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    {t.contact.emailLabel}
                  </p>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-sm font-semibold hover:text-[var(--accent-teal-deep)] transition-colors"
                    dir="ltr"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={CONTACT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-4 rounded-xl bg-[var(--accent-teal-deep)] text-white text-xs font-semibold inline-flex items-center gap-2 hover:opacity-95 transition-opacity"
                >
                  <Navigation className="w-4 h-4" aria-hidden="true" />
                  <span>{t.contact.openGoogleMaps}</span>
                </a>
                <a
                  href={CONTACT_INFO.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] text-[var(--text-primary)] text-xs font-semibold inline-flex items-center gap-2 hover:border-[var(--accent-teal-deep)] transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[var(--accent-clay)]" aria-hidden="true" />
                  <span>{t.contact.openWaze}</span>
                </a>
              </div>
            </div>

            {/* Embedded Map Frame */}
            <div className="rounded-[24px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] h-[240px] relative shadow-sm">
              <iframe
                title={t.contact.title}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=46.8327%2C24.5853%2C46.8527%2C24.5993&layer=mapnik&marker=${CONTACT_INFO.lat}%2C${CONTACT_INFO.lng}`}
                loading="lazy"
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Quote Request Form */}
          <form
            onSubmit={handleSubmitWhatsapp}
            className="lg:col-span-6 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 flex flex-col justify-between gap-5 shadow-[var(--shadow-soft)]"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {t.contact.formTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                  {t.contact.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                  {t.contact.phoneLabel}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  placeholder="+966 5X XXX XXXX"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                  {t.contact.companyLabel}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                  {t.contact.quantityLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                {t.contact.productLabel}
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              >
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.sizeLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                {t.contact.messageLabel}
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 min-h-[48px] px-5 rounded-2xl bg-[#168a53] hover:bg-[#137446] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5" aria-hidden="true" />
                <span>{t.contact.sendWhatsapp}</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="min-h-[48px] px-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] text-[var(--text-primary)] font-semibold text-sm flex items-center justify-center gap-2 hover:border-[var(--accent-teal-deep)] transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>{t.contact.sendEmail}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
