// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { isAlpha } from '../../util/version';
import { getIntl } from '../selectors/user';
import { SmartCustomizingPreferredReactionsModal } from './CustomizingPreferredReactionsModal';
import { getIsCustomizingPreferredReactions } from '../selectors/preferredReactions';
import type { SmartNavTabsProps } from './LuciditvNavTabs';
import { SmartStoriesTab } from './StoriesTab';
import { SmartCallsTab } from './CallsTab';
import { useItemsActions } from '../ducks/items';
import { getNavTabsCollapsed } from '../selectors/items';
import { SmartChatsTab } from './ChatsTab';
import { getHasInitialLoadCompleted } from '../selectors/app';
import {
  getInboxEnvelopeTimestamp,
  getInboxFirstEnvelopeTimestamp,
} from '../selectors/inbox';
import { LuciditvInbox } from '../../components/LuciditvInbox';
import { SmartLuciditvNavTabs } from './LuciditvNavTabs';
import { SmartLuciditvChatsTab } from './LuciditvChatsTab';

function renderChatsTab() {
  return <SmartChatsTab />;
}

function renderCallsTab() {
  return <SmartCallsTab />;
}

function renderCustomizingPreferredReactionsModal() {
  return <SmartCustomizingPreferredReactionsModal />;
}

function renderNavTabs(_props: SmartNavTabsProps) {
  // return <SmartLuciditvNavTabs {...props} />
  return <SmartLuciditvChatsTab />;
}

function renderStoriesTab() {
  return <SmartStoriesTab />;
}

export const SmartLuciditvInbox = memo(function SmartInbox(): JSX.Element {
  const i18n = useSelector(getIntl);
  const isCustomizingPreferredReactions = useSelector(
    getIsCustomizingPreferredReactions
  );
  const envelopeTimestamp = useSelector(getInboxEnvelopeTimestamp);
  const firstEnvelopeTimestamp = useSelector(getInboxFirstEnvelopeTimestamp);
  const hasInitialLoadCompleted = useSelector(getHasInitialLoadCompleted);
  const navTabsCollapsed = useSelector(getNavTabsCollapsed);

  const { toggleNavTabsCollapse } = useItemsActions();

  return (
    <LuciditvInbox
      envelopeTimestamp={envelopeTimestamp}
      firstEnvelopeTimestamp={firstEnvelopeTimestamp}
      hasInitialLoadCompleted={hasInitialLoadCompleted}
      i18n={i18n}
      isAlpha={isAlpha(window.getVersion())}
      isCustomizingPreferredReactions={isCustomizingPreferredReactions}
      navTabsCollapsed={navTabsCollapsed}
      onToggleNavTabsCollapse={toggleNavTabsCollapse}
      renderChatsTab={renderChatsTab}
      renderCallsTab={renderCallsTab}
      renderCustomizingPreferredReactionsModal={
        renderCustomizingPreferredReactionsModal
      }
      renderNavTabs={renderNavTabs}
      renderStoriesTab={renderStoriesTab}
    />
  );
});
