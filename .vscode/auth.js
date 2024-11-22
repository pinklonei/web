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

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Đăng nhập
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Lấy thông tin người dùng từ backend (tuỳ chọn, nếu cần)
                    fetch(`/api/user/current?userId=${user.uid}`)
                        .then(response => response.json())
                        .then(userData => {
                            // Lưu thông tin vào localStorage
                            localStorage.setItem("userData", JSON.stringify(userData));
                            console.log("Thông tin người dùng lưu vào localStorage:", userData);

                            // Chuyển hướng đến profile.html
                            window.location.href = "profile.html";
                        })
                        .catch(err => {
                            console.warn("Không thể lấy thông tin từ backend:", err);
                            // Chuyển hướng đến profile.html dù không có dữ liệu backend
                            window.location.href = "profile.html";
                        });
                })
                .catch((error) => {
                    console.error("Đăng nhập lỗi:", error);
                    alert("Email hoặc mật khẩu không đúng: " + error.message);
                });
        });
    }

    // Đăng ký
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Lưu thông tin người dùng mới vào backend
                    const newUser = {
                        userId: user.uid,
                        email: user.email,
                        name: "Người dùng mới", // Có thể cập nhật trong profile
                        birthday: null,
                        gender: null,
                        interest: null,
                        photos: []
                    };

                    fetch('/api/user', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser)
                    })
                        .then(() => {
                            alert("Đăng ký thành công! Hãy đăng nhập.");
                            window.location.href = "login.html";
                        })
                        .catch(err => {
                            console.error("Lỗi khi lưu thông tin người dùng vào backend:", err);
                            alert("Đăng ký thành công nhưng không thể lưu thông tin. Vui lòng liên hệ hỗ trợ.");
                        });
                })
                .catch((error) => {
                    console.error("Đăng ký lỗi:", error);
                    alert("Đăng ký thất bại: " + error.message);
                });
        });
    }
});
