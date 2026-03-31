import fs from 'fs';
import https from 'https';
import path from 'path';

const screens = [
  { name: '1_publico.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQzMjk0NzE0ZTdlMzRjNzlhNWRkZTgwNmU4MDUxNzc4EgsSBxDg6qHn5A0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MDM3MjYxOTg2Mzg1MTY3MjY5&filename=&opi=96797242' },
  { name: '2_fixture.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2VlMzdlOTBmM2ZiYTQ3ODRhMTQyNzFkNzcyM2U2OGY4EgsSBxDg6qHn5A0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MDM3MjYxOTg2Mzg1MTY3MjY5&filename=&opi=96797242' },
  { name: '3_dashboard.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzVkZGYzNjZjYzJjNDQwOTQ5NjI3ZDIyNGU5NmRlOTcyEgsSBxDg6qHn5A0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MDM3MjYxOTg2Mzg1MTY3MjY5&filename=&opi=96797242' },
  { name: '4_registro.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MzMzFkN2IzOTRjZTRjY2M4YjA1OGQxMjY5OGRiNGRhEgsSBxDg6qHn5A0YAZIBIwoKcHJvamVjdF9pZBIVQhM3MDM3MjYxOTg2Mzg1MTY3MjY5&filename=&opi=96797242' }
];

const dir = path.join(process.cwd(), 'stitch_html');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

screens.forEach(screen => {
  https.get(screen.url, (res) => {
    const filePath = path.join(dir, screen.name);
    const file = fs.createWriteStream(filePath);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`✅ Descargado: ${screen.name}`);
    });
  }).on('error', (err) => {
    console.error(`Error descargando ${screen.name}: `, err.message);
  });
});
