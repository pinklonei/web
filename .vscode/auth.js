// Khởi tạo Firebase
const firebaseConfig = {
    apiKey: "AIzaSyALBIcXrhRUAn1P_ziKHPYZyzjLa0odAkg",
    authDomain: "datting-app-d11fc.firebaseapp.com",
    projectId: "datting-app-d11fc",
    storageBucket: "datting-app-d11fc.appspot.com",
    messagingSenderId: "305737059736",
    appId: "1:305737059736:web:8eac5a00e6dbd4004cafed",
    measurementId: "G-VM9X0LSRDC"
};

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized:", firebase.apps.length); // Kiểm tra khởi tạo Firebase
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Đăng nhập
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert("Đăng nhập thành công!");
                    window.location.href = "profile.html";
                })
                .catch((error) => {
                    console.error("Đăng nhập lỗi:", error);
                    alert("Email hoặc mật khẩu không đúng: " + error.message);
                });
        });
    }

    // Đăng ký
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert("Đăng ký thành công! Hãy đăng nhập.");
                    window.location.href = "login.html";
                })
                .catch((error) => {
                    console.error("Đăng ký lỗi:", error);
                    alert("Đăng ký thất bại: " + error.message);
                });
        });
    }
});
