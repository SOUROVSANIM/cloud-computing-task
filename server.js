const express = require('express');
const sql = require('./db'); // Assuming this exports using module.exports
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, './src/frontend')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './src/frontend/index.html'));
});




// 1. Generate n even numbers
app.get('/generate-even/:n', (req, res) => {
    const n = parseInt(req.params.n);
    const evens = [];
    for (let i = 2; evens.length < n; i += 2) {
        evens.push(i);
    }
    res.json({ evenNumbers: evens });
});

// 2. Multiply two matrices
app.post('/multiply-matrices', (req, res) => {
    const { A, B } = req.body;

    if (A[0].length !== B.length) {
        return res.status(400).send("Invalid matrix dimensions");
    }

    const result = A.map((row, i) =>
        B[0].map((_, j) =>
            row.reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0)
        )
    );

    res.json({ result });
});



// 4. Nth largest number
app.post('/nth-largest', (req, res) => {
    const { numbers, n } = req.body;
    const sorted = [...numbers].sort((a, b) => b - a);
    res.json({ nthLargest: sorted[n - 1] });
});

// ✅ Register
app.post('/register', async (req, res) => {
  const { username,email, password } = req.body
  console.log('Received body:', req.body); // Debug log
  if (!username || !password || !email) {
    return res.status(400).send('Username, password and email are required');
  }
 try {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hash successful, inserting...');
  await sql`INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${hashedPassword})`;
  res.status(201).send('User registered successfully');
} catch (err) {
  console.error('Registration failed:', err);
  res.status(400).send('Registration failed: ' + err.message);
}

})

// ✅ Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await sql`SELECT * FROM users WHERE username = ${username}`
    if (user.length === 0) return res.status(401).send('Invalid username')

    const isMatch = await bcrypt.compare(password, user[0].password)
    if (!isMatch) return res.status(401).send('Invalid password')

    res.send('Login successful')
  } catch (err) {
    res.status(500).send('Login error: ' + err.message)
  }
})

// Default route
app.get('/', (req, res) => {
    res.send('Cloud Computing API is running...');
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
