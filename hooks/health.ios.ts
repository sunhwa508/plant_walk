import { useEffect, useState } from 'react';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

const { Permissions } = AppleHealthKit.Constants;

export const permissions: HealthKitPermissions = {
    permissions: {
        read: [
            Permissions.Steps,
            Permissions.FlightsClimbed,
            Permissions.DistanceWalkingRunning,
            Permissions.HeartRate,
            Permissions.EnergyConsumed
        ],
        write: [],
    },
};

type Props = {
    step: number;
    cal: number;
    heart: number;
}
export const useHealthKitSteps = (): Props => {
    const [healths, setHealths] = useState<Props>({ step:0, cal:0, heart: 0 });

    useEffect(() => {
        const today = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const initializeHealthKit = async () => {
            try {
                await new Promise((resolve, reject) => {
                    AppleHealthKit.initHealthKit(permissions, (err) => {
                        if (err) reject(err);
                        else resolve(null);
                    });
                });

                await fetchStepCount(today);
                await fetchCalories(todayStart, today);
                await fetchHeartRate(todayStart, today);

            } catch (error) {
                console.error('HealthKit initialization or data fetching error:', error);
            }
        };

        const fetchStepCount = (date: string) => {
            AppleHealthKit.getStepCount({ date }, (err, results) => {
                if (err) {
                    handleError('Error fetching step count', err);
                    return;
                }
                setHealths((prev) => ({ ...prev, step: results.value }));
            });
        };

        const fetchCalories = (startDate: Date, endDate: string) => {
            AppleHealthKit.getEnergyConsumedSamples(
                { startDate: startDate.toISOString(), endDate },
                (err, results) => {
                    if (err) {
                        handleError('Error fetching calorie data', err);
                        return;
                    }
                    const totalCalories = results.reduce((sum, data) => sum + data.value, 0);
                    setHealths((prev) => ({ ...prev, cal: totalCalories }));
                }
            );
        };

        const fetchHeartRate = (startDate: Date, endDate: string) => {
            AppleHealthKit.getHeartRateSamples(
                { startDate: startDate.toISOString(), endDate },
                (err, results) => {
                    if (err) {
                        handleError('Error fetching heart rate data', err);
                        return;
                    }
                    if (results.length === 0) return;

                    const totalHeartRate = results.reduce((sum, data) => sum + data.value, 0);
                    setHealths((prev) => ({ ...prev, heart: totalHeartRate / results.length }));
                }
            );
        };

        const handleError = (message: string, err: any) => {
            console.error(`${message}:`, err);
        };

        initializeHealthKit();
    }, []);

    return healths;
};


