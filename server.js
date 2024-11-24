const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Cho phép mọi nguồn gốc (thay đổi nếu cần thiết)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json({ limit: '10mb' })); // Tăng giới hạn payload JSON
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Cấu hình kết nối cơ sở dữ liệu PostgreSQL
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',           // Thay bằng tên người dùng PostgreSQL của bạn
    password: '123456',         // Thay bằng mật khẩu PostgreSQL của bạn
    database: 'friend_finder',  // Tên cơ sở dữ liệu của bạn
    port: 5433                  // Đảm bảo cổng này trùng với PostgreSQL
});

// Kiểm tra kết nối cơ sở dữ liệu
pool.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err);
    } else {
        console.log('Kết nối cơ sở dữ liệu thành công');
    }
});

// Endpoint lưu thông tin người dùng
app.post('/api/user', async (req, res) => {
    const { name, email, birthday, gender, interest, photos, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Vị trí không hợp lệ." });
    }

    try {
        const query = `
            INSERT INTO users (name, email, birthday, gender, interest, photos, latitude, longitude) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const values = [name, email, birthday, gender, interest, photos, latitude, longitude];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi khi lưu thông tin người dùng:", err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lưu thông tin người dùng.' });
    }
});

// Endpoint tìm người dùng gần đó
app.get('/api/nearby-users', async (req, res) => {
    const { lat, lng, userId } = req.query;

    if (!lat || !lng || !userId) {
        return res.status(400).json({ error: 'Vui lòng cung cấp thông tin vị trí và ID người dùng' });
    }

    try {
        const query = `
            SELECT u.name, u.email, u.gender, u.birthday, u.interest, u.photos, u.latitude, u.longitude,
                   ST_Distance(ST_SetSRID(ST_MakePoint($2, $1), 4326), ST_SetSRID(ST_MakePoint(u.longitude, u.latitude), 4326)) AS distance
            FROM users u
            WHERE u.user_id != $3
            ORDER BY distance ASC
            LIMIT 4
        `;

        const values = [parseFloat(lat), parseFloat(lng), parseInt(userId, 10)];
        console.log("Debug - Tham số truy vấn:", values);

        const result = await pool.query(query, values);
        console.log("Kết quả truy vấn người dùng gần đó:", result.rows);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu người dùng gần đó:', err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy dữ liệu người dùng gần đó' });
    }
});

// Endpoint cập nhật vị trí người dùng
app.post('/api/update-location', async (req, res) => {
    const { userId, lat, lng } = req.body;

    if (!userId || !lat || !lng) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    try {
        const query = `
            INSERT INTO locations (user_id, geom)
            VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
            ON CONFLICT (user_id)
            DO UPDATE SET geom = ST_SetSRID(ST_MakePoint($2, $3), 4326)
        `;

        const values = [parseInt(userId, 10), parseFloat(lng), parseFloat(lat)];
        console.log("Debug - Cập nhật vị trí:", values);

        await pool.query(query, values);

        res.status(200).json({ message: 'Cập nhật vị trí thành công' });
    } catch (err) {
        console.error('Lỗi khi cập nhật vị trí người dùng:', err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật vị trí' });
    }
});

// Phục vụ file tĩnh từ thư mục "public"
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint mặc định hiển thị file HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Khởi động server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
