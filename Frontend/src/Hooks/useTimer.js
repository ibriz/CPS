import { useEffect, useState } from "react";
import { connect } from 'react-redux';
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
    console.log("useTimer2");
    console.log(timestampRedux);
    const dispatch = useDispatch();

    function calculateRemainingTime() {

        let timestamp = Math.floor(Date.now() / 1000);
        var d = remainingTimeRedux - (timestamp - timestampRedux);
        console.log("useTimer");
        console.log(timestamp);
        console.log(timestampRedux);
        console.log(period);
        console.log(timestamp - timestampRedux);

        console.log(d);
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


    useEffect(() => {
        // fetchPeriodDetailsRequest();
        if (!remainingTimeRedux || !period || !timestampRedux) {
            dispatch(fetchPeriodDetailsRequest());
        }
        calculateRemainingTime();
        const interval = setInterval(() => calculateRemainingTime(), 1000);
        console.log("useTimer3");
        console.log();

        return () => clearInterval(interval);
    }, [timestampRedux, remainingTimeRedux])

    return {
        period,
        remainingTime,
        remainingTimeSecond: remainingTimeRedux
    }
}


export default useTimer;