import {StatementRow} from './StatementRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatementRow> = {
  title: 'Components/Statement row',
  component: StatementRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-225'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof StatementRow>;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: 730}}>{children}</div>
);

export const AllVariants: Story = () => (
  <Frame>
    <StatementRow
      statement="Put drinking fountains at every park entrance"
      agreePercent={81}
      disagreePercent={7}
      passPercent={12}
      summary="81% agree"
    />
    <StatementRow
      statement="Dogs should be kept on a lead near the playgrounds"
      agreePercent={52}
      disagreePercent={38}
      passPercent={10}
      summary="52% agree"
    />
    <StatementRow
      statement="People who complain about noise should just move"
      agreePercent={17}
      disagreePercent={71}
      passPercent={12}
      summary="71% disagree"
    />
  </Frame>
);

export const Default: Story = () => (
  <Frame>
    <StatementRow
      statement="Put drinking fountains at every park entrance"
      agreePercent={81}
      disagreePercent={7}
      passPercent={12}
      summary="81% agree"
    />
  </Frame>
);
