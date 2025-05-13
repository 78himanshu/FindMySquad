import { hostGameData, joinGameData, gymBuddyData } from '../data/index.js';
import { DateTime } from "luxon";


export async function hasTimeConflict(userId, startDT, endDT) {

    console.log(">>", userId, startDT, endDT);
    const joinedGames = await joinGameData.getJoinedGamesByUser(userId);
    const hostedGames = await joinGameData.getHostedGamesByUser(userId);

    const hostedGyms = await gymBuddyData.getHostedSessionsByUser(userId);
    const memberGyms = await gymBuddyData.getJoinedSessionsByUser(userId);

    const events = [];

    const toDT = (iso) => DateTime.fromJSDate(new Date(iso)).toUTC();
    for (let g of [...joinedGames, ...hostedGames]) {
        events.push({
            start: toDT(g.startTime),
            end: toDT(g.endTime),
        });
    }
    for (let s of [...hostedGyms, ...memberGyms]) {
        const sStart = DateTime.fromISO(`${s.date}T${s.startTime}`, { zone: s.userTimeZone }).toUTC();
        const sEnd = DateTime.fromISO(`${s.date}T${s.endTime}`, { zone: s.userTimeZone }).toUTC();
        events.push({ start: sStart, end: sEnd });
    }

    for (let ev of events) {
        if (startDT < ev.end && endDT > ev.start) {
            return true;
        }
    }
    return false;
}
