import { c } from 'ttag';

import { DecryptedLink } from '../../store';
import { FileBrowserStateProvider } from '../FileBrowser';
import ReportAbuseButton from './ReportAbuseButton';
import SharedFileBrowser from './SharedFileBrowser';
import SharedPageHeader from './SharedPageHeader';
import SharedPageLayout from './SharedPageLayout';

interface Props {
    token: string;
    link: DecryptedLink;
}

export default function SharedFile({ token, link }: Props) {
    return (
        <FileBrowserStateProvider itemIds={[link.linkId]}>
            <SharedPageLayout withSidebar reportAbuseButton={<ReportAbuseButton linkInfo={link} />}>
                <SharedPageHeader token={token} rootItem={link} items={[link]}>
                    <strong>{c('Title').t`Download shared file`}</strong>
                </SharedPageHeader>
                <SharedFileBrowser folderName={link.name} items={[link]} />
            </SharedPageLayout>
        </FileBrowserStateProvider>
    );
}
