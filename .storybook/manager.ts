import {addons} from 'storybook/manager-api';
import {theme} from './theme';

addons.setConfig({theme});

// Status marks (docs/NAMING.md): an entry tagged `deprecated` or `not-in-figma` says so after its name in the sidebar.
// A separate setConfig (it merges by key), so this block stands alone.
import {createElement as h} from 'react';
addons.setConfig({
  sidebar: {
    renderLabel: item => {
      const mark = item.type !== 'component' ? null : item.tags.includes('deprecated') ? 'deprecated'
        : item.tags.includes('not-in-figma') ? 'no Figma' : null;
      return mark ? h('span', null, item.name, ' ', h('small', {style: {opacity: 0.6}}, mark)) : item.name;
    }
  }
});
