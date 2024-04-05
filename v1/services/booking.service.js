// const Booking = require("../../models/Booking.model");



// exports.createBookingSlots = async (startTimeString, endTimeString, slotsCount, templeId, slotDurationInMinutes) => {

//     const startTime = parseTimeString(startTimeString);
    
//     let slots = []

//     for (let i = 0; i < slotsCount; i++) {
//         const newSlot = new Booking({
//             StartTime: startTimeString,
//             EndTime: endTimeString,
//             templeId: templeId,
//             date: new Date()
//         });
//         let slotData = await newSlot.save();
//         slots.push(slotData)
//         startTime.setTime(startTime.getTime() + slotDurationInMinutes * 60000);
//     }

//     console.log(`${slotsCount} booking slots created with a duration of ${slotDurationInMinutes} minutes.`);
//     return slots
// }


// function parseTimeString(timeString) {

//     const [time, period] = timeString.split(' ');
//     let [hours, minutes] = time.split(':');
//     if (period.toLowerCase() === 'pm') {
//         hours = parseInt(hours, 10) + 12;
//     }

//     const currentDate = new Date();
//     const parsedTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes);
//     return parsedTime;
// }
