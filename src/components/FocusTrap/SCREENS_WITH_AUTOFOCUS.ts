import {CENTRAL_PANE_WORKSPACE_SCREENS} from '@libs/Navigation/AppNavigator/Navigators/FullScreenNavigator';
import SCREENS from '@src/SCREENS';

const SCREENS_WITH_AUTOFOCUS: string[] = [
    ...Object.keys(CENTRAL_PANE_WORKSPACE_SCREENS),
    SCREENS.REPORT,
    SCREENS.REPORT_DESCRIPTION_ROOT,
    SCREENS.PRIVATE_NOTES.EDIT,
    SCREENS.SETTINGS.PROFILE.STATUS,
    SCREENS.SETTINGS.PROFILE.PRONOUNS,
    SCREENS.NEW_TASK.DETAILS,
    SCREENS.MONEY_REQUEST.CREATE,
];

export default SCREENS_WITH_AUTOFOCUS;
