import {addons} from 'storybook/manager-api';
import {theme} from './theme';

addons.setConfig({theme});

// Status marks (docs/NAMING.md): after its name in the sidebar, an entry says its lifecycle stage (its `status:` tag,
// Overview/Lifecycle) and `no Figma` when tagged `not-in-figma`; `deprecated` replaces both.
// A separate setConfig (it merges by key), so this block stands alone.
import {createElement as h} from 'react';
addons.setConfig({
  sidebar: {
    renderLabel: item => {
      const stage = item.tags.find(t => t.startsWith('status:'))?.slice('status:'.length);
      const mark = item.type !== 'component' ? null : item.tags.includes('deprecated') ? 'deprecated'
        : [stage, item.tags.includes('not-in-figma') && 'no Figma'].filter(Boolean).join(' · ') || null;
      return mark ? h('span', null, item.name, ' ', h('small', {style: {opacity: 0.6}}, mark)) : item.name;
    }
  }
});
