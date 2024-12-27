// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ReactNode } from 'react';
import React, { useCallback } from 'react';
import type { ListRowRenderer } from 'react-virtualized';
import classNames from 'classnames';
import { get, pick } from 'lodash';

import { Avatar, Button, Card, Col, Flex, Typography } from 'antd';
import { missingCaseError } from '../util/missingCaseError';
import { assertDev } from '../util/assert';
import type { ParsedE164Type } from '../util/libphonenumberInstance';
import type { LocalizerType, ThemeType } from '../types/Util';
import { ScrollBehavior } from '../types/Util';
import { getNavSidebarWidthBreakpoint } from './_util';
import type { PreferredBadgeSelectorType } from '../state/selectors/badges';
import type { LookupConversationWithoutServiceIdActionsType } from '../util/lookupConversationWithoutServiceId';
import type { ShowConversationType } from '../state/ducks/conversations';

import type { PropsData as ConversationListItemPropsType } from './conversationList/ConversationListItem';
import type { ContactCheckboxDisabledReason } from './conversationList/ContactCheckbox';
import type { ContactListItemConversationType as ContactListItemPropsType } from './conversationList/ContactListItem';
import type { GroupListItemConversationType } from './conversationList/GroupListItem';
import { ConversationListItem } from './conversationList/ConversationListItem';
import { ContactListItem } from './conversationList/ContactListItem';
import { ContactCheckbox as ContactCheckboxComponent } from './conversationList/ContactCheckbox';
import { PhoneNumberCheckbox as PhoneNumberCheckboxComponent } from './conversationList/PhoneNumberCheckbox';
import { UsernameCheckbox as UsernameCheckboxComponent } from './conversationList/UsernameCheckbox';
import {
  ComposeStepButton,
  Icon as ComposeStepButtonIcon,
} from './conversationList/ComposeStepButton';
import { StartNewConversation as StartNewConversationComponent } from './conversationList/StartNewConversation';
import { SearchResultsLoadingFakeHeader as SearchResultsLoadingFakeHeaderComponent } from './conversationList/SearchResultsLoadingFakeHeader';
import { SearchResultsLoadingFakeRow as SearchResultsLoadingFakeRowComponent } from './conversationList/SearchResultsLoadingFakeRow';
import { UsernameSearchResultListItem } from './conversationList/UsernameSearchResultListItem';
import { GroupListItem } from './conversationList/GroupListItem';
import { LuciditvListView } from './LuciditvListView';
import { LuciditvContactListItem } from './conversationList/LuciditvContactListItem';
import { getInitials } from '../util/getInitials';

const { Meta } = Card;
export enum RowType {
  ArchiveButton = 'ArchiveButton',
  Blank = 'Blank',
  Contact = 'Contact',
  ContactCheckbox = 'ContactCheckbox',
  PhoneNumberCheckbox = 'PhoneNumberCheckbox',
  UsernameCheckbox = 'UsernameCheckbox',
  Conversation = 'Conversation',
  CreateNewGroup = 'CreateNewGroup',
  FindByUsername = 'FindByUsername',
  FindByPhoneNumber = 'FindByPhoneNumber',
  Header = 'Header',
  MessageSearchResult = 'MessageSearchResult',
  SearchResultsLoadingFakeHeader = 'SearchResultsLoadingFakeHeader',
  SearchResultsLoadingFakeRow = 'SearchResultsLoadingFakeRow',
  // this could later be expanded to SelectSingleConversation
  SelectSingleGroup = 'SelectSingleGroup',
  StartNewConversation = 'StartNewConversation',
  UsernameSearchResult = 'UsernameSearchResult',
}

type ArchiveButtonRowType = {
  type: RowType.ArchiveButton;
  archivedConversationsCount: number;
};

type BlankRowType = { type: RowType.Blank };

type ContactRowType = {
  type: RowType.Contact;
  contact: ContactListItemPropsType;
  isClickable?: boolean;
  hasContextMenu?: boolean;
};

