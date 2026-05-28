import { useEffect, useState } from "react";

export default function useCounter(startDate) {
  const [time, setTime] = useState({});

  useEffect(() => {
    const calc = () => {
      const start = new Date(startDate + "T00:00:00");
      const now = new Date();

      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      setTime({ totalDays: days, months, years });
    };

    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [startDate]);

  return time;
}
