// Initialize EmailJS after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    emailjs.init("9wMXceQxVythTJclm"); // Replace with your Public Key
    console.log("EmailJS Initialized"); // Debugging
});

// Attach an event listener to the signup form
document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Retrieve user inputs
    const userName = document.getElementById("name").value;
    const userEmail = document.getElementById("email").value;

    // Generate and send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    sendOtpEmail(userName, userEmail, otpCode);
});

// Function to send OTP email
function sendOtpEmail(userName, userEmail, otpCode) {
    localStorage.setItem("email_otp", otpCode); // Store OTP temporarily

    const serviceID = "service_n15ae6q";
    const otpTemplateID = "template_2em5e1i";

    const templateParams = {
        to_name: userName,
        otp: otpCode,
        to_email: userEmail
    };

    emailjs.send(serviceID, otpTemplateID, templateParams)
        .then(response => {
            console.log("OTP Email Sent:", response);
            alert("OTP Sent! Check your email.");
        })
        .catch(error => {
            console.error("Error sending OTP email:", error);
            displayErrorMessage("Error sending OTP. Please try again.");
        });
}

// Function to verify OTP and then store user data
function verifyOTP(event) {
    event.preventDefault();

    let enteredOtp = document.getElementById("otp").value;
    let storedOtp = localStorage.getItem("email_otp");

    if (enteredOtp === storedOtp.toString()) {
        alert("OTP Verified! Signup Successful.");
        
        // Store user details for login verification later
        const userName = document.getElementById("name").value;
        const userEmail = document.getElementById("email").value;
        const userPassword = document.getElementById("password").value;

        let userData = {
            name: userName,
            email: userEmail,
            password: userPassword
        };
        
        localStorage.setItem("user", JSON.stringify(userData));

        localStorage.removeItem("email_otp"); // Clear OTP after verification

        // Redirect to login page after signup
        window.location.href = "login.html"; 
    } else {
        alert("Invalid OTP. Try again.");
    }
}

// Function to send the confirmation email after OTP verification
function sendConfirmationEmail() {
    const userName = document.getElementById("name").value;
    const userEmail = document.getElementById("email").value;

    const serviceID = "service_n15ae6q";
    const confirmationTemplateID = "template_v7rk1qw";

    const templateParams = {
        name: userName,
        email: userEmail
    };

    emailjs.send(serviceID, confirmationTemplateID, templateParams)
        .then(response => {
            console.log("Confirmation Email Sent:", response);
            displaySuccessMessage("Signup successful! Confirmation email sent.");
            document.getElementById("signup-form").reset();
        })
        .catch(error => {
            console.error("Error sending confirmation email:", error);
            displayErrorMessage("Error sending confirmation email. Please try again.");
        });
}

// Function to display success messages
function displaySuccessMessage(message) {
    const successMessageElement = document.getElementById("success-message");
    successMessageElement.innerText = message;
    successMessageElement.style.display = "block";
}

// Function to display error messages
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById("error-message");
    errorMessageElement.innerText = message;
    errorMessageElement.style.display = "block";
}
