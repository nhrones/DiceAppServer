export const ICEconfiguration = {
    iceServers: [{
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302"
            ]
        }]
};
export var sigMessage;
(function (sigMessage) {
    sigMessage[sigMessage["RegisterPlayer"] = 0] = "RegisterPlayer";
    sigMessage[sigMessage["RemovePlayer"] = 1] = "RemovePlayer";
    sigMessage[sigMessage["ResetGame"] = 2] = "ResetGame";
    sigMessage[sigMessage["ResetTurn"] = 3] = "ResetTurn";
    sigMessage[sigMessage["ShowPopup"] = 4] = "ShowPopup";
    sigMessage[sigMessage["UpdateRoll"] = 5] = "UpdateRoll";
    sigMessage[sigMessage["UpdateScore"] = 6] = "UpdateScore";
    sigMessage[sigMessage["UpdateDie"] = 7] = "UpdateDie";
    sigMessage[sigMessage["UpdatePlayers"] = 8] = "UpdatePlayers";
    sigMessage[sigMessage["SetID"] = 9] = "SetID";
    sigMessage[sigMessage["GameFull"] = 10] = "GameFull";
})(sigMessage || (sigMessage = {}));
export var rtcMessage;
(function (rtcMessage) {
    rtcMessage[rtcMessage["Bye"] = 11] = "Bye";
    rtcMessage[rtcMessage["RtcOffer"] = 12] = "RtcOffer";
    rtcMessage[rtcMessage["RtcAnswer"] = 13] = "RtcAnswer";
    rtcMessage[rtcMessage["candidate"] = 14] = "candidate";
    rtcMessage[rtcMessage["invitation"] = 15] = "invitation";
})(rtcMessage || (rtcMessage = {}));
export const LabelState = {
    Normal: 0,
    Hovered: 1,
    HoveredOwned: 2,
    Reset: 3
};
