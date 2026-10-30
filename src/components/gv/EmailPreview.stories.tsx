import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {EmailPreview} from './EmailPreview';

/** The platform's logo mark: invented, drawn inline (as Phone preview's "Logo header"). */
const MARK = (
  <svg viewBox="0 0 64 32" width={64} height={32} fill="currentColor" aria-hidden="true">
    <path d="M0 32 18 8l10 12 8-10 14 22H0Z" />
  </svg>
);

const meta: Meta<typeof EmailPreview> = {
  title: 'Components/Data display/Email preview',
  component: EmailPreview,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  args: {
    subject: 'New comment on your input',
    to: 'Input authors',
    from: 'Larkvale City Council',
    replyTo: 'participation@larkvale.example',
    logo: MARK,
    logoLabel: 'Larkvale',
    title: 'Someone commented on your input',
    buttonText: 'View the comment',
    footerNote: 'You get this email because you take part on the Larkvale participation platform.',
    children: (
      <>
        <p>Resident B replied to your input “Shade on Elm Street”:</p>
        <p>“Two trees by the tram stop would make all the difference in July.”</p>
      </>
    )
  }
};
export default meta;
type Story = StoryObj<typeof EmailPreview>;

/** The envelope, then the email at desktop width: logo, title, body, button, footer. */
export const Default: Story = {};

/** At a phone's width: the frame narrows to Phone preview's 343px and rounds. */
export const Phone: Story = {args: {defaultDevice: 'phone'}};

/** Only a subject: no To, From or Reply-to lines, no logo (a grey placeholder), no title, no button. */
export const Minimal: Story = {
  args: {to: undefined, from: undefined, replyTo: undefined, logo: undefined, logoLabel: undefined, title: undefined,
    buttonText: undefined, footerNote: undefined, children: <p>Your account is ready.</p>}
};

/** No switch: the page fixes the width (a narrow column). */
export const WithoutSwitch: Story = {name: 'Without switch', args: {showDeviceSwitch: false}};

/** The footer's links off (`footer={null}`): only the note stays. */
export const WithoutFooterLinks: Story = {name: 'Without footer links', args: {footer: null}};

/** The switch by keyboard: Tab onto Desktop, an arrow to Phone, Space chooses it; the frame narrows. */
export const Keyboard: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', {name: 'Desktop'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', {name: 'Phone'})).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('radio', {name: 'Phone'})).toBeChecked();
  }
};

/** In Arabic, right to left: the envelope's names, the text and the button start at the right. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  args: {
    subject: 'تعليق جديد على مساهمتك', to: 'كتّاب المساهمات', from: 'بلدية لاركفيل', replyTo: undefined,
    title: 'علّق أحدهم على مساهمتك', buttonText: 'اعرض التعليق', footerNote: undefined,
    children: <p>ردّ أحد السكان على مساهمتك «الظل في شارع إلم».</p>,
    labels: {to: 'إلى', from: 'من', subject: 'الموضوع', desktop: 'سطح المكتب', phone: 'الهاتف', device: 'عرض المعاينة',
      unsubscribe: 'إلغاء الاشتراك', terms: 'الشروط والأحكام', privacy: 'سياسة الخصوصية'}
  }
};
