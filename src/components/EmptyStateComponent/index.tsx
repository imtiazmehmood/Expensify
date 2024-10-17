import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import VideoPlayer from '@components/VideoPlayer';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {EmptyStateComponentProps, VideoLoadedEventType} from './types';

const VIDEO_ASPECT_RATIO = 400 / 225;

function EmptyStateComponent({
    SkeletonComponent,
    headerMediaType,
    headerMedia,
    buttons,
    containerStyles,
    title,
    titleStyles,
    subtitle,
    headerStyles,
    headerContentStyles,
    lottieWebViewStyles,
    minModalHeight = 400,
}: EmptyStateComponentProps) {
    const styles = useThemeStyles();
    const [videoAspectRatio, setVideoAspectRatio] = useState(VIDEO_ASPECT_RATIO);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const setAspectRatio = (event: VideoReadyForDisplayEvent | VideoLoadedEventType | undefined) => {
        if (!event) {
            return;
        }

        if ('naturalSize' in event) {
            setVideoAspectRatio(event.naturalSize.width / event.naturalSize.height);
        } else {
            setVideoAspectRatio(event.srcElement.videoWidth / event.srcElement.videoHeight);
        }
    };

    const HeaderComponent = useMemo(() => {
        switch (headerMediaType) {
            case CONST.EMPTY_STATE_MEDIA.VIDEO:
                return (
                    <VideoPlayer
                        url={headerMedia}
                        videoPlayerStyle={[headerContentStyles, {aspectRatio: videoAspectRatio}]}
                        videoStyle={styles.emptyStateVideo}
                        onVideoLoaded={setAspectRatio}
                        controlsStatus={CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW}
                        shouldUseControlsBottomMargin={false}
                        shouldPlay
                        isLooping
                    />
                );
            case CONST.EMPTY_STATE_MEDIA.ANIMATION:
                return (
                    <Lottie
                        source={headerMedia}
                        autoPlay
                        loop
                        style={headerContentStyles}
                        webStyle={lottieWebViewStyles}
                    />
                );
            case CONST.EMPTY_STATE_MEDIA.ILLUSTRATION:
                return (
                    <ImageSVG
                        style={headerContentStyles}
                        src={headerMedia}
                    />
                );
            default:
                return null;
        }
    }, [headerMedia, headerMediaType, headerContentStyles, videoAspectRatio, styles.emptyStateVideo, lottieWebViewStyles]);

    return (
        <ScrollView
            contentContainerStyle={[{minHeight: minModalHeight}, styles.flexGrow1, styles.flexShrink0, containerStyles]}
            style={styles.flex1}
        >
            <View style={styles.skeletonBackground}>
                <SkeletonComponent
                    gradientOpacityEnabled
                    shouldAnimate={false}
                />
            </View>
            <View style={styles.emptyStateForeground}>
                <View style={styles.emptyStateContent}>
                    <View style={[styles.emptyStateHeader(headerMediaType === CONST.EMPTY_STATE_MEDIA.ILLUSTRATION), headerStyles]}>{HeaderComponent}</View>
                    <View style={shouldUseNarrowLayout ? styles.p5 : styles.p8}>
                        <Text style={[styles.textAlignCenter, styles.textHeadlineH1, styles.mb2, titleStyles]}>{title}</Text>
                        {typeof subtitle === 'string' ? <Text style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal]}>{subtitle}</Text> : subtitle}
                        <View style={[styles.gap2, styles.mt5, !shouldUseNarrowLayout ? styles.flexRow : undefined]}>
                            {buttons?.map(({buttonText, buttonAction, success}, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <View
                                    key={index}
                                    style={styles.flex1}
                                >
                                    <Button
                                        // eslint-disable-next-line react/no-array-index-key
                                        success={success}
                                        onPress={buttonAction}
                                        text={buttonText}
                                        large
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

EmptyStateComponent.displayName = 'EmptyStateComponent';
export default EmptyStateComponent;
