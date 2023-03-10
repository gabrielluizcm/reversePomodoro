import React from 'react';

import { Button } from '../Button';
import { TimerSwitch } from '../TimerSwitch';
import { StatusLabel } from '../StatusLabel';
import { Counters } from '../Counters';

import { useInterval } from '../../hooks/useInterval';
import { secondsToTime } from '../../utils/secondsToTime';

import './style.scss';

type MainTimerProps = {
  chillTime: number;
  shortWorkTime: number;
  longWorkTime: number;
};

export type Status = 'idle' | 'chilling' | 'working';

export function MainTimer(props: MainTimerProps) {
  // Too many stuff here, I'll reallocate components after base functionalities are done
  const [chillTime, setChillTime] = React.useState(props.chillTime);
  const [workTime, setWorkTime] = React.useState(props.shortWorkTime);
  const [status, setStatus] = React.useState<Status>('idle');
  const [paused, setPaused] = React.useState(false);
  const [reversePomodoros, setReversePomodoros] = React.useState(0);
  const [totalChillingTime, setTotalChillingTime] = React.useState(0);
  const [totalWorkingTime, setTotalWorkingTime] = React.useState(0);

  const background = setBackground(status, reversePomodoros);
  const times = {
    chillTime,
    workTime,
  };

  const increaseAndCheckReversePomodoros = () => {
    const newReversePomodoros = reversePomodoros + 1;
    setReversePomodoros(newReversePomodoros);

    // Using const instead of state to work around state change delay
    if (newReversePomodoros % 4 === 0) setWorkTime(props.longWorkTime);
  };

  const resetChill = () => {
    setChillTime(props.chillTime);
    setPaused(false);
    increaseAndCheckReversePomodoros();
    setStatus('working');
  };

  const resetWork = () => {
    setPaused(false);
    setWorkTime(props.shortWorkTime);
    setStatus('chilling');
  };

  const handleChillButton = () => {
    if (status === 'working')
      if (
        confirm(
          'Are you sure you want to skip into chilling? Timers will be reset!'
        )
      )
        return resetWork();
      else return;

    if (status === 'chilling') setPaused(!paused);
    else setPaused(false);

    setStatus('chilling');
  };

  const handleWorkButton = () => {
    if (status === 'chilling')
      if (
        confirm(
          'Are you sure you want to skip into working? Timers will be reset!'
        )
      )
        return resetChill();
      else return;

    if (status === 'working') setPaused(!paused);
    else setPaused(false);

    setStatus('working');
  };

  const checkChillTimeLeft = () => {
    // Checking against 1 to prevent state change delay from altering counters
    if (chillTime <= 1) {
      resetChill();
    }
  };

  const checkWorkTimeLeft = () => {
    // Checking against 1 to prevent state change delay from altering counters
    if (workTime <= 1) {
      resetWork();
    }
  };

  // Timer on tab is 1 second late when not paused, will try to fix eventually
  const updateTabTitle = () => {
    let title = 'Slowmodoro - a reverse Pomodoro';

    if (status === 'chilling') title = `Chilling - ${secondsToTime(chillTime)}`;
    else if (status === 'working')
      title = `Working - ${secondsToTime(workTime)}`;

    if (paused) title = `PAUSED | ${title}`;

    document.title = title;
  };

  useInterval(() => {
    if (!paused) {
      if (status === 'chilling') {
        setChillTime(chillTime - 1);
        setTotalChillingTime(totalChillingTime + 1);
        checkChillTimeLeft();
      }
      if (status === 'working') {
        setWorkTime(workTime - 1);
        setTotalWorkingTime(totalWorkingTime + 1);
        checkWorkTimeLeft();
      }
    }
    updateTabTitle();
  }, 1000);

  return (
    <>
      <div className={background} />
      <div className="pomodoro">
        <StatusLabel status={status} reversePomodoros={reversePomodoros} />
        <TimerSwitch status={status} times={times} />
        <Button
          status={status}
          onClick={handleChillButton}
          className={status === 'chilling' ? 'active chilling' : ''}
          paused={paused}
        >
          Chill
        </Button>
        <Button
          status={status}
          onClick={handleWorkButton}
          className={status === 'working' ? 'active working' : ''}
          paused={paused}
        >
          Work
        </Button>
        <Counters
          totalChillingTime={totalChillingTime}
          totalWorkingTime={totalWorkingTime}
          reversePomodoros={reversePomodoros}
        />
      </div>
    </>
  );
}

const setBackground = (status: Status, reversePomodoros: number) => {
  let background = 'background';

  if (status === 'chilling') background += ' chillBackground';
  else if (status === 'working') {
    if (reversePomodoros && reversePomodoros % 4 === 0)
      background += ' longWorkBackground';
    else background += ' shortWorkBackground';
  }
  return background;
};
