

exports.timeToMinutes = (time) => {
    const [timeString, ampm] = time.split(" ");
    const [hours, minutes] = timeString.split(":").map(Number);
    const hour = hours === 12 ? 0 : hours;
    return hour * 60 + minutes + (ampm === "PM" ? 12 * 60 : 0);
}



// Function to convert time to 24-hour format
//Not in use
exports.convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
};


exports.convertTo24Hour = (time12Hour) => {
    const [time, modifier] = time12Hour.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
}

//Not in use
exports.convertTo12Hour = (time) => {
    console.log('time:', time);
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
    return `${hour12}:${minute} ${period}`;
}


exports.generateTimeSlots = (slotStartTime, slotEndTime, newBookDuration, bookedSlots, bookingDate) => {
    const startTime = convertTo24Hour(slotStartTime);
    const endTime = convertTo24Hour(slotEndTime);
    const newBookDurationInMinutes = parseInt(newBookDuration, 10);

    console.log(`start:${slotStartTime}, end:${slotEndTime}, duration:${newBookDurationInMinutes}`);


    const slotStart = new Date(bookingDate + ' ' + startTime);
    const slotEnd = new Date(bookingDate + ' ' + endTime);
    //const slotDuration = newBookDurationInMinutes * 60000; // convert duration to milliseconds

    console.log(`slotStart:${slotStart}, slotEnd:${slotEnd}`);


    const slots = [];

    let currentSlot = slotStart;

    while (currentSlot < slotEnd) {
        let isAvailable = true;
        for (const bookedSlot of bookedSlots) {
            //const bookedStart = new Date(`2024-05-12T${convertTo24Hour(bookedSlot.start_time)}:00`);
            //const bookedEnd = new Date(`2024-05-12T${convertTo24Hour(bookedSlot.end_time)}:00`);
            const bookedStart = new Date(bookingDate + ' ' + convertTo24Hour(bookedSlot.start_time));
            const bookedEnd = new Date(bookingDate + ' ' + convertTo24Hour(bookedSlot.end_time));

            console.log(`bookedStart:${bookedStart}, bookedEnd:${bookedEnd}`);

            if (
                (currentSlot >= bookedStart && currentSlot < bookedEnd) ||
                (currentSlot < bookedStart && new Date(currentSlot.getTime() + newBookDurationInMinutes * 60000) > bookedStart)
            ) {
                isAvailable = false;
                break;
            }
        }
        if (isAvailable) {
            /*slots.push({
                start_time: convertTo12Hour(currentSlot.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
                end_time: convertTo12Hour(new Date(currentSlot.getTime() + newBookDurationInMinutes * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
                available: true
            });*/

            slots.push({
                start_time: currentSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                end_time: new Date(currentSlot.getTime() + newBookDurationInMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                available: true
            });
        }
        currentSlot = new Date(currentSlot.getTime() + newBookDurationInMinutes * 60000);
    }

    return slots;
}