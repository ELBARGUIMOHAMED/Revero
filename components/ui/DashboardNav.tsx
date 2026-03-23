'use client';

import {useTranslations} from 'next-intl';

import {Link as I18nLink, usePathname as useLocalizedPathname} from '../../i18n/navigation';

const links = [
  { href: '/dashboard', key: 'overview', icon: 'overview' },
  { href: '/dashboard/invoices', key: 'invoices', icon: 'invoice' },
  { href: '/dashboard/profile', key: 'profile', icon: 'profile' },
  { href: '/dashboard/billing', key: 'billing', icon: 'billing' },
];

function NavIcon({ type }: { type: string }) {
  const className = 'h-4 w-4';
  if (type === 'overview') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h8v8H3v-8Zm10-2h8v10h-8V11Z" />
      </svg>
    );
  }
  if (type === 'invoice') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5L10 20l3-1.5 3 1.5 3-1.5L22 20V8l-8-6Zm-4 9h8v2h-8v-2Zm0 4h6v2h-6v-2Z" />
      </svg>
    );
  }
  if (type === 'profile') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2-8 4.5V21h16v-2.5c0-2.5-3.6-4.5-8-4.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
    </svg>
  );
}

export default function DashboardNav() {
  const t = useTranslations('DashboardNav');
  const pathname = useLocalizedPathname();

  return (
    <ul className="space-y-1.5">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <li key={link.href}>
            <I18nLink
              href={link.href}
              className={[
                'group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <span className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}>
                <NavIcon type={link.icon} />
              </span>
              <span>{t(link.key)}</span>
              {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" /> : null}
            </I18nLink>
          </li>
        );
      })}
    </ul>
  );
}
