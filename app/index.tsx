import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import { ThemedText } from '@/components/ThemedText';

import { Platform } from 'react-native';
import {useHealthKitSteps} from "@/hooks/health.ios";
import {useGoogleFitSteps} from "@/hooks/health.android";
import {Crops} from "@/constants/Crops";
import React from "react";
import * as Progress from 'react-native-progress';

const levelGap = 1000;
// @ts-ignore
const useHealth = Platform.select({
    ios: () => useHealthKitSteps,
    android: () => useGoogleFitSteps,
})();

export default function HomeScreen() {
    const health = useHealth();

    function getClosestCropEmoji(steps: number) {
        const closestCrop = Crops.reduce((prev, curr) => {
            return Math.abs(curr.requiredSteps - steps + levelGap) < Math.abs(prev.requiredSteps - steps) ? curr : prev;
        });
        return {emoji: closestCrop.emoji, priceLevel: closestCrop.priceLevel, name: closestCrop.name, step: closestCrop.requiredSteps};
    }

    function processNumber(num: number) {
        if (num >= 100) {
            return (num / 10) % 100;
        }
        return num;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                <ThemedText style={{color: '#18100c'}} type="subtitle">더 많이 걸을수록</ThemedText>
                <ThemedText style={{color: '#18100c'}} type="subtitle">맛있는 반찬을 얻어요</ThemedText>
                <Text style={{fontSize: 200}}>{getClosestCropEmoji(health.step).emoji}</Text>
                {/*<ThemedText type="subtitle">걸음 수: {health.step}</ThemedText>*/}
                {/*<ThemedText type="subtitle">오늘 태운 칼로리 수: {health.cal}</ThemedText>*/}
                {/*<ThemedText type="subtitle">오늘 심장박동 평균: {health.heart}</ThemedText>*/}
            </View>
            <View style={styles.progressContainer}>
                <View style={styles.progressTitle}>
                    <ThemedText  style={{color: '#f97278'}} type="defaultSemiBold">{getClosestCropEmoji(health.step).name}</ThemedText>
                    <ThemedText  style={{color: '#f97278'}} type="defaultSemiBold">{processNumber(health.step).toFixed(2)}%</ThemedText>
                </View>

                <Progress.Bar height={10} progress={processNumber(health.step)/100} color={'#f97278'} width={null} borderRadius={4} borderColor={'#f97278'}/>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcf7e5',
        padding: 100,
        justifyContent: 'space-evenly',
    },
    progress:{
        borderRadius: 5,
        overflow: 'hidden',
        transform: [{ scaleY: 5 }],
    },
    progressContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    progressTitle: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginBottom: 20,
    },
    mainContainer:{
        alignItems: 'center',
    }
});
