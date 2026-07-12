const generatePassword = () => {

    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const number = "0123456789";
    const special = "@#$%&*!";

    const all = upper + lower + number + special;

    let password = "";

    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += number[Math.floor(Math.random() * number.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < 12; i++) {

        password += all[Math.floor(Math.random() * all.length)];

    }

    return password;

}

export default generatePassword;