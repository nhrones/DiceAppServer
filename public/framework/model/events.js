const topicSubscriptions = new Map();
export const ON = (topic, callback) => {
    return _registerListener(topic, callback);
};
const _registerListener = (topic, callback) => {
    if (!topicSubscriptions.has(topic)) {
        topicSubscriptions.set(topic, []);
    }
    const subscriptions = topicSubscriptions.get(topic);
    const index = subscriptions.length;
    subscriptions.push(callback);
    return {
        remove: () => {
            delete subscriptions[index];
            if (subscriptions.length < 1) {
                topicSubscriptions.delete(topic);
            }
        }
    };
};
export const Fire = (topic, data) => {
    if (topicSubscriptions.has(topic)) {
        _dispatch(topicSubscriptions.get(topic), data);
    }
};
const _dispatch = (subscriptions, data) => {
    if (subscriptions) {
        for (const callback of subscriptions) {
            callback((data != undefined) ? data : {});
        }
    }
};
export const Event = {
    ButtonTouched: 'ButtonTouched',
    CancelEdits: 'CancelEdits',
    DieTouched: 'DieTouched',
    HidePopup: 'HidePopup',
    PlayerNameUpdate: 'PlayerNameUpdate',
    PopupResetGame: 'PopupResetGame',
    ScoreButtonTouched: 'ScoreButtonTouched',
    ScoreElementResetTurn: 'ScoreElementResetTurn',
    ShowPopup: 'ShowPopup',
    UpdateButton: 'UpdateButton',
    UpdateDie: 'UpdateDie',
    UpdateLabel: 'UpdateLabel',
    UpdateScoreElement: 'UpdateScoreElement',
    UpdateTooltip: 'UpdateTooltip',
    ViewWasAdded: 'ViewWasAdded'
};
