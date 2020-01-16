import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useMainArea } from 'react-components';
import { LinkType, DriveLink } from '../interfaces/folder';
import useShare from '../hooks/useShare';
import useFiles from '../hooks/useFiles';
import useOnScrollEnd from '../hooks/useOnScrollEnd';
import { FOLDER_PAGE_SIZE } from '../constants';
import useFileBrowser from './FileBrowser/useFileBrowser';
import FileBrowser, { FileBrowserItem, getMetaForTransfer } from './FileBrowser/FileBrowser';
import { DriveResource } from './DriveResourceProvider';
import { useUploadProvider } from './uploads/UploadProvider';
import TransfersInfo from './TransfersInfo/TransfersInfo';
import { TransferState } from '../interfaces/transfer';
import FileSaver from '../utils/FileSaver/FileSaver';

const mapLinksToChildren = (decryptedLinks: DriveLink[]): FileBrowserItem[] =>
    decryptedLinks.map(({ LinkID, Type, Name, Modified, Size, MimeType }) => ({
        Name,
        LinkID,
        Type,
        Modified,
        Size,
        MimeType
    }));

interface Props {
    resource: DriveResource;
    openResource: (resource: DriveResource) => void;
    fileBrowserControls: ReturnType<typeof useFileBrowser>;
    contents?: FileBrowserItem[];
    setContents: React.Dispatch<React.SetStateAction<FileBrowserItem[] | undefined>>;
}

function Drive({ resource, openResource, contents, setContents, fileBrowserControls }: Props) {
    const mainAreaRef = useMainArea();
    const { getFolderContents } = useShare(resource.shareId);
    const { downloadDriveFile } = useFiles(resource.shareId);
    const { uploads } = useUploadProvider();
    const [loading, setLoading] = useState(false);

    const {
        clearSelections,
        selectedItems,
        selectItem,
        toggleSelectItem,
        toggleAllSelected,
        selectRange
    } = fileBrowserControls;

    const isDoneLoading = useRef(false);
    const loadingPage = useRef<number | null>(null);

    const loadNextIncrement = useCallback(
        async (page = 0, isReload = false) => {
            if (loadingPage.current !== null || isDoneLoading.current) {
                return;
            }

            setLoading(true);
            loadingPage.current = page;
            const decryptedLinks = await getFolderContents(resource.linkId, page, FOLDER_PAGE_SIZE, isReload);

            // If resource changed while loading contents discard the result
            if (loadingPage.current === page) {
                // eslint-disable-next-line require-atomic-updates
                loadingPage.current = null;

                // eslint-disable-next-line require-atomic-updates
                isDoneLoading.current = decryptedLinks.length !== FOLDER_PAGE_SIZE;

                setContents((prev = []) =>
                    page === 0 ? mapLinksToChildren(decryptedLinks) : [...prev, ...mapLinksToChildren(decryptedLinks)]
                );
                setLoading(false);
            }
        },
        [getFolderContents, resource.linkId]
    );

    useEffect(() => {
        if (contents) {
            setContents(undefined);
        }

        if (resource.type === LinkType.FOLDER) {
            clearSelections();
            loadNextIncrement();
        } else {
            throw Error('Files are not supported yet');
        }

        return () => {
            isDoneLoading.current = false;
            loadingPage.current = null;
        };
    }, [resource.type, loadNextIncrement]);

    const handleScrollEnd = useCallback(() => {
        const loadedCount = contents?.length ?? 0;
        const page = loadedCount / FOLDER_PAGE_SIZE;

        loadNextIncrement(page);
    }, [loadNextIncrement, contents]);

    useOnScrollEnd(handleScrollEnd, mainAreaRef);

    const uploadedCount = uploads.filter(
        ({ state, meta }) =>
            state === TransferState.Done && meta.linkId === resource.linkId && meta.shareId === resource.shareId
    ).length;

    useEffect(() => {
        // Reload all folder contents after upload
        if (uploadedCount) {
            isDoneLoading.current = false;
            loadingPage.current = null;

            loadNextIncrement(0, true);
        }
    }, [uploadedCount]);

    const handleDoubleClick = async (item: FileBrowserItem) => {
        document.getSelection()?.removeAllRanges();
        if (item.Type === LinkType.FOLDER) {
            openResource({ shareId: resource.shareId, linkId: item.LinkID, type: item.Type });
        } else if (item.Type === LinkType.FILE) {
            const meta = getMetaForTransfer(item);
            const fileStream = await downloadDriveFile(item.LinkID, meta);
            FileSaver.saveViaDownload(fileStream, meta);
        }
    };

    return (
        <>
            <FileBrowser
                loading={loading}
                contents={contents}
                selectedItems={selectedItems}
                onItemClick={selectItem}
                onToggleItemSelected={toggleSelectItem}
                onItemDoubleClick={handleDoubleClick}
                onEmptyAreaClick={clearSelections}
                onToggleAllSelected={toggleAllSelected}
                onShiftClick={selectRange}
            />
            <TransfersInfo />
        </>
    );
}

export default Drive;
