import {ArrowRight, Lock} from 'lucide-react';
import {useNavigate} from 'react-router';
import {Badge, Button, Card, HelpPopover, Inline, Panel, Stack, StatusBadge, Text, TileGrid} from 'govocal-ds';
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
      <Stack gap="12">
        <Gap name="Tool illustration" inline className="bo-tools-art">
          <Icon aria-hidden size={40} strokeWidth={1.5} />
        </Gap>
        <Inline gap="8">
          <Badge>{tool.category}</Badge>
          {tool.status && <StatusBadge status={tool.status.state}>{tool.status.label}</StatusBadge>}
          {tool.locked && <Badge icon={<Lock aria-hidden size={14} />}>Not in your plan</Badge>}
        </Inline>
        <Text elementType="p" kind="ui">{tool.description}</Text>
        <Inline gap="16" className="bo-tools-actions">
          <Button variant={tool.locked ? 'secondary' : 'primary'} size={32} isDisabled={tool.locked}
            onPress={() => tool.route && navigate(`/tools/${tool.route}`)}>
            {tool.action}{!tool.locked && <ArrowRight aria-hidden size={16} />}
          </Button>
          {tool.learnMore && <HelpPopover title={tool.title} triggerText="Learn more"><p>{tool.learnMore}</p></HelpPopover>}
        </Inline>
      </Stack>
    </Card>
  );
}

export function Tools() {
  return (
    <Page title="Tools" description="Integrations, embeds and add-ons that work alongside the platform.">
      <Stack gap="16">
        <Panel title="All tools" count={TOOLS.length} description="Open a tool to set it up. The help icon says what each one does.">
          <TileGrid elementType="ul" layout="gallery" aria-label="Tools">
            {TOOLS.map(t => <li key={t.id} className="bo-tools-item"><ToolCard tool={t} /></li>)}
          </TileGrid>
        </Panel>
        <GapLegend names={['tool illustrations']} />
      </Stack>
    </Page>
  );
}