type ContactCheckboxRowType = {
  type: RowType.ContactCheckbox;
  contact: ContactListItemPropsType;
  isChecked: boolean;
  disabledReason?: ContactCheckboxDisabledReason;
};

type PhoneNumberCheckboxRowType = {
  type: RowType.PhoneNumberCheckbox;
  phoneNumber: ParsedE164Type;
  isChecked: boolean;
  isFetching: boolean;
};

type UsernameCheckboxRowType = {
  type: RowType.UsernameCheckbox;
  username: string;
  isChecked: boolean;
  isFetching: boolean;
};

type ConversationRowType = {
  type: RowType.Conversation;
  conversation: ConversationListItemPropsType;
};

type CreateNewGroupRowType = {
  type: RowType.CreateNewGroup;
};

type FindByUsername = {
  type: RowType.FindByUsername;
};

type FindByPhoneNumber = {
  type: RowType.FindByPhoneNumber;
};

type MessageRowType = {
  type: RowType.MessageSearchResult;
  messageId: string;
};

type HeaderRowType = {
  type: RowType.Header;
  getHeaderText: (i18n: LocalizerType) => string;
};

// Exported for tests across multiple files
export function _testHeaderText(row: Row | void): string | null {
  if (row?.type === RowType.Header) {
    return row.getHeaderText(((key: string) => key) as LocalizerType);
  }
  return null;
}

type SearchResultsLoadingFakeHeaderType = {
  type: RowType.SearchResultsLoadingFakeHeader;
};

type SearchResultsLoadingFakeRowType = {
  type: RowType.SearchResultsLoadingFakeRow;
};

type SelectSingleGroupRowType = {
  type: RowType.SelectSingleGroup;
  group: GroupListItemConversationType;
};

type StartNewConversationRowType = {
  type: RowType.StartNewConversation;
  phoneNumber: ParsedE164Type;
  isFetching: boolean;
};

type UsernameRowType = {
  type: RowType.UsernameSearchResult;
  username: string;
  isFetchingUsername: boolean;
};

export type Row =
  | ArchiveButtonRowType
  | BlankRowType
  | ContactRowType
  | ContactCheckboxRowType
  | PhoneNumberCheckboxRowType
  | UsernameCheckboxRowType
  | ConversationRowType
  | CreateNewGroupRowType
  | FindByUsername
  | FindByPhoneNumber
  | MessageRowType
  | HeaderRowType
  | SearchResultsLoadingFakeHeaderType
  | SearchResultsLoadingFakeRowType
  | StartNewConversationRowType
  | SelectSingleGroupRowType
  | UsernameRowType;

export type PropsType = {
  dimensions?: {
    width: number;
    height: number;
  };
  rowCount: number;
  // If `getRow` is called with an invalid index, it should return `undefined`. However,
  //   this should only happen if there is a bug somewhere. For example, an inaccurate
  //   `rowCount`.
  getRow: (index: number) => undefined | Row;
  scrollBehavior?: ScrollBehavior;
  scrollToRowIndex?: number;
  shouldRecomputeRowHeights: boolean;
  scrollable?: boolean;

  getPreferredBadge: PreferredBadgeSelectorType;
  i18n: LocalizerType;
  theme: ThemeType;

  blockConversation: (conversationId: string) => void;
  onClickArchiveButton: () => void;
  onClickContactCheckbox: (
    conversationId: string,
    disabledReason: undefined | ContactCheckboxDisabledReason
  ) => void;
  onPreloadConversation: (conversationId: string, messageId?: string) => void;
  onSelectConversation: (conversationId: string, messageId?: string) => void;
  onOutgoingAudioCallInConversation: (conversationId: string) => void;
  onOutgoingVideoCallInConversation: (conversationId: string) => void;
  removeConversation: (conversationId: string) => void;
  renderMessageSearchResult?: (id: string) => JSX.Element;
  showChooseGroupMembers: () => void;
  showFindByUsername: () => void;
  showFindByPhoneNumber: () => void;
  showConversation: ShowConversationType;
} & LookupConversationWithoutServiceIdActionsType;

