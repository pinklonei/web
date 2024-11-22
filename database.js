const { Client } = require('pg');

// Tạo kết nối tới cơ sở dữ liệu
const client = new Client({
    host: 'localhost',      // Địa chỉ host của PostgreSQL
    user: 'postgres',       // Tên người dùng PostgreSQL
    password: '123456',  // Mật khẩu
    database: 'friend_finder', // Tên cơ sở dữ liệu
    port: 5433              // Cổng PostgreSQL (mặc định là 5432)
});

// Hàm kết nối và truy vấn
async function findNearbyUsers(currentUserId, longitude, latitude) {
    try {
        await client.connect();

        const query = `
            WITH current_location AS (
                SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326) AS geom
            )
            SELECT u.name, u.age, u.gender, u.interests, ST_Distance(l.geom, cl.geom) AS distance
            FROM users u
            JOIN locations l ON u.user_id = l.user_id
            JOIN current_location cl ON TRUE
            WHERE u.user_id != $3
              AND ST_DWithin(l.geom, cl.geom, 5000);  -- bán kính 5km
        `;

        // Thực hiện truy vấn với các tham số
        const res = await client.query(query, [longitude, latitude, currentUserId]);
        
        // In kết quả
        console.log("Nearby Users within 5km:", res.rows);
    } catch (err) {
        console.error("Error executing query", err.stack);
    } finally {
        await client.end();  // Đóng kết nối sau khi truy vấn xong
    }
}

// Sử dụng hàm với vị trí đăng nhập của người dùng
const currentUserId = 3;          // ID của người dùng đăng nhập
const longitude = 105.8342;        // Kinh độ vị trí đăng nhập
const latitude = 21.0278;          // Vĩ độ vị trí đăng nhập
findNearbyUsers(currentUserId, longitude, latitude);

