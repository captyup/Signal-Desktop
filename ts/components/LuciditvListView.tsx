// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import classNames from 'classnames';
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import type { Index, ListRowRenderer, List } from 'react-virtualized';
import { Masonry } from 'react-virtualized';
import { Card, Col, Flex, Row as AntRow } from 'antd';
import { ScrollBehavior } from '../types/Util';
import type { Row } from './LuciditvConversationList';
import { RowType } from './LuciditvConversationList';

const { Meta } = Card;
type Props = {
  width: number;
  height: number;
  rowCount: number;
  calculateRowHeight: (index: number) => number;
  rowRenderer: ListRowRenderer;
  scrollToIndex?: number;
  scrollable?: boolean;
  className?: string;
  shouldRecomputeRowHeights?: boolean;
  scrollBehavior?: ScrollBehavior;
  getRow: (index: number) => undefined | Row;
};

/**
 * Thin wrapper around react-virtualized List. Simplified API and provides common
 * defaults.
 */
export function LuciditvListView({
  width,
  height,
  rowCount,
  calculateRowHeight,
  rowRenderer,
  scrollToIndex,
  className,
  scrollable = true,
  shouldRecomputeRowHeights = false,
  scrollBehavior = ScrollBehavior.Default,
  getRow,
}: Props): JSX.Element {
  const listRef = useRef<null | List>(null);

  useEffect(() => {
    const list = listRef.current;
    if (shouldRecomputeRowHeights && list) {
      list.recomputeRowHeights();
    }
  });

  const rowHeight = useCallback(
    (index: Index) => calculateRowHeight(index.index),
    [calculateRowHeight]
  );

  const style: React.CSSProperties = useMemo(() => {
    return {
      // See `<Timeline>` for an explanation of this `any` cast.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overflowY: scrollable ? ('overlay' as any) : 'hidden',
      direction: 'inherit',
    };
  }, [scrollable]);

  return (
    /*     <List
      className={classNames(
        'ListView',
        `ListView--scroll-behavior-${scrollBehavior}`,
        className
      )}
      width={width}
      height={height}
      ref={listRef}
      rowCount={rowCount}
      rowHeight={rowHeight}
      rowRenderer={rowRenderer}
      scrollToIndex={scrollToIndex}
      style={style}
      tabIndex={-1}
    /> */
    <Flex wrap gap="small" style={{ overflow: 'scroll', height: '100vh' }}>
      <AntRow gutter={[16, 16]} justify="center">
        {[...Array(rowCount)]
          .map((x, i) => {
            return rowRenderer({
              key: `row-${i}`,
              index: i,
              style: {},
              columnIndex: 0,
              isScrolling: false,
              isVisible: false,
              parent: {
                invalidateCellSizeAfterRender: undefined,
                recomputeGridSize: undefined,
              },
            });
          })
          .filter(x => x !== undefined)
          .map((x, i) => {
            return (
              <Col key={`c-${i}`} xs={24} sm={12}>
                {x}
              </Col>
            );
          })}
      </AntRow>
    </Flex>
  );
  {
    /* <Flex wrap gap="small" style={{ overflow: 'scroll', height: '100vh' }}>
      {[...Array(rowCount)]
        .map((x, i) => {
          return rowRenderer({
            key: `row-${i}`,
            index: i,
            style: {},
            columnIndex: 0,
            isScrolling: false,
            isVisible: false,
            parent: {
              invalidateCellSizeAfterRender: undefined,
              recomputeGridSize: undefined,
            },
          });
        })
        .filter(x => x !== undefined)}
    </Flex> */
  }
}