const NORMAL_ROW_HEIGHT = 76;
const SELECT_ROW_HEIGHT = 52;
const HEADER_ROW_HEIGHT = 40;
const cardStyle: React.CSSProperties = {
  border: 'unset',
  backgroundColor: '#fdf7e8',
};
const colStyle: React.CSSProperties = {
  padding: 0,
};
const imgStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '30vh',
  borderRadius: '5px 5px 0 0',
  objectFit: 'cover',
};
const nameStyle: React.CSSProperties = {
  fontSize: '3rem',
  fontWeight: '500',
  margin: '.5rem 0',
  textAlign: 'center',
  letterSpacing: '.5rem',
};
function PersonCard({ name, imgUrl, onClick }) {
  return (
    <Card
      hoverable
      style={cardStyle}
      styles={{ body: { padding: 0, overflow: 'hidden' } }}
      onClick={onClick}
    >
      <Col style={colStyle}>
        {imgUrl ? (
          <img alt="avatar" src={imgUrl} style={imgStyle} />
        ) : (
          <div style={imgStyle} />
        )}
      </Col>
      <Col style={colStyle}>
        <h1 style={nameStyle}>{name}</h1>
      </Col>
    </Card>
  );
}
export function LuciditvConversationList({
  dimensions,
  getPreferredBadge,
  getRow,
  i18n,
  blockConversation,
  onClickArchiveButton,
  onClickContactCheckbox,
  onPreloadConversation,
  onSelectConversation,
  onOutgoingAudioCallInConversation,
  onOutgoingVideoCallInConversation,
  removeConversation,
  renderMessageSearchResult,
  rowCount,
  scrollBehavior = ScrollBehavior.Default,
  scrollToRowIndex,
  scrollable = true,
  shouldRecomputeRowHeights,
  showChooseGroupMembers,
  showFindByUsername,
  showFindByPhoneNumber,
  lookupConversationWithoutServiceId,
  showUserNotFoundModal,
  setIsFetchingUUID,
  showConversation,
  theme,
}: PropsType): JSX.Element | null {
  const calculateRowHeight = useCallback(
    (index: number): number => {
      const row = getRow(index);
      if (!row) {
        assertDev(false, `Expected a row at index ${index}`);
        return 0;
      }
      switch (row.type) {
        case RowType.Header:
        case RowType.SearchResultsLoadingFakeHeader:
          return 0;
        case RowType.SelectSingleGroup:
        case RowType.ContactCheckbox:
        case RowType.CreateNewGroup:
          return 0;
        case RowType.FindByUsername:
        case RowType.FindByPhoneNumber:
          return 0;
        case RowType.Contact:
          if (row.contact.isMe) {
            return 0;
          }
          return 112;
        default:
          return 0;
      }
    },
    [getRow]
  );

  const renderRow: ListRowRenderer = useCallback(
    ({ key, index, style }) => {
      const row = getRow(index);
      if (!row) {
        assertDev(false, `Expected a row at index ${index}`);
        return <div key={key} style={style} />;
      }

      let result: ReactNode;
      switch (row.type) {
        case RowType.ArchiveButton:
          result = undefined;
          break;
        case RowType.Blank:
          result = undefined;
          break;
        case RowType.Contact: {
          const { isClickable = true } = row;
          if (row.contact.isMe) {
            result = undefined;
          } else {
            const initials = getInitials(row.contact.title);
            result = (
              /*  <LuciditvContactListItem
                {...row.contact}
                badge={getPreferredBadge(row.contact.badges)}
                // onClick={isClickable ? onSelectConversation : undefined}
                onClick={
                  isClickable && !row.contact.isMe
                    ? onOutgoingAudioCallInConversation
                    : undefined
                }
                i18n={i18n}
                theme={theme}
                // hasContextMenu={hasContextMenu}
                hasContextMenu={false}
                onAudioCall={
                  isClickable ? onOutgoingAudioCallInConversation : undefined
                }
                onVideoCall={
                  isClickable ? onOutgoingVideoCallInConversation : undefined
                }
                onBlock={isClickable ? blockConversation : undefined}
                onRemove={isClickable ? removeConversation : undefined}
              /> 
               <Card
                onClick={() => {
                  onOutgoingAudioCallInConversation(row.contact.id);
                }}
                cover={
                  <Avatar
                    size="large"
                    style={{ height: 480, overflowY: 'scroll' }}
                    src={row.contact.avatarUrl}
                  >
                    {initials}
                  </Avatar>
                }
                key={key}
                hoverable
                style={{ width: 480 }}
              >
                <Meta title={row.contact.title} />
              </Card>
              */
              <PersonCard
                name={row.contact.title}
                imgUrl={row.contact.avatarUrl}
                onClick={() => {
                  onOutgoingAudioCallInConversation(row.contact.id);
                }}
              />
            );
          }
          break;
        }
        case RowType.ContactCheckbox:
          result = undefined;
          break;
        case RowType.PhoneNumberCheckbox:
          result = undefined;
          break;
        case RowType.UsernameCheckbox:
          result = undefined;
          break;
        case RowType.Conversation: {
          result = undefined;
          break;
        }
        case RowType.CreateNewGroup:
          result = undefined;
          break;
        case RowType.FindByUsername:
          result = undefined;
          break;
        case RowType.FindByPhoneNumber:
          result = undefined;
          break;
        case RowType.Header: {
          const headerText = row.getHeaderText(i18n);
          result = undefined;
          break;
        }
        case RowType.MessageSearchResult:
          result = undefined;
          break;
        case RowType.SearchResultsLoadingFakeHeader:
          result = undefined;
          break;
        case RowType.SearchResultsLoadingFakeRow:
          result = undefined;
          break;
        case RowType.SelectSingleGroup:
          result = undefined;
          break;
        case RowType.StartNewConversation:
          result = undefined;
          break;
        case RowType.UsernameSearchResult:
          result = undefined;
          break;
        default:
          throw missingCaseError(row);
      }
      if (result !== undefined) {
        return (
          <span aria-rowindex={index + 1} role="row" style={style} key={key}>
            <span role="gridcell" aria-colindex={1}>
              {result}
            </span>
          </span>
        );
      }
      return undefined;
    },
    [
      blockConversation,
      getPreferredBadge,
      getRow,
      i18n,
      lookupConversationWithoutServiceId,
      onClickArchiveButton,
      onClickContactCheckbox,
      onOutgoingAudioCallInConversation,
      onOutgoingVideoCallInConversation,
      onPreloadConversation,
      onSelectConversation,
      removeConversation,
      renderMessageSearchResult,
      setIsFetchingUUID,
      showChooseGroupMembers,
      showFindByUsername,
      showFindByPhoneNumber,
      showConversation,
      showUserNotFoundModal,
      theme,
    ]
  );

  if (dimensions == null) {
    return null;
  }

  const widthBreakpoint = getNavSidebarWidthBreakpoint(dimensions.width);

  return (
    <LuciditvListView
      className={classNames(
        'module-conversation-list',
        `module-conversation-list--width-${widthBreakpoint}`
      )}
      width={dimensions.width}
      height={dimensions.height}
      rowCount={rowCount}
      getRow={getRow}
      calculateRowHeight={calculateRowHeight}
      rowRenderer={renderRow}
      scrollToIndex={scrollToRowIndex}
      shouldRecomputeRowHeights={shouldRecomputeRowHeights}
      scrollable={scrollable}
      scrollBehavior={scrollBehavior}
    />
  );
}
