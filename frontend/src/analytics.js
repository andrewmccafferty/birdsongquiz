import ReactGA from 'react-ga4';
const TRACKING_ID = "G-D9JD0TJP4G";

const initialiseGoogleAnalytics = () => {
    ReactGA.initialize(TRACKING_ID);
}

const sendPageViewEvent = (title) => {
    ReactGA.send({ hitType: "pageview", page: "/", title: title });
}

const sendEvent = (category, action, label) => {
    ReactGA.event({
            category,
            action,
            label,
        });
}
export { initialiseGoogleAnalytics, sendPageViewEvent, sendEvent }