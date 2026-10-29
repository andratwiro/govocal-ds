import {useState} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';
import {Check, Copy} from 'lucide-react';
import {
  Illustration,
  illustrations,
  cycleSeconds,
  type IllustrationGroup,
  type IllustrationInfo
} from '../components/gv/Illustration';
import {IconButton} from '../components/gv/IconButton';
import {Switch} from '../components/Switch';
import './IllustrationGallery.css';

// The Foundations/Illustrations page's tiles: each drawing playing (a moving one has its own Still switch, the pause
// WCAG 2.2.2 asks for), its name to copy, the motion it is drawn for, and the widths it is meant for.

const TILE = 288;

function Tile({info}: {info: IllustrationInfo}) {
  const [still, setStill] = useState(false);
  const [copied, setCopied] = useState(false);
  const moves = info.loops > 0;
  const size = Math.min(info.sizes[0] ?? info.width, TILE);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // No clipboard (an insecure frame): the name is selectable as text.
    }
  };
  return (
    <figure className="gv-illus-tile" data-illustration={info.name}>
      <div className="gv-illus-tile__stage">
        <Illustration name={info.name} size={size} motion={moves && !still ? 'loop' : 'still'} />
      </div>
      <figcaption className="gv-illus-tile__caption">
        <div className="gv-illus-tile__name">
          <code>{info.name}</code>
          <IconButton aria-label={copied ? `Copied ${info.name}` : `Copy ${info.name}`} onPress={copy}>
            {copied ? <Check aria-hidden size={16} strokeWidth={1.75} /> : <Copy aria-hidden size={16} strokeWidth={1.75} />}
          </IconButton>
        </div>
        <dl className="gv-illus-tile__facts">
          <dt>Motion</dt>
          <dd>{moves ? `${info.motion} · ${+cycleSeconds(info).toFixed(2)} s story` : 'still'}</dd>
          <dt>Sizes</dt>
          <dd>{info.sizes.join(', ')} px</dd>
        </dl>
        {moves && (
          <Switch isSelected={still} onChange={setStill}>
            Still
          </Switch>
        )}
      </figcaption>
    </figure>
  );
}

/** The tiles of one group, or a line saying it has none yet. */
export function IllustrationTiles({group}: {group: IllustrationGroup}) {
  const list = illustrations.filter(i => i.group === group);
  return (
    <Unstyled>
      {list.length ? (
        <div className="gv-illus-grid">
          {list.map(i => (
            <Tile key={i.name} info={i} />
          ))}
        </div>
      ) : (
        <p className="gv-illus-none">None yet.</p>
      )}
    </Unstyled>
  );
}
