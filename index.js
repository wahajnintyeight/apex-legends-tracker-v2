/**
 * @format
 */
import {AppRegistry} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import {name as appName} from './app.json';
import {checkRotationAndNotify} from './src/notifications';

// Headless background task (Android) — runs the rotation check when the app is
// terminated but the OS wakes the background-fetch event.
const HeadlessTask = async (event: {taskId: string; timeout: boolean}) => {
  const {taskId, timeout} = event;
  if (timeout) {
    BackgroundFetch.finish(taskId);
    return;
  }
  try {
    await checkRotationAndNotify();
  } catch (e) {
    // swallow — never crash the headless task
  }
  BackgroundFetch.finish(taskId);
};

BackgroundFetch.registerHeadlessTask(HeadlessTask);

AppRegistry.registerComponent(appName, () => App);
