import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/authRoutes.js';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', authRoutes);  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
