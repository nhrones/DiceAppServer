
//TODO fix - get from deno.env
export const DEBUG = true;

export const ICEconfiguration = {
    iceServers: [{
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302"
            ]
        }]
};
export const LabelState = {
    Normal: 0,
    Hovered: 1,
    HoveredOwned: 2,
    Reset: 3
};
