const express = require('express');
const axios = require('axios');
const app = express();

const JSONBLOB_URL = "https://jsonblob.com/api/jsonBlob/1413877719128793088";

// Ambil data email
async function getEmails() {
    const res = await axios.get(JSONBLOB_URL);
    return res.data || [];
}

// Update data email
async function updateEmails(data) {
    await axios.put(JSONBLOB_URL, data, {
        headers: { "Content-Type": "application/json" }
    });
}

// Endpoint add email lewat query
app.get('/add', async (req, res) => {
    try {
        const { email, time } = req.query;
        if (!email || !time) return res.status(400).send("Email & time required");

        let emails = await getEmails();
        const expireTime = Date.now() + parseInt(time) * 60 * 1000;

        emails.push({ email, expireTime });
        await updateEmails(emails);

        res.send({ status: "success", email, expireTime });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding email");
    }
});

// Fungsi hapus email expired
async function cleanupExpiredEmails() {
    try {
        let emails = await getEmails();
        const now = Date.now();
        const filtered = emails.filter(e => e.expireTime > now);
        if (filtered.length !== emails.length) {
            await updateEmails(filtered);
            console.log("Expired emails cleaned up");
        }
    } catch (err) {
        console.log("Cleanup error:", err.message);
    }
}

// Jalankan cleanup setiap 1 menit
setInterval(cleanupExpiredEmails, 60 * 1000);

app.listen(3000, () => console.log("Server running on port 3000"));
