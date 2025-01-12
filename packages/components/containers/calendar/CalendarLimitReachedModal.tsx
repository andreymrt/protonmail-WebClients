import { c } from 'ttag';

import { Button, ButtonLike } from '@proton/atoms';
import { getCalendarsLimitReachedText } from '@proton/shared/lib/calendar/calendarLimits';
import { getCalendarsSettingsPath } from '@proton/shared/lib/calendar/settingsRoutes';

import { AlertModal } from '../../components/alertModal';
import { SettingsLink } from '../../components/link';

interface Props {
    onClose?: () => void;
    open?: boolean;
    isFreeUser: boolean;
}
const CalendarLimitReachedModal = ({ open, onClose, isFreeUser }: Props) => {
    const { maxReachedText, addNewCalendarText } = getCalendarsLimitReachedText(isFreeUser);
    const submitButtonPath = isFreeUser ? '/upgrade' : getCalendarsSettingsPath();
    const submitButtonText = isFreeUser ? c('Modal action').t`Upgrade` : c('Modal action').t`Manage calendars`;

    return (
        <AlertModal
            open={open}
            title={c('Modal title').t`Cannot add more calendars`}
            buttons={[
                <ButtonLike color="norm" as={SettingsLink} path={submitButtonPath}>
                    {submitButtonText}
                </ButtonLike>,
                <Button onClick={onClose}>{c('Modal action').t`Close`}</Button>,
            ]}
            onClose={onClose}
        >
            <p>{maxReachedText}</p>
            <p>{addNewCalendarText}</p>
        </AlertModal>
    );
};

export default CalendarLimitReachedModal;
