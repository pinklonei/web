const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình kết nối với cơ sở dữ liệu PostgreSQL
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',           // Thay bằng tên người dùng PostgreSQL của bạn
    password: '123456',         // Thay bằng mật khẩu PostgreSQL của bạn
    database: 'friend_finder',  // Thay bằng tên cơ sở dữ liệu của bạn
    port: 5433                  // Đảm bảo cổng này trùng với cài đặt PostgreSQL của bạn
});

// Kiểm tra kết nối cơ sở dữ liệu
pool.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err);
    } else {
        console.log('Kết nối cơ sở dữ liệu thành công');
    }
});

// Endpoint để lưu thông tin người dùng
app.post('/api/user', async (req, res) => {
    const { name, email, birthday, gender, interest, photos } = req.body;

    try {
        const query = `
            INSERT INTO users (name, email, birthday, gender, interest, photos) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [name, email, birthday, gender, interest, photos];
        const result = await pool.query(query, values);
        
        // Trả về thông tin người dùng vừa lưu
        res.status(201).json(result.rows[0]);
        console.log("Thông tin người dùng đã lưu:", result.rows[0]);
    } catch (err) {
        console.error("Lỗi khi lưu thông tin người dùng:", err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lưu dữ liệu người dùng.' });
    }
});

// Endpoint để lấy thông tin người dùng hiện tại
app.get('/api/user/current', async (req, res) => {
    const { userId } = req.query;

    try {
        const query = `SELECT * FROM users WHERE user_id = $1`;
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng hiện tại:', err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy thông tin người dùng.' });
    }
});

// Endpoint để tìm người dùng gần đó
app.get('/api/nearby-users', async (req, res) => {
    const { lat, lng, userId } = req.query;

    try {
        const query = `
            SELECT u.name, u.email, u.gender, u.birthday, 
                   ST_Distance(l.geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
            FROM users u
            JOIN locations l ON u.user_id = l.user_id
            WHERE u.user_id != $3
              AND ST_DWithin(l.geom, ST_SetSRID(ST_MakePoint($1, $2), 4326), 5000)  -- bán kính 5km
            ORDER BY distance ASC  -- Sắp xếp theo khoảng cách gần nhất
        `;
        const values = [lng, lat, userId];
        const result = await pool.query(query, values);
        
        // Trả về danh sách người dùng gần đó
        res.status(200).json(result.rows);
        console.log("Người dùng gần đó:", result.rows);
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu người dùng gần đó:", err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy dữ liệu người dùng gần đó.' });
    }
});

// Endpoint để cập nhật vị trí người dùng
app.post('/api/update-location', async (req, res) => {
    const { userId, lat, lng } = req.body;

    try {
        const query = `
            INSERT INTO locations (user_id, geom)
            VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
            ON CONFLICT (user_id)
            DO UPDATE SET geom = ST_SetSRID(ST_MakePoint($2, $3), 4326)
            RETURNING *
        `;
        const values = [userId, lng, lat];
        const result = await pool.query(query, values);

        res.status(200).json(result.rows[0]);
        console.log("Cập nhật vị trí người dùng:", result.rows[0]);
    } catch (err) {
        console.error("Lỗi khi cập nhật vị trí người dùng:", err);
        res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật vị trí người dùng.' });
    }
});

// Cấu hình để Express phục vụ các file tĩnh (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint để hiển thị file HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'map.html'));
});

// Chạy server
app.listen(5000, () => {
    console.log('Server đang chạy trên cổng 5000');
});
