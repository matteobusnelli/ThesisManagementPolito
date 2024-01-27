import React, { useState, useEffect } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import API from "../API";
import FlipClock from "./Clock";
import { Calendar, Clock } from "react-bootstrap-icons";
import dayjs from "dayjs";
const VirtualClock = (props) => {
  const [tempTime, setTempTime] = useState(props.virtualClock);
  const [isVirtual, setIsVirtual] = useState(
    JSON.parse(localStorage.getItem("virtualclock")) ? true : false
  );
  const [settingVirtual, setSettingVirtual] = useState(false);
  const [isAmPm, setIsAmPm] = useState("");
  const [virtualTime, setVirtualTime] = useState();

  /*   const updateTime = (amount, unit) => {
      const newDateTime = new Date(tempTime);
  
      if (unit === "hour") {
        newDateTime.setHours(newDateTime.getHours() + amount);
      } else if (unit === "day") {
        newDateTime.setDate(newDateTime.getDate() + amount);
      } else if (unit === "month") {
        newDateTime.setMonth(newDateTime.getMonth() + amount);
      } else if (unit === "year") {
        newDateTime.setFullYear(newDateTime.getFullYear() + amount);
      }
  
      setTempTime(newDateTime);
    }; */

  const handleVirtualTime = async () => {
    setIsVirtual(true);
    setSettingVirtual(false);
    props.setVirtualClock(virtualTime.toDate());
    localStorage.setItem("virtualclock", JSON.stringify(virtualTime.toDate()));
    console.log(virtualTime);
    await API.setVirtualTime(virtualTime.toDate());
    /*.then((response) => {
        if (response && "errors" in response) {
          //setErrors(response.errors);
        } else {
          //props.setVirtualClock(newTime);
          //setErrors(null);
        }
      })
      .catch((error) => {
        //setErrors([{ msg: error.message }]);
      });*/
  };

  const handleRealTime = async () => {
    setTempTime(new Date());
    setIsVirtual(false);
    props.setVirtualClock(new Date());
    localStorage.removeItem("virtualclock");
    await API.setRealTime()
      .then((response) => {
        if (response && "errors" in response) {
          //setErrors(response.errors);
        } else {
          props.setVirtualClock(tempTime);
          //setErrors(null);
        }
      })
      .catch((error) => {
        //setErrors([{ msg: error.message }]);
      });
  };

  return (
    <Container className="d-flex flex-column" style={{marginTop: "1em" }}>
      <div className="d-flex justify-content-center">
        <h2>SYSTEM CLOCK</h2>
      </div>
      <div>
        <FlipClock
          isVirtual={isVirtual}
          setIsVirtual={setIsVirtual}
          isAmPm={isAmPm}
          setIsAmPm={setIsAmPm}
          settingVirtual={settingVirtual}
          setSettingVirtual={setSettingVirtual}
          virtualTime={virtualTime}
          setVirtualTime={setVirtualTime}
          systemTime={props.virtualClock ? props.virtualClock : new Date()}
          setSystemTime={props.setVirtualClock}
        />
      </div>
      <div className="mt-3 d-flex justify-content-center">
        {" "}
        {/* Adjust the margin top as needed */}
        {!settingVirtual && !isVirtual && (
          <Button
            style={{ marginRight: "0.5em" }}
            onClick={() => {
              setSettingVirtual(true);
            }}
          >
            Virtual time Mode{" "}
          </Button>
        )}
        {!settingVirtual && isVirtual && (
          <Button style={{ marginRight: "0.5em" }} onClick={handleRealTime}>
            {" "}
            Real time Mode{" "}
          </Button>
        )}
        {settingVirtual && isVirtual && (
          <Button
            style={{ marginRight: "0.5em" }}
            onClick={() => {
              handleRealTime();
              setSettingVirtual(false);
            }}
          >
            {" "}
            Real time Mode{" "}
          </Button>
        )}
        {!settingVirtual && isVirtual && (
          <Button
            style={{ marginRight: "0.5em" }}
            onClick={() => {
              setIsVirtual(false);
              setSettingVirtual(true);
            }}
          >
            {" "}
            Set Virtual time{" "}
          </Button>
        )}
        {settingVirtual && !isVirtual && (
          <Button
            style={{ marginRight: "0.5em" }}
            onClick={() => {
              setIsVirtual(false);
              setSettingVirtual(false);
              handleRealTime();
            }}
          >
            {" "}
            Go back in Real Time{" "}
          </Button>
        )}
        {settingVirtual && (
          <Button style={{ marginRight: "0.5em" }} onClick={handleVirtualTime}>
            {" "}
            Apply virtual time{" "}
          </Button>
        )}
      </div>
    </Container>
  );
};

export default VirtualClock;
