const eventSubscriptions = new Map();
export const when = (event, callback) => {
    return _registerListener(event, callback);
};
const _registerListener = (event, callback) => {
    if (!eventSubscriptions.has(event)) {
        eventSubscriptions.set(event, []);
    }
    const subscriptions = eventSubscriptions.get(event);
    const index = subscriptions.length;
    subscriptions.push(callback);
    return {
        remove: () => {
            delete subscriptions[index];
            if (subscriptions.length < 1) {
                eventSubscriptions.delete(event);
            }
        }
    };
};
export const Fire = (event, data) => {
    if (eventSubscriptions.has(event)) {
        dispatch(eventSubscriptions.get(event), data);
    }
};
const dispatch = (subscriptions, data) => {
    if (subscriptions) {
        for (const callback of subscriptions) {
            callback((data != undefined) ? data : {});
        }
    }
};
export const Event = {
    ButtonTouched: 'ButtonTouched',
    DieTouched: 'DieTouched',
    HidePopup: 'HidePopup',
    PeerDisconnected: 'PeerDisconnected',
    PeerInitialize: 'PeerInitialize',
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
