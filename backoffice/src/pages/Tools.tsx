import {ArrowRight, Lock} from 'lucide-react';
import {useNavigate} from 'react-router';
import {Button} from '../../../src/components/Button';
import {Card} from '../../../src/components/gv/Card';
import {Badge} from '../../../src/components/gv/Badge';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {HelpPopover} from '../../../src/components/gv/HelpPopover';
import {Panel} from '../../../src/components/gv/Panel';
import {TOOLS, type Tool} from '../data-tools';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

// One Card per tool in a Panel gallery, as the Inspiration hub's: art on top, then tags, the description and the action.
function ToolCard({tool}: {tool: Tool}) {
  const Icon = tool.icon;
  const navigate = useNavigate();
  return (
    <Card
      layout="stacked"
      title={tool.title}
      actions={<HelpPopover title={tool.title}><p>{tool.help}</p></HelpPopover>}>
      <div className="bo-tools-body">
        <Gap name="Tool illustration" inline>
          <span className="bo-tools-art"><Icon aria-hidden size={40} strokeWidth={1.5} /></span>
        </Gap>
        <div className="bo-tools-tags">
          <Badge>{tool.category}</Badge>
          {tool.status && <StatusBadge state={tool.status.state}>{tool.status.label}</StatusBadge>}
          {tool.locked && <Badge icon={<Lock aria-hidden size={14} />}>Not in your plan</Badge>}
        </div>
        <p className="bo-tools-text">{tool.description}</p>
        <div className="bo-tools-actions">
          <Button variant={tool.locked ? 'secondary' : 'primary'} size={32} isDisabled={tool.locked}
            onPress={() => tool.route && navigate(`/tools/${tool.route}`)}>
            {tool.action}{!tool.locked && <ArrowRight aria-hidden size={16} />}
          </Button>
          {tool.learnMore && <HelpPopover title={tool.title} triggerText="Learn more"><p>{tool.learnMore}</p></HelpPopover>}
        </div>
      </div>
    </Card>
  );
}

export function Tools() {
  return (
    <Page title="Tools" description="Integrations, embeds and add-ons that work alongside the platform.">
      <div className="bo-tools-stack">
        <Panel title="All tools" count={TOOLS.length} description="Open a tool to set it up. The help icon says what each one does.">
          <ul className="bo-tools-grid" aria-label="Tools">
            {TOOLS.map(t => <li key={t.id} className="bo-tools-item"><ToolCard tool={t} /></li>)}
          </ul>
        </Panel>
        <GapLegend names={['tool illustrations']} />
      </div>
    </Page>
  );
}
