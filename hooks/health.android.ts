import { useEffect, useState } from 'react';
import GoogleFit, { Scopes  } from 'react-native-google-fit';

type Props = {
    step: number;
    cal: number;
    heart: number;
}

type StepCount = {
    source: string;
    steps: {
        date: string;
        value: number;
    }[];
}

type CalorieData = {
    startDate: string;
    endDate: string;
    calorie: number;
}

type HeartRateData = {
    startDate: string;
    endDate: string;
    value: number;
}

export const useGoogleFitSteps = (): Props => {
    const [healths, setHealths] = useState<Props>({ step:0, cal:0, heart: 0 });

    useEffect(() => {
        const options = {
            scopes: [
                Scopes.FITNESS_ACTIVITY_READ,
                Scopes.FITNESS_BODY_READ,
                Scopes.FITNESS_ACTIVITY_WRITE,
            ],
        };

        GoogleFit.authorize(options)
            .then((authResult) => {
                if (authResult.success) {
                    const startDate = new Date().setHours(0, 0, 0, 0);
                    const endDate = new Date().setHours(23, 59, 59, 999);

                    GoogleFit.getDailyStepCountSamples({
                        startDate: new Date(startDate).toISOString(),
                        endDate: new Date(endDate).toISOString(),
                    }).then((res: StepCount[]) => {
                        const stepData = res.find(
                            (item) => item.source === 'com.google.android.gms:estimated_steps'
                        );
                        if (stepData && stepData.steps.length > 0) {
                            setHealths({...healths, step: stepData.steps[0].value});
                        }
                    }).catch((err) => console.error(err));

                    GoogleFit.getDailyCalorieSamples({
                        startDate: new Date(startDate).toISOString(),
                        endDate: new Date(endDate).toISOString(),
                    }).then((res: CalorieData[]) => {
                        const totalCalories = res.reduce((total, entry) => total + entry.calorie, 0);
                        setHealths({...healths, cal:  totalCalories});
                    }).catch((err) => console.error(err));

                    GoogleFit.getHeartRateSamples({
                        startDate: new Date(startDate).toISOString(),
                        endDate: new Date(endDate).toISOString(),
                    }).then((res: HeartRateData[]) => {
                        const heartRateValues = res.map((entry) => entry.value);
                        const totalHeartRate = heartRateValues.reduce((sum, value) => sum + value, 0);
                        const averageHeartRate = totalHeartRate / heartRateValues.length;
                        setHealths({...healths, heart:  averageHeartRate});
                    }).catch((err) => console.error(err));

                } else {
                    console.error('Google Fit authorization failed', authResult.message);
                }
            })
            .catch((err) => console.error('Google Fit authorization error', err));
    }, []);

    return healths;
};


