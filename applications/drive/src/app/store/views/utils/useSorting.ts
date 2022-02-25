import { useEffect, useState } from 'react';

import { useMultiSortedList } from '@proton/components';
import { SortConfig } from '@proton/components/hooks/useSortedList';
import { SORT_DIRECTION } from '@proton/shared/lib/constants';

import { logError } from '../../utils';
import { LinkShareUrl, LinkType } from '../../links/interface';

type SortField =
    | 'name'
    | 'mimeType'
    | 'metaDataModifyTime'
    | 'fileModifyTime'
    | 'size'
    | 'linkCreateTime'
    | 'linkExpireTime'
    | 'numAccesses'
    | 'trashed';

interface SortParams<T extends SortField = SortField> {
    sortField: T;
    sortOrder: SORT_DIRECTION;
}

interface LinkSortFields {
    type: LinkType;
    name: string;
    mimeType: string;
    size: number;
    metaDataModifyTime: number;
    fileModifyTime: number;
    trashed: number | null;
    shareUrl?: LinkShareUrl;
}

/**
 * useSorting sorts provided list based on `sortParams`.
 */
export function useSorting<T extends SortField, Item extends LinkSortFields>(list: Item[], sortParams: SortParams<T>) {
    const { sortedList, setSorting } = useControlledSorting(list, sortParams, async () => undefined);
    useEffect(() => {
        void setSorting(sortParams);
    }, [sortParams]);
    return sortedList;
}

/**
 * useSortingWithDefault sorts provided list based on `defaultSortParams`
 * which can be changed by returned `setSorting` callback.
 */
export function useSortingWithDefault<T extends SortField, Item extends LinkSortFields>(
    list: Item[],
    defaultSortParams: SortParams<T>
) {
    const [sortParams, setSortParams] = useState(defaultSortParams);
    return useControlledSorting(list, sortParams, async (newSortParams) => setSortParams(newSortParams));
}

/**
 * useControlledSorting sorts provided list based on `sortParams`
 * which can be changed by returned `setSorting` callback. Whenever
 * the sort changes, `changeSort` callback is called.
 */
export function useControlledSorting<T extends SortField, Item extends LinkSortFields>(
    list: Item[],
    sortParams: SortParams<T>,
    changeSort: (sortParams: SortParams<T>) => Promise<void>
) {
    const { sortedList, setConfigs } = useMultiSortedList(list, sortParamsToSortConfig(sortParams));

    const setSorting = async (sortParams: SortParams<T>) => {
        setConfigs(sortParamsToSortConfig(sortParams));
        changeSort(sortParams).catch(logError);
    };

    return {
        sortedList,
        sortParams,
        setSorting,
    };
}

function sortParamsToSortConfig({ sortField, sortOrder: direction }: SortParams) {
    const configs: {
        [key in SortField]: SortConfig<LinkSortFields>[];
    } = {
        name: [{ key: 'type', direction: SORT_DIRECTION.ASC }, getNameSortConfig(direction)],
        mimeType: [{ key: 'mimeType', direction }, { key: 'type', direction }, getNameSortConfig()],
        metaDataModifyTime: [{ key: 'metaDataModifyTime', direction }, getNameSortConfig()],
        fileModifyTime: [{ key: 'fileModifyTime', direction }, getNameSortConfig()],
        size: [{ key: 'type', direction }, { key: 'size', direction }, getNameSortConfig()],
        linkCreateTime: [getShareLinkCreatedSortConfig(direction), { key: 'type', direction }, getNameSortConfig()],
        linkExpireTime: [getShareLinkExpiresSortConfig(direction), { key: 'type', direction }, getNameSortConfig()],
        numAccesses: [getShareLinkNumAccessesSortConfig(direction), { key: 'type', direction }, getNameSortConfig()],
        trashed: [{ key: 'trashed', direction }, getNameSortConfig()],
    };
    return configs[sortField];
}

function getNameSortConfig(direction = SORT_DIRECTION.ASC) {
    return {
        key: 'name' as keyof LinkSortFields,
        direction,
        compare: (a: string, b: string) => a.localeCompare(b),
    };
}

function getShareLinkCreatedSortConfig(direction = SORT_DIRECTION.ASC) {
    return {
        key: 'shareUrl' as keyof LinkSortFields,
        direction,
        compare: (a?: LinkShareUrl, b?: LinkShareUrl) => {
            return (a?.createTime || Infinity) - (b?.createTime || Infinity);
        },
    };
}

function getShareLinkExpiresSortConfig(direction = SORT_DIRECTION.ASC) {
    return {
        key: 'shareUrl' as keyof LinkSortFields,
        direction,
        compare: (a?: LinkShareUrl, b?: LinkShareUrl) => {
            return (a?.expireTime || Infinity) - (b?.expireTime || Infinity);
        },
    };
}

function getShareLinkNumAccessesSortConfig(direction = SORT_DIRECTION.ASC) {
    return {
        key: 'shareUrl' as keyof LinkSortFields,
        direction,
        compare: (a?: LinkShareUrl, b?: LinkShareUrl) => {
            return (a?.numAccesses || 0) - (b?.numAccesses || 0);
        },
    };
}