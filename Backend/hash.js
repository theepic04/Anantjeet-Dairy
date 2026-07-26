const bcrypt = require("bcrypt");

const password = "admin123";

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Hashed Password:");
    console.log(hash);
});