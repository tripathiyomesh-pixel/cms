'use client';
import PLPF1BlueNile      from './PLPF1BlueNile';
import PLPF2TopBar        from './PLPF2TopBar';
import PLPF3EditorialSidebar from './PLPF3EditorialSidebar';
import PLPF4Masonry       from './PLPF4Masonry';
import PLPF5CollectionStory from './PLPF5CollectionStory';
import PLPF6ShopTheLook   from './PLPF6ShopTheLook';
import PLPF7InfiniteScroll from './PLPF7InfiniteScroll';
import PLPF8QuickShop     from './PLPF8QuickShop';

export const PLP_VARIANTS = {
  plp1: PLPF1BlueNile,
  plp2: PLPF2TopBar,
  plp3: PLPF3EditorialSidebar,
  plp4: PLPF4Masonry,
  plp5: PLPF5CollectionStory,
  plp6: PLPF6ShopTheLook,
  plp7: PLPF7InfiniteScroll,
  plp8: PLPF8QuickShop,
};

export default function ProductListing({ plpStyle = 'plp1', ...props }) {
  const Component = PLP_VARIANTS[plpStyle] || PLPF1BlueNile;
  return <Component {...props}/>;
}