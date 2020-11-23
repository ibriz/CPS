import { useEffect, useState } from "react";
import { fetchPeriodDetailsRequest } from 'Redux/Reducers/periodSlice';
import { useDispatch, useSelector } from "react-redux";


const useTimer = () => {
    const remainingTimeRedux = useSelector(state => state.period.remainingTime);
    const period = useSelector(state => state.period.period);
    const timestampRedux = useSelector(state => state.period.timestamp);
    const [remainingTime, setRemainingTime] = useState({
        day: 0,
        hour: 0,
        minute: 0,
        second: 0
    })
    const dispatch = useDispatch();

    function calculateRemainingTime() {

        let timestamp = Math.floor(Date.now() / 1000);
        var d = remainingTimeRedux - (timestamp - timestampRedux);
        if (remainingTimeRedux > 0 && d > 0) {
            console.log("timestampRedux");
            var r = {};                                                                
            var s = {                                                                 
                day: 86400,   
                hour: 3600,
                minute: 60,
                second: 1
            };

            Object.keys(s).forEach(function (key) {
                r[key] = Math.floor(d / s[key]);
                // if(r[key] < 0) {
                //     r[key] = 0;
                // }
                d -= r[key] * s[key];
            });

            // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
            console.log(r);

            setRemainingTime(r);
        } else {
            setRemainingTime(
                {
                    day: 0,
                    hour: 0,
                    minute: 0,
                    second: 0
                }
            );
            // dispatch(fetchPeriodDetailsRequest());
        }

    }


    let highestSignificantTime = {
        text: 'second',
        value: 0
    }

    if (remainingTime.day !== 0) {
        highestSignificantTime.text = 'day' + (remainingTime.day > 1 ? 's': '');
        highestSignificantTime.value = remainingTime.day
    } else if (remainingTime.hour !== 0) {
        highestSignificantTime.text = 'hour' + (remainingTime.hour > 1 ? 's': '');
        highestSignificantTime.value = remainingTime.hour
    } else if (remainingTime.minute !== 0) {
        highestSignificantTime.text = 'minute' + (remainingTime.minute > 1 ? 's': '');
        highestSignificantTime.value = remainingTime.minute
    } else {
        highestSignificantTime.text = 'second' + (remainingTime.second > 1 ? 's': '');
        highestSignificantTime.value = remainingTime.second
    }


    useEffect(() => {
        // fetchPeriodDetailsRequest();
        if (!remainingTimeRedux || !period || !timestampRedux) {
            dispatch(fetchPeriodDetailsRequest());
        }
        calculateRemainingTime();
        const interval = setInterval(() => calculateRemainingTime(), 1000);
 

        return () => clearInterval(interval);
    }, [timestampRedux, remainingTimeRedux])

    return {
        period,
        remainingTime,
        remainingTimeSecond: remainingTimeRedux,
        isRemainingTimeZero: (remainingTime.day === 0) && (remainingTime.hour === 0) && (remainingTime.minute === 0) && (remainingTime.second === 0),
        highestSignificantTime
    }
}


export default useTimer;