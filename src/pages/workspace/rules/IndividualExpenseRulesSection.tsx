import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ThemeStyles} from '@styles/index';
import * as Link from '@userActions/Link';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type IndividualExpenseRulesSectionProps = {
    policyID: string;
};

type IndividualExpenseRulesSectionSubtitleProps = {
    policy?: Policy;
    translate: LocaleContextProps['translate'];
    styles: ThemeStyles;
};

type IndividualExpenseRulesMenuItem = {
    title: string;
    descriptionTranslationKey: TranslationPaths;
    action: () => void;
};

function IndividualExpenseRulesSectionSubtitle({policy, translate, styles}: IndividualExpenseRulesSectionSubtitleProps) {
    const policyID = policy?.id ?? '-1';

    const handleOnPressCategoriesLink = () => {
        if (policy?.areCategoriesEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    const handleOnPressTagsLink = () => {
        if (policy?.areTagsEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    return (
        <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.subtitle')}</Text>{' '}
            <TextLink
                style={styles.link}
                onPress={handleOnPressCategoriesLink}
            >
                {translate('workspace.common.categories').toLowerCase()}
            </TextLink>{' '}
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.and')}</Text>{' '}
            <TextLink
                style={styles.link}
                onPress={handleOnPressTagsLink}
            >
                {translate('workspace.common.tags').toLowerCase()}
            </TextLink>
            .
        </Text>
    );
}

function IndividualExpenseRulesSection({policyID}: IndividualExpenseRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const maxExpenseAmountNoReceiptText = useMemo(() => {
        if (policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || !policy?.maxExpenseAmountNoReceipt) {
            return '';
        }

        return CurrencyUtils.convertToDisplayString(policy?.maxExpenseAmountNoReceipt, policyCurrency);
    }, [policy?.maxExpenseAmountNoReceipt, policyCurrency]);

    const maxExpenseAmountText = useMemo(() => {
        if (policy?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE || !policy?.maxExpenseAmount) {
            return '';
        }

        return CurrencyUtils.convertToDisplayString(policy?.maxExpenseAmount, policyCurrency);
    }, [policy?.maxExpenseAmount, policyCurrency]);

    const maxExpenseAgeText = useMemo(() => {
        if (policy?.maxExpenseAge === CONST.DISABLED_MAX_EXPENSE_VALUE || !policy?.maxExpenseAge) {
            return '';
        }

        return translate('workspace.rules.individualExpenseRules.maxExpenseAgeDays', policy?.maxExpenseAge);
    }, [policy?.maxExpenseAge, translate]);

    const billableModeText = translate(`workspace.rules.individualExpenseRules.${policy?.defaultBillable ? 'billable' : 'nonBillable'}`);

    const individualExpenseRulesItems: IndividualExpenseRulesMenuItem[] = [
        {
            title: maxExpenseAmountNoReceiptText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.receiptRequiredAmount',
            action: () => Navigation.navigate(ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute(policyID)),
        },
        {
            title: maxExpenseAmountText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.maxExpenseAmount',
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID)),
        },
        {
            title: maxExpenseAgeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.maxExpenseAge',
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AGE.getRoute(policyID)),
        },
        {
            title: billableModeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.billableDefault',
            action: () => Navigation.navigate(ROUTES.RULES_BILLABLE_DEFAULT.getRoute(policyID)),
        },
    ];

    const areEReceiptsEnabled = policy?.eReceipts ?? false;

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.individualExpenseRules.title')}
            renderSubtitle={() => (
                <IndividualExpenseRulesSectionSubtitle
                    policy={policy}
                    translate={translate}
                    styles={styles}
                />
            )}
            subtitle={translate('workspace.rules.individualExpenseRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <View style={[styles.mt3, styles.gap3]}>
                {individualExpenseRulesItems.map((item) => (
                    <MenuItemWithTopDescription
                        key={translate(item.descriptionTranslationKey)}
                        shouldShowRightIcon
                        title={item.title}
                        description={translate(item.descriptionTranslationKey)}
                        onPress={item.action}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        numberOfLinesTitle={2}
                    />
                ))}

                <View style={[styles.mt3]}>
                    <View style={[styles.flexRow, styles.mb1, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.individualExpenseRules.eReceipts')}</Text>
                        <Switch
                            isOn={areEReceiptsEnabled}
                            accessibilityLabel={translate('workspace.categories.enableCategory')}
                            onToggle={() => PolicyActions.setWorkspaceEReceiptsEnabled(policyID, !areEReceiptsEnabled)}
                            disabled={policyCurrency !== CONST.CURRENCY.USD}
                        />
                    </View>
                    <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
                        <Text style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.eReceiptsHint')}</Text>{' '}
                        <TextLink
                            style={[styles.textLabel, styles.link]}
                            onPress={() => Link.openExternalLink(CONST.DEEP_DIVE_ERECEIPTS)}
                        >
                            {translate('workspace.rules.individualExpenseRules.eReceiptsHintLink')}
                        </TextLink>
                        .
                    </Text>
                </View>
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSection;
