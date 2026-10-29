import type {ReactNode} from 'react';
import {ImageIcon, Menu} from 'lucide-react';
import {Avatar} from '../components/gv/Avatar';
import './PhonePreview.css';

export interface PhoneFrameProps {
  /** Names the preview for assistive tech ("What residents see"). */
  'aria-label': string;
  /** The platform's header, pinned at the top of the screen. */
  header?: ReactNode;
  children: ReactNode;
}

/**
 * The front-office preview's phone (prototype `#phone`): a rounded bezel around a scrolling screen, centred on the
 * stage by the page. The screen is what a resident sees. Not in Figma yet.
 */
export function PhoneFrame({header, children, 'aria-label': label}: PhoneFrameProps) {
  return (
    <div className="gv-phone" role="group" aria-label={label}>
      <div className="gv-phone__screen">
        {header}
        <div className="gv-phone__content">{children}</div>
      </div>
    </div>
  );
}

/** The platform header inside the phone: a logo placeholder and the menu icon (the preview is inert). */
export function PhoneHeader({logo = 'Platform logo'}: {logo?: string}) {
  return (
    <div className="gv-phone-header">
      <span className="gv-phone-header__logo" role="img" aria-label={logo} />
      <Menu className="gv-phone-header__menu" aria-hidden size={18} />
    </div>
  );
}

/** A picture's place: grey, with an image icon, until a picture is set. */
export function PhoneImage({'aria-label': label = 'Header image'}: {'aria-label'?: string}) {
  return (
    <span className="gv-phone-image" role="img" aria-label={label}>
      <ImageIcon aria-hidden size={24} />
    </span>
  );
}

/** Overlapping avatars before a count ("215 participants"). */
export function AvatarStack({initials, children}: {initials: string[]; children?: ReactNode}) {
  return (
    <span className="gv-avatar-stack">
      <span className="gv-avatar-stack__faces" aria-hidden>
        {initials.map((i, n) => <Avatar key={n} initials={i} size={24} />)}
      </span>
      {children}
    </span>
  );
}
