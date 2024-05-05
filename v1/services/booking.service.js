

exports.timeToMinutes = (time) => {
    const [timeString, ampm] = time.split(" ");
    const [hours, minutes] = timeString.split(":").map(Number);
    const hour = hours === 12 ? 0 : hours;
    return hour * 60 + minutes + (ampm === "PM" ? 12 * 60 : 0);
}



