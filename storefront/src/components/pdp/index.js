'use client';
import PDPF1Cartier  from './PDPF1Cartier';
import PDPF2Tiffany  from './PDPF2Tiffany';
import PDPF3Graff    from './PDPF3Graff';
import PDPF4Magazine from './PDPF4Magazine';
import PDPF5Split    from './PDPF5Split';
import PDPF6Gallery  from './PDPF6Gallery';
import PDPF7Video    from './PDPF7Video';
import PDPF8Minimal  from './PDPF8Minimal';

export const PDP_VARIANTS = {
  pdp1: PDPF1Cartier,
  pdp2: PDPF2Tiffany,
  pdp3: PDPF3Graff,
  pdp4: PDPF4Magazine,
  pdp5: PDPF5Split,
  pdp6: PDPF6Gallery,
  pdp7: PDPF7Video,
  pdp8: PDPF8Minimal,
};

export default function ProductDetail({ pdpStyle = 'pdp1', ...props }) {
  const Component = PDP_VARIANTS[pdpStyle] || PDPF1Cartier;
  return <Component {...props}/>;
}