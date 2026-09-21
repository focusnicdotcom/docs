---
title: Node.js
description: Cara Install dan Menggunakan Nodejs pada Apache di AlmaLinux 8
sidebar_position: 11
sidebar_label: Node.js
---

Dalam dunia pengembangan aplikasi modern, **Node.js** telah menjadi salah satu teknologi paling populer karena kemampuannya menangani proses secara asinkron dan performa tinggi. Bagi kita yang menggunakan **Apache Web Server di AlmaLinux 8**, penting untuk mengetahui cara integrasi **Node.js** agar aplikasi dapat berjalan optimal, baik untuk kebutuhan produksi maupun pengujian. Panduan ini akan membahas **cara install Node.js di Apache Web Server pada AlmaLinux 8** secara **lengkap, rinci, dan mendalam**, termasuk konfigurasi proxy menggunakan **mod_proxy**, pengaturan firewall, hingga verifikasi deployment.

## Prerequisite

- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security
- Domain (opsional)

## Install Node.js
Sebelum menginstal Node.js, pastikan sistem AlmaLinux 8 Anda telah diperbarui dan siap untuk menerima paket baru. Silahkan update dan tambahkan repository `epel`:
:::info
EPEL (Extra Packages for Enterprise Linux) sangat penting untuk memastikan semua dependensi tambahan yang dibutuhkan dapat diakses.
:::
```
dnf update -y
dnf install epel-release -y
```

Untuk mendapatkan versi Node.js 22 dan NPM terbaru yang stabil, kita akan menggunakan repositori resmi dari NodeSource:
```
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
dnf install nodejs -y
```

Verifikasi:
```
node -v
npmv -v
```

Contoh output:
```
v22.17.1

10.9.2
```

## Virtualhost Apache untuk Nodejs

Karena Apache Web Server tidak bisa langsung menjalankan aplikasi Node.js, kita perlu mengkonfigurasikan `mod_proxy` untuk meneruskan permintaan dari port 80 ke aplikasi Node.js di port 3000 atau biasa disebut Apache sebagai Reverse Proxy untuk Node.js. Apabila belum menginstall Apache silahkan install menggunakan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```

Kemudian install module proxy yang diperlukan:
```
dnf install mod_proxy_html
```

Ijinkan port 80 dan 443 pada firewalld:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
Jika ingin mengakses aplikasi Node.js secara langsung di port 3000 (untuk keperluan development), buka juga port tersebut:
```
firewall-cmd --add-port=3000/tcp --permanent
firewall-cmd --reload
```

Buat virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Kemudian buat direktori standar yang umum digunakan ketika menggunakan virtualhost, meskipun sebenarnya aplikasi nodejs dapat di jalankan dimana saja. Hal ini cukup penting apabila mengelola project nodejs lebih dari satu dan untuk memudahkan manajemen:
```
mkdir -p /var/www/focusnic.biz.id/app1
```
Lalu buat file `hello.js` untuk menampilkan program sederhana:
```
nano /var/www/focusnic.biz.id/app1/hello.js
```
Isi skrip berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/app1/hello.js"
const http = require('http');
const os = require('os');
const exec = require('child_process').exec;

const port = 3000;

const requestHandler = (req, res) => {
  exec('npm -v', (err, npmVersion) => {
    if (err) npmVersion = 'Unable to fetch NPM version';

    const html = `
      <html>
        <head>
          <title>Info Server Node.js</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              background-color: #f8f9fa;
            }
            .card {
              background: #fff;
              padding: 20px;
              max-width: 600px;
              margin: auto;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              border-radius: 8px;
            }
            h2 { color: #343a40; }
            p { font-size: 1.1em; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Server Information</h2>
            <p><strong>Server Time </strong> ${new Date().toLocaleString()}</p>
            <p><strong>OS:</strong> ${os.type()} ${os.release()} (${os.platform()})</p>
            <p><strong>Node.js ver:</strong> ${process.version}</p>
            <p><strong>NPM ver:</strong> ${npmVersion.trim()}</p>
          </div>
        </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
};

const server = http.createServer(requestHandler);
server.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
```

Kemudian jalankan aplikasi tersebut:
```
cd /var/www/focusnic.biz.id/app1/
node hello.js
```

Berikut contoh ouput pada terminal:
:::info
Untuk keluar dari program atau menghentikan silahkan tekan keyboard `CTRL+C` lalu cek dengan perintah `ss -tulpn | grep 3000` jika masih ada silahkan kill PID dengan perintah `kill -9 $PID`.
:::

```
App running on http://localhost:3000
```

Berikut contoh output apabila diakses melalui browser `http://$NAMA_DOMAIN` <br/>
![](/img/almalinux8-nodejs.jpg)<br/>

## PM2

Untuk memastikan aplikasi Node.js tetap berjalan meskipun sistem di-restart, kita dapat menggunakan PM2, Process Manager Node.js:

Instal PM2 secara global:
```
npm install -g pm2
pm2 start hello.js --name helloapp
```

Berikut contoh outputnya:
```
[PM2] Spawning PM2 daemon with pm2_home=/root/.pm2
[PM2] PM2 Successfully daemonized
[PM2] Starting /var/www/focusnic.biz.id/app1/hello.js in fork_mode (1 instance)
[PM2] Done.
┌────┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name        │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ helloapp    │ default     │ N/A     │ fork    │ 173670   │ 0s     │ 0    │ online    │ 0%       │ 42.1mb   │ root     │ disabled │
└────┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

Simpan proses agar berjalan saat boot:

```
pm2 startup systemd
pm2 save
```

Gunakan `--watch` untuk autoreload saat file berubah (development saja):
```
pm2 start app.js --watch
```

Gunakan `--env` untuk menetapkan environment:
```
pm2 start app.js --env production
```

### PM2: Basic Operations

| No | Perintah | Fungsi | Contoh |
| --- | --- | --- | --- |
| 1 | `pm2 start <file> --name <nama>` | Menjalankan aplikasi Node.js dan memberi nama proses | `pm2 start app.js --name myapp` |
| 2 | `pm2 list` | Melihat semua proses yang dijalankan oleh PM2 | `pm2 list` |
| 3 | `pm2 show <nama>` | Melihat detail satu proses | `pm2 show myapp` |
| 4 | `pm2 stop <nama>` | Menghentikan aplikasi | `pm2 stop myapp` |
| 5 | `pm2 restart <nama>` | Merestart aplikasi | `pm2 restart myapp` |
| 6 | `pm2 delete <nama>` | Menghapus aplikasi dari daftar proses PM2 | `pm2 delete myapp` |
| 7 | `pm2 logs [nama]` | Melihat log output aplikasi | `pm2 logs myapp` |

### PM2: Advanced Operations

| No | Perintah | Fungsi | Contoh |
| --- | --- | --- | --- |
| 1 | `pm2 startup` | Membuat PM2 otomatis dijalankan saat boot | `pm2 startup` |
| 2 | `pm2 save` | Menyimpan proses saat ini agar dimuat ulang setelah reboot | `pm2 save` |
| 3 | `pm2 reload <nama>` | Reload aplikasi tanpa downtime (hot reload) | `pm2 reload myapp` |
| 4 | `pm2 start app.js -i max` | Menjalankan aplikasi dalam cluster mode (multi-core) | `pm2 start app.js -i max --name cluster-app` |
| 5 | `pm2 monit` | Monitoring real-time terhadap proses aplikasi | `pm2 monit` |
| 6 | `pm2 ecosystem` | Membuat template file konfigurasi `ecosystem.config.js` | `pm2 ecosystem` |
| 7 | `pm2 start ecosystem.config.js` | Menjalankan aplikasi dari file konfigurasi | `pm2 start ecosystem.config.js` |
| 8 | `pm2 deploy ecosystem.config.js <env> [command]` | Deploy otomatis via SSH (butuh konfigurasi `ecosystem.config.js`) | `pm2 deploy ecosystem.config.js production setup` |
| 9 | `pm2 resurrect` | Memulihkan proses yang tersimpan sebelumnya (setelah reboot atau crash) |  |

## NVM (Node Version Manager) (opsional)
Dengan menggunakan NVM kita dapat mengelola versi Nodejs lebih dari satu. Misalnya versi 18, 20, 22 dan seterusnya. Biasanya diinstal per user dalam satu environment atau satu server yang sama, sehingga memisahkan antara versi nodejs production dan development. 

Silahkan jalankan perintah berikut untuk menginstall NVM:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
```

Kemudian list versi Node.js dengan perintah berikut:
```
nvm list-remote
```

Kemudian install versi terbaru Node.js 22:
```
nvm install 22
```

Lalu set versi Node.js default:
```
nvm use 22
```

## Troubleshooting

1. node: command not found <br/>

Periksa dengan perintah `which node` atau `echo $PATH`. Jika pakai `NVM`, pastikan `nvm.sh` dieksekusi di `.bashrc`

2. Versi Node.js tidak sesuai <br/>

Gunakan NodeSource untuk versi terbaru: `curl -fsSL https://rpm.nodesource.com/setup_22.x`

3. npm: command not found <br/>

Gunakan `node -v` untuk cek versi. Jika versi terlalu tua, hapus dan install ulang Node.js dari NodeSource

4. nvm: command not found <br/>

Tambahkan ke `~/.bashrc` atau `~/.bash_profile`: `export NVM_DIR="$HOME/.nvm` dan `source ~/.nvm/nvm.sh`

5. Tidak bisa menggunakan Node.js dengan sudo <br/>

Hindari sudo jika menggunakan NVM. Jika butuh akses root, instal Node.js sistem-wide (via NodeSource)

6. PM2 does not recognize the node on reboot <br/>

Gunakan versi Node.js dari NodeSource untuk penggunaan production atau set `$PATH` manual dalam `systemd`

## Kesimpulan

Node.js dan NPM adalah fondasi utama untuk menjalankan aplikasi JavaScript sisi server. Di AlmaLinux 8, instalasi terbaik untuk production adalah menggunakan NodeSource, dan NVM hanya disarankan di development environment, karena fleksibel untuk mengganti versi Node.js. Gunakan PM2 untuk manajemen proses Node.js. 

Q: Apakah saya perlu menginstal Node.js dan NVM sekaligus? <br/>
A: Tidak. Gunakan salah satu:
- **Node.js dari NodeSource** → untuk **production**
- **NVM** → untuk **developer yang butuh multi versi Node.js**

Q: Bagaimana cara menghapus versi Node.js jika sudah terinstal?<br/>
A: 
- Jika diinstal dari dnf atau NodeSource: `dnf remove nodejs`
- Jika pakai NVM: `nvm uninstall $VER_NODEJS`

Q: Bagaimana cara mengganti versi Node.js dengan NVM? <br/>
A: Jalankan perintah berikut, misalnya ingin menggunakan `node v20`
```
nvm install 20
nvm use 20
```

Q: Kenapa Node.js tidak dikenali setelah reboot saat menggunakan PM2? <br/>
A: Karena NVM tidak global dan tidak dikenali oleh `systemd`. Solusinya:

- Jangan pakai NVM di production
- Gunakan Node.js dari NodeSource
- Atau set PATH secara eksplisit di unit file `systemd`

Q: Apakah saya harus jalankan aplikasi Node.js dengan root? <br/>
A: Tidak disarankan. Jalankan sebagai user biasa. Root hanya digunakan untuk instalasi dan konfigurasi sistem.
