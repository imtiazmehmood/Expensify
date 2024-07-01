import type {ReactNode} from 'react';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import * as TransactionActions from '@userActions/Transaction';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import Button from './Button';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';

type MoneyRequestHeaderProps = {
    /** The report currently being looked at */
    report: Report;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyRequestHeader({report, parentReportAction, policy, shouldUseNarrowLayout = false, onBackButtonPress}: MoneyRequestHeaderProps) {
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? -1 : -1
        }`,
    );
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const moneyRequestReport = parentReport;
    const isDraft = ReportUtils.isOpenExpenseReport(moneyRequestReport);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isDuplicate = TransactionUtils.isDuplicate(transaction?.transactionID ?? '');

    // Only the requestor can take delete the request, admins can only edit it.
    const hasAllPendingRTERViolations = TransactionUtils.allHavePendingRTERViolation([transaction?.transactionID ?? '-1']);
    const shouldShowMarkAsCashButton = isDraft && hasAllPendingRTERViolations;

    const markAsCash = useCallback(() => {
        TransactionActions.markAsCash(transaction?.transactionID ?? '-1', report.reportID);
    }, [report.reportID, transaction?.transactionID]);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);

    const getStatusIcon: (src: IconAsset) => ReactNode = (src) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    const getStatusBarProps: () => MoneyRequestHeaderStatusBarProps | undefined = () => {
        if (isOnHold) {
            return {title: translate('violations.hold'), description: isDuplicate ? translate('iou.expenseDuplicate') : translate('iou.expenseOnHold'), danger: true};
        }

        if (TransactionUtils.isExpensifyCardTransaction(transaction) && TransactionUtils.isPending(transaction)) {
            return {title: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (TransactionUtils.hasPendingRTERViolation(TransactionUtils.getTransactionViolations(transaction?.transactionID ?? '-1', transactionViolations))) {
            return {title: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (isScanning) {
            return {title: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();

    return (
        <View style={[styles.pl0]}>
            <HeaderWithBackButton
                shouldShowBorderBottom={!statusBarProps && !isOnHold}
                shouldShowReportAvatarWithDisplay
                shouldEnableDetailPageNavigation
                shouldShowPinButton={false}
                report={{
                    ...report,
                    ownerAccountID: parentReport?.ownerAccountID,
                }}
                policy={policy}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={onBackButtonPress}
            >
                {shouldShowMarkAsCashButton && !shouldUseNarrowLayout && (
                    <Button
                        success
                        medium
                        text={translate('iou.markAsCash')}
                        style={[styles.p0]}
                        onPress={markAsCash}
                    />
                )}
                {isDuplicate && !shouldUseNarrowLayout && (
                    <Button
                        success
                        medium
                        text={translate('iou.reviewDuplicates')}
                        style={[styles.p0]}
                        onPress={() => {
                            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(report.reportID));
                        }}
                    />
                )}
            </HeaderWithBackButton>
            {shouldShowMarkAsCashButton && shouldUseNarrowLayout && (
                <View style={[styles.ph5, styles.pb3]}>
                    <Button
                        medium
                        success
                        text={translate('iou.markAsCash')}
                        style={[styles.w100, styles.pr0]}
                        onPress={markAsCash}
                    />
                </View>
            )}
            {isDuplicate && shouldUseNarrowLayout && (
                <View style={[styles.ph5, styles.pb3]}>
                    <Button
                        success
                        medium
                        text={translate('iou.reviewDuplicates')}
                        style={[styles.w100, styles.pr0]}
                        onPress={() => {
                            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(report.reportID));
                        }}
                    />
                </View>
            )}
            {statusBarProps && (
                <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                    <MoneyRequestHeaderStatusBar
                        title={statusBarProps.title}
                        description={statusBarProps.description}
                        danger={statusBarProps.danger}
                    />
                </View>
            )}
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
