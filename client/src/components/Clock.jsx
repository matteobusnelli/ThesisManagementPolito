import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronDown, ChevronUp, Clock } from "react-bootstrap-icons";
import "../Clock.css";
import dayjs from "dayjs";
import { DatePickerModal, TimePickerModal } from "./PickerModal";
import { Button, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

const FlipClock = ({
  isVirtual,
  setIsVirtual,
  setIsAmPm,
  settingVirtual,
  virtualTime,
  setVirtualTime,
  systemTime,
  setSystemTime,
}) => {
  const [time, setTime] = useState(new Date());
  const [virtualTimeArray, setVirtualTimeArray] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  const [modalDate, setModalDate] = useState(false);
  const [modalTime, setModalTime] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const calendarTooltip = (
    <Tooltip id="calendar-tooltip">Open calendar</Tooltip>
  );

  const clockTooltip = <Tooltip id="clock-tooltip">Open Clock</Tooltip>;

  const handlePickDate = (date) => {
    const timePart = virtualTime.format("HH:mm:ss");
    const selectedDate = date.startOf("day").format("YYYY-MM-DD");
    const combinedDateTime = `${selectedDate} ${timePart}`;
    let d = dayjs(combinedDateTime);
    setVirtualTime(d);
    setModalDate(false);
    setIsVirtual(true);
  };

  const handlePickTime = (date) => {
    let timePart = dayjs().startOf("day").format("YYYY-MM-DD");
    if (virtualTime !== undefined) {
      timePart = virtualTime.startOf("day").format("YYYY-MM-DD");
    }
    const selectedDate = date.format("HH:mm:ss");
    const combinedDateTime = `${selectedDate} ${timePart}`;
    let d = dayjs(combinedDateTime);
    setVirtualTime(d);
    setModalTime(false);
    setIsVirtual(true);
  };

  const handleTraslationToArray = useCallback(() => {
    let v = [];
    v.push(parseInt(month[0]));
    v.push(parseInt(month[1]));
    v.push(parseInt(day[0]));
    v.push(parseInt(day[1]));
    v.push(parseInt(year[0]));
    v.push(parseInt(year[1]));
    v.push(parseInt(year[2]));
    v.push(parseInt(year[3]));
    v.push(parseInt(hours[0]));
    v.push(parseInt(hours[1]));
    v.push(parseInt(minutes[0]));
    v.push(parseInt(minutes[1]));
    v.push(parseInt(seconds[0]));
    v.push(parseInt(seconds[1]));
    setVirtualTimeArray(v);
  }, [month, day, year, hours, minutes, seconds]);

  useEffect(() => {
    handleTraslationToArray();
  }, [handleTraslationToArray]);

  useEffect(() => {
    console.log(systemTime);
    if (!isVirtual && !settingVirtual) {
      const interval = setInterval(() => {
        setTime(new Date());
      }, 1000);

      return () => clearInterval(interval);
    }
    if (settingVirtual && !isVirtual) {
      handleTraslationToArray();
    }

    if (isVirtual && !settingVirtual) {
      const interval = setInterval(() => {
        setVirtualTime((prevVirtualTime) => {
          let updatedVirtualTime;
          if (prevVirtualTime !== undefined) {
            updatedVirtualTime = prevVirtualTime.add(1, "second");
          } else {
            updatedVirtualTime = localStorage.getItem("virtualclock")
              ? dayjs(
                  new Date(JSON.parse(localStorage.getItem("virtualclock")))
                ).add(1, "second")
              : dayjs().add(1, "second");
          }
          setSystemTime(updatedVirtualTime.toDate());
          localStorage.setItem(
            "virtualclock",
            JSON.stringify(updatedVirtualTime.toDate())
          );
          return updatedVirtualTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVirtual, settingVirtual]);

  useEffect(() => {
    const handleDateTimeUpdate = (dateTime) => {
      setHours(formatTime(dateTime.getHours()));
      setMinutes(formatTime(dateTime.getMinutes()));
      setSeconds(formatTime(dateTime.getSeconds()));
      setDay(dateTime.getDate().toString().padStart(2, "0"));
      setMonth((dateTime.getMonth() + 1).toString().padStart(2, "0"));
      setYear(dateTime.getFullYear().toString());
      handleTraslationToArray();
    };

    if (!isVirtual && !settingVirtual) {
      handleDateTimeUpdate(time);
      setIsLoading(false);
    } else {
      handleDateTimeUpdate(
        virtualTime
          ? virtualTime.toDate()
          : new Date(JSON.parse(localStorage.getItem("virtualclock")))
      );

      setIsLoading(false);
    }
  }, [isLoading, time, virtualTime]);

  const formatTime = (value) => {
    return value.toString().padStart(2, "0");
  };
  if (formatTime(time.getHours()) >= 12) setIsAmPm("pm");
  else if (formatTime(time.getHours()) < 12) setIsAmPm("am");

  const setVirtual = (v) => {
    let year = v.slice(4, 8).join("");
    let month = v.slice(0, 2).join("");
    let day = v.slice(2, 4).join("");
    let minutes = v.slice(10, 12).join("");
    let seconds = v.slice(12, 14).join("");
    let hours = v.slice(8, 10).join("");
    let dateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    let d = dayjs(new Date(dateString));
    setVirtualTime(d);
  };

  const handleChange = (id) => {
    let v = [...virtualTimeArray];
    let tmp;
    let firstTwoElements = v.slice(0, 2);
    let m = parseInt(firstTwoElements.join(""));
    switch (id) {
      case "m1_up":
        v[0] = parseInt((v[0] + 1) % 2);
        if (v[1] > 2) v[1] = 0;
        if (v[1] == 0 && v[0] == 0) v[1] = 1;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "m2_up":
        v[1] = parseInt((v[1] + 1) % 10);
        if (v[0] === 0 && v[1] === 0) v[1] = 1;
        if (v[1] > 2 && v[0] === 1) {
          v[1] = 0;
        }
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "d1_up":
        v[2] = parseInt((v[2] + 1) % 4);

        //feb
        if (m === 2) {
          if (v[2] > 2) {
            v[2] = 0;
            if (v[3] === 0) v[3] = 1;
          }
        } else if (m === 11 || m === 4 || m === 6 || m === 9) {
          if (v[2] > 3) {
            if (v[3] === 0) v[2] = 1;
            else v[2] = 0;
          } else if (v[2] === 3 && v[3] != 0) v[3] = 0;
        } else if (v[2] === 3 && v[3] > 1) {
          v[3] = 0;
        }

        if (v[3] == 0 && v[2] == 0) {
          v[3] = 1;
        }

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "d2_up":
        v[3] = parseInt((v[3] + 1) % 10);
        //feb

        if (m === 2) {
          if (v[7] % 4 === 0) {
            if (v[3] > 9) {
              if (v[2] === 0) v[3] = 1;
              else v[3] = 0;
            }
          } else {
            if (v[3] > 8) {
              if (v[2] === 2) v[3] = 0;
            }
          }
        } else if (m === 11 || m === 4 || m === 6 || m === 9) {
          if (v[2] === 3) {
            v[3] = 0;
          }
        } else if (v[2] === 3 && v[3] > 1) {
          v[3] = 0;
        }

        if (v[3] == 0 && v[2] == 0) v[3] = 1;

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y1_up":
        v[4] = parseInt((v[4] + 1) % 10);
        if (v[4] === 0) {
          v[4] = 1;
        }
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y2_up":
        v[5] = parseInt((v[5] + 1) % 10);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y3_up":
        v[6] = parseInt((v[6] + 1) % 10);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y4_up":
        v[7] = parseInt((v[7] + 1) % 10);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;

      case "h1_up":
        v[8] = parseInt((v[8] + 1) % 3);
        if ((v[9] > 3 && v[8] > 1) || v[8] > 2) v[8] = 0;
        setVirtualTimeArray(v);
        setVirtual(v);

        break;
      case "h2_up":
        v[9] = parseInt((v[9] + 1) % 10);
        if (v[8] === 2 && v[9] > 3) v[9] = 0;
        else if (v[9] > 9) v[9] = 0;

        setVirtualTimeArray(v);
        setVirtual(v);

        break;
      case "min1_up":
        v[10] = parseInt((v[10] + 1) % 6);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "min2_up":
        v[11] = parseInt((v[11] + 1) % 10);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "s1_up":
        v[12] = parseInt((v[12] + 1) % 6);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "s2_up":
        v[13] = parseInt((v[13] + 1) % 10);
        setVirtualTimeArray(v);
        setVirtual(v);
        break;

      case "m1_down":
        v[0] = parseInt((v[0] - 1) % 2);

        if (v[0] < 0) {
          if (v[1] > 2) v[1] = 0;
          v[0] = 1;
        }
        if (v[0] === 0 && v[1] === 0) v[1] = 1;

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "m2_down":
        v[1] = parseInt((v[1] - 1) % 10);
        if (v[1] < 0) {
          if (v[0] === 1) v[1] = 2;
          else v[1] = 9;
        }

        if (v[0] === 0 && v[1] === 0) {
          v[1] = 9;
        }

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "d1_down":
        v[2] = parseInt((v[2] - 1) % 4);
        //feb
        if (m === 2) {
          if (v[7] % 4 == 0) {
            if (v[2] < 0) {
              v[2] = 2;
            }
          } else {
            if (v[2] < 0) {
              if (v[3] > 8) v[2] = 1;
              else v[2] = 2;
            }
          }
        } else if (m === 11 || m === 4 || m === 6 || m === 9) {
          if (v[2] < 0) {
            if (v[3] === 0) v[2] = 3;
            else v[2] = 2;
          }
        } else {
          if (v[2] < 0) {
            if (v[3] < 2) v[2] = 3;
            else v[2] = 2;
          }
        }

        if (v[3] == 0 && v[2] == 0) {
          v[3] = 1;
        }

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "d2_down":
        v[3] = parseInt((v[3] - 1) % 10);
        //feb
        if (m === 2) {
          if (v[7] % 4 == 0) {
            if (v[3] < 0) v[3] = 9;
          } else {
            if (v[3] < 0)
              if (v[2] === 2) v[3] = 8;
              else v[3] = 9;
          }
        } else if (m === 11 || m === 4 || m === 6 || m === 9) {
          if (v[3] < 0) {
            if (v[2] === 3) v[3] = 0;
            else v[3] = 9;
          }
        } else {
          if (v[3] < 0)
            if (v[2] === 3) v[3] = 1;
            else v[3] = 9;
        }

        if (v[3] == 0 && v[2] == 0) {
          v[3] = 9;
        }
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y1_down":
        tmp = parseInt((v[4] - 1) % 10);
        if (tmp < 1) tmp = 9;
        v[4] = tmp;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y2_down":
        tmp = parseInt((v[5] - 1) % 10);
        if (tmp < 0) tmp = 9;
        v[5] = tmp;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y3_down":
        tmp = parseInt((v[6] - 1) % 10);
        if (tmp < 0) tmp = 9;
        v[6] = tmp;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "y4_down":
        tmp = parseInt((v[7] - 1) % 10);
        if (tmp < 0) tmp = 9;
        v[7] = tmp;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "h1_down":
        v[8] = parseInt((v[8] - 1) % 3);
        if (v[8] < 0) {
          if (v[9] > 3) v[8] = 1;
          else v[8] = 2;
        }
        setVirtualTimeArray(v);
        setVirtual(v);

        break;
      case "h2_down":
        v[9] = parseInt((v[9] - 1) % 10);
        if (v[9] < 0) {
          if (v[8] < 2) v[9] = 9;
          else v[9] = 3;
        }
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "min1_down":
        v[10] = parseInt((v[10] - 1) % 6);
        if (v[10] < 0) v[10] = 5;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "min2_down":
        v[11] = parseInt((v[11] - 1) % 10);
        if (v[11] < 0) v[11] = 9;
        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "s1_down":
        v[12] = parseInt((v[12] - 1) % 6);
        if (v[12] < 0) v[12] = 5;

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
      case "s2_down":
        v[13] = parseInt((v[13] - 1) % 10);
        if (v[13] < 0) v[13] = 9;

        setVirtualTimeArray(v);
        setVirtual(v);
        break;
    }
  };

  return isLoading ? (
    <span>Loading</span>
  ) : (
    <>
      <div className="flip-clock-container no-highlight">
        <div className="calendar-container">
          {settingVirtual && !isMobile && (
            <OverlayTrigger placement="top" overlay={calendarTooltip}>
              <Calendar
                style={{ marginRight: "1em" }}
                onClick={() => setModalDate(true)}
              />
            </OverlayTrigger>
          )}
          <div className="flip-clock">
            <span className="dmy">d</span>
            {/* Day 1 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("d1_up")}
                >
                  <ChevronUp color="black" id="d1_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[2] : day[0]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("d1_down")}
                >
                  <ChevronDown color="black" id="d1_down" />
                </div>
              )}
            </div>
            {/* Day 2 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("d2_up")}
                >
                  <ChevronUp color="black" id="d2_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[3] : day[1]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("d2_down")}
                >
                  <ChevronDown color="black" id="d2_down" />
                </div>
              )}
            </div>
            <span className="date-separator"></span>
            <span className="dash">-</span>
            <span className="dmy">m</span>
            {/* Month 1 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("m1_up")}
                >
                  <ChevronUp color="black" id="m1_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[0] : month[0]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("m1_down")}
                >
                  <ChevronDown color="black" id="m1_down" />
                </div>
              )}
            </div>
            {/* Month 2 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("m2_up")}
                >
                  <ChevronUp color="black" id="m2_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[1] : month[1]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("m2_down")}
                >
                  <ChevronDown color="black" id="m2_down" />
                </div>
              )}
            </div>
            <span className="date-separator"></span>
            <span className="dash">-</span>
            <span className="dmy">y</span>
            {/* year 1 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("y1_up")}
                >
                  <ChevronUp color="black" id="y1_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[4] : year[0]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("y1_down")}
                >
                  <ChevronDown color="black" id="y1_down" />
                </div>
              )}
            </div>
            {/* year 2 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("y2_up")}
                >
                  <ChevronUp color="black" id="y2_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[5] : year[1]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("y2_down")}
                >
                  <ChevronDown color="black" id="y2_down" />
                </div>
              )}
            </div>
            {/* year 3 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("y3_up")}
                >
                  <ChevronUp color="black" id="y3_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[6] : year[2]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("y3_down")}
                >
                  <ChevronDown color="black" id="y3_down" />
                </div>
              )}
            </div>
            {/* year 4 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("y4_up")}
                >
                  <ChevronUp color="black" id="y4_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[7] : year[3]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("y4_down")}
                >
                  <ChevronDown color="black" id="y4_down" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="calendar-container">
          {settingVirtual && !isMobile && (
            <OverlayTrigger placement="top" overlay={clockTooltip}>
              <Clock
                style={{ marginRight: "1em" }}
                onClick={() => {
                  setModalTime(true);
                }}
              />
            </OverlayTrigger>
          )}
          <div className="flip-clock">
            {/* Hour 1 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("h1_up")}
                >
                  <ChevronUp color="black" id="h1_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[8] : hours[0]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("h1_down")}
                >
                  <ChevronDown color="black" id="h1_down" />
                </div>
              )}
            </div>
            {/* Hour 2 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("h2_up")}
                >
                  <ChevronUp color="black" id="h2_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[9] : hours[1]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("h2_down")}
                >
                  <ChevronDown color="black" id="h2_down" />
                </div>
              )}
            </div>
            <span className="dash">:</span>
            <span className="date-separator"></span>

            {/* Minute 1 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("min1_up")}
                >
                  <ChevronUp color="black" id="min1_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[10] : minutes[0]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("min1_down")}
                >
                  <ChevronDown color="black" id="min1_down" />
                </div>
              )}
            </div>
            {/* Minute 2 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("min2_up")}
                >
                  <ChevronUp color="black" id="min2_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[11] : minutes[1]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("min2_down")}
                >
                  <ChevronDown color="black" id="min2_down" />
                </div>
              )}
            </div>
            <span className="dash">:</span>
            <span className="date-separator"></span>

            {/* seconds 1 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("s1_up")}
                >
                  <ChevronUp color="black" id="s1_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[12] : seconds[0]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("s1_down")}
                >
                  <ChevronDown color="black" id="s1_down" />
                </div>
              )}
            </div>
            {/* seoconds 2 */}
            <div className="digit">
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-up"
                  onClick={() => handleChange("s2_up")}
                >
                  <ChevronUp color="black" id="s2_up" />
                </div>
              )}
              <div className="card-custom">
                <div className="front">
                  {" "}
                  {settingVirtual ? virtualTimeArray[13] : seconds[1]}
                </div>
              </div>
              {settingVirtual && !isMobile && (
                <div
                  className="chevron-down"
                  onClick={() => handleChange("s2_down")}
                >
                  <ChevronDown color="black" id="s2_down" />
                </div>
              )}
            </div>
          </div>

          <DatePickerModal
            show={modalDate}
            handleClose={() => setModalDate(false)}
            handleSave={handlePickDate}
          />
          <TimePickerModal
            show={modalTime}
            handleClose={() => setModalTime(false)}
            handleSave={handlePickTime}
          />
        </div>

        {settingVirtual && isMobile && (
          <div className="calendar-container">
            <Button
              onClick={() => setModalDate(true)}
              style={{ marginRight: "0.3em" }}
            >
              <Calendar style={{ marginRight: "1em" }} />
              <span> choose date</span>
            </Button>

            <Button
              onClick={() => setModalTime(true)}
              style={{ marginLeft: "0.3em" }}
            >
              <Clock style={{ marginRight: "1em" }} />
              <span> choose hour </span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default FlipClock;
