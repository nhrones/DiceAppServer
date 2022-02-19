const DNA = {
    channelID: 0,
    memberID: 0,
    id: 0,
    status: 0,
    state: 0,
    context: 0,
};
const toBinary = (id, context) => {
    return Uint16Array.from([id >> 0, context >> 0]);
};
DNA.channelID = 2;
console.log(toBinary(DNA.id, DNA.context));
