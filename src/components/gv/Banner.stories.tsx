import type {Meta, StoryObj} from '@storybook/react-vite';
import {Banner} from './Banner';

const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-479'}
  }
};
export default meta;
type Story = StoryObj<typeof Banner>;

const long =
  'Konveio keeps the participation data for this document on its side, so only visitor numbers are available here. ' +
  'After the phase closes, visit your Konveio dashboard for a summary of the feedback and to download the raw participation data.';

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 764}}>
      <div style={{width: 444}}>
        <Banner type="info-link" linkLabel="Go to project" linkHref="#">
          Goes live when you publish the project.
        </Banner>
      </div>
      <Banner type="info">{long}</Banner>
    </div>
  )
};

/** Type=Info · link */
export const InfoLink: Story = {
  name: 'Info · link',
  args: {type: 'info-link', children: 'Goes live when you publish the project.', linkLabel: 'Go to project', linkHref: '#'},
  decorators: [Story => <div style={{width: 444}}><Story /></div>],
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-207'}}
};

/** Type=Info */
export const Info: Story = {
  args: {type: 'info', children: long},
  decorators: [Story => <div style={{width: 764}}><Story /></div>],
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-523'}}
};
