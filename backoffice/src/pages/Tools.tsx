import {ArrowRight, CircleHelp, Lock} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {Card} from '../../../src/components/gv/Card';
import {Pill} from '../../../src/components/gv/Pill';
import {Status} from '../../../src/components/gv/Status';
import {IconButton} from '../../../src/components/gv/IconButton';
import {TOOLS, type Tool} from '../data-tools';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

// The prototype's card gallery: art on top, then name, tags, description and the action.
function ToolCard({tool}: {tool: Tool}) {
  const Icon = tool.icon;
  return (
    <Card
      layout="stacked"
      title={tool.title}
      actions={<IconButton aria-label={`Help: ${tool.title}`}><CircleHelp aria-hidden size={16} /></IconButton>}>
      <div className="bo-tools-body">
        <Gap name="Tool illustration" inline>
          <span className="bo-tools-art"><Icon aria-hidden size={40} strokeWidth={1.5} /></span>
        </Gap>
        <div className="bo-tools-tags">
          <Pill>{tool.category}</Pill>
          {tool.status && <Status state={tool.status.state}>{tool.status.label}</Status>}
          {tool.locked && <Pill icon={<Lock aria-hidden size={14} />}>Not in your plan</Pill>}
        </div>
        <p className="bo-tools-text">{tool.description}</p>
        <div className="bo-tools-actions">
          <Button variant={tool.locked ? 'secondary' : 'primary'} size={32} isDisabled={tool.locked}>
            {tool.action}{!tool.locked && <ArrowRight aria-hidden size={16} />}
          </Button>
          {tool.learnMore && <Link href="#/tools">Learn more</Link>}
        </div>
      </div>
    </Card>
  );
}

export function Tools() {
  return (
    <Page title="Tools" description="Integrations, embeds and add-ons that work alongside the platform.">
      <SectionHeading>All tools</SectionHeading>
      <ul className="bo-tools-grid" aria-label="Tools">
        {TOOLS.map(t => <li key={t.id} className="bo-tools-item"><ToolCard tool={t} /></li>)}
      </ul>
      <GapLegend names={['tool illustrations']} />
    </Page>
  );
}
