import { fireEvent, screen } from '@testing-library/dom';

import { MailImportState } from '@proton/activation/src/logic/draft/imapDraft/imapDraft.interface';
import { mockAddresses } from '@proton/activation/src/tests/data/addresses';
import { easySwitchRender } from '@proton/activation/src/tests/render';

import StepPrepare from './StepPrepareImap';

const data: MailImportState = {
    step: 'prepare-import',
    loading: false,
    domain: 'imap.proton.ch',
    email: 'testing@proton.ch',
    password: 'password',
    port: '993',
};

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn().mockReturnValue({ mailImport: data }),
}));

jest.mock('@proton/activation/src/hooks/useAvailableAddresses', () => () => ({
    availableAddresses: mockAddresses,
    loading: false,
    defaultAddress: mockAddresses[0],
}));

describe('Step prepare basic rendering testing', () => {
    it('Should correctly render the step prepare', () => {
        easySwitchRender(<StepPrepare />);

        const customizeButton = screen.getByTestId('StepPrepare:customizeButton');
        fireEvent.click(customizeButton);

        screen.getByTestId('CustomizeModal:modalCancel');
    });
});
