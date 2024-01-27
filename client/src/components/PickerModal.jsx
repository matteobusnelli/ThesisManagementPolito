import React, { useState } from "react";
import { Modal, Button, Stack, TextField, Paper } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";

const DatePickerModal = ({ show, handleClose, handleSave }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log(date);
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxWidth: "80%",
        }}
      >
        <Paper
          elevation={10}
          style={{
            backgroundColor: "rgba(255, 255, 255, 1)",
            padding: "24px",
            maxWidth: "100%",
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <Button
                variant="contained"
                onClick={() => handleSave(selectedDate)}
              >
                Save Changes
              </Button>
            </Stack>
          </LocalizationProvider>
        </Paper>
      </div>
    </Modal>
  );
};

const TimePickerModal = ({ show, handleClose, handleSave }) => {
  const [selectedTime, setSelectedTime] = useState(dayjs());

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    console.log("time", time);
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxWidth: "80%",
        }}
      >
        <Paper
          elevation={10}
          style={{
            backgroundColor: "rgba(255, 255, 255, 1)",
            padding: "24px",
            maxWidth: "100%",
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
              <TimePicker
                label="Select Time"
                value={selectedTime}
                onChange={handleTimeChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <Button
                variant="contained"
                onClick={() => handleSave(selectedTime)}
              >
                Save Changes
              </Button>
            </Stack>
          </LocalizationProvider>
        </Paper>
      </div>
    </Modal>
  );
};

export { DatePickerModal, TimePickerModal };
