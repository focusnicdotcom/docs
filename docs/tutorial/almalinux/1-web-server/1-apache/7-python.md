---
title: Python
description: Cara Install dan Menggunakan Python pada Apache di AlmaLinux 8
sidebar_position: 7
sidebar_label: Python
---

Menjalankan aplikasi Python melalui **Apache Web Server di AlmaLinux 8** merupakan solusi populer bagi banyak system administrator dan web dev. Dengan memadukan kekuatan Python untuk pemrosesan back-end dan kestabilan Apache sebagai server HTTP, kita mendapatkan lingkungan produksi yang andal dan efisien.

Panduan ini akan membahas langkah demi langkah cara **menginstal Python di Apache pada sistem AlmaLinux 8**, menggunakan pendekatan berbasis `mod_wsgi`. Kami akan menguraikan setiap bagian proses, termasuk pemasangan dependensi, konfigurasi Apache, struktur proyek Python, dan tips optimasi produksi. Semua panduan disusun secara rinci dan terstruktur agar mudah diikuti.

## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security

## Install Python
Sebelum mulai, pastikan sistem Anda dalam kondisi terbaru. Jalankan perintah di bawah untuk memperbarui sistem:
```
dnf update -y 
dnf install epel-release -y
```
Setelah itu, pastikan Apache HTTP Server (httpd) telah terinstal. Apabila belum terinstall silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```
Izinkan port 80 dan 443 pada firewalld apabila menggunakannya:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

AlmaLinux 8 secara default menyertakan Python versi 3.x. Untuk memastikan Python terinstal dengan benar jalankan perintah berikut:
```
python3 --version
```
Berikut contoh outputnya:
```
Python 3.6.8
```
Jika belum terinstall, silahkan jalankan perintah berikut untuk menginstal Python 3:
```
dnf install python3 python3-pip -y
```
Untuk menjalankan aplikasi Python di bawah Apache, kita memerlukan modul `mod_wsgi`. Install menggunakan DNF:
```
dnf install python3-mod_wsgi -y
```
Kemudian restart Apache:
```
systemctl restart httpd
```

### Membuat Struktur Aplikasi Python Sederhana untuk Apache

Mari kita buat aplikasi Python sederhana bernama `myapp`. Direktori dan file akan ditempatkan di `/var/www/myapp`.
```
mkdir -p /var/www/myapp
cd /var/www/myapp
python3 -m venv venv
source venv/bin/activate
```
Buat file `myapp.wsgi` sebagai entry point:
```
nano myapp.wsgi
```
Isi skrip berikut:
```jsx showLineNumbers title="/var/www/myapp/myapp.wsgi"
def application(environ, start_response):
    status = '200 OK'
    output = b'Hello from Python running on Apache using mod_wsgi!'

    response_headers = [('Content-type', 'text/plain'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)

    return [output]
```
Sesuaikan permission:
```
chown -R apache:apache /var/www/myapp
```
Sekarang, kita perlu membuat file konfigurasi VirtualHost untuk aplikasi Python:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Isi parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id

    WSGIDaemonProcess myapp python-home=/var/www/myapp/venv python-path=/var/www/myapp
    WSGIScriptAlias / /var/www/myapp/myapp.wsgi

    <Directory /var/www/myapp>
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Buka `http://DOMAIN_ANDA` di browser untuk memastikan aplikasi Python berjalan dengan benar di Apache.
![](/img/almalinux8-python.jpg)<br/>

### Tips Keamanan dan Optimasi Python 

1. Gunakan Virtual Environment<br/>
Selalu jalankan aplikasi Python dalam lingkungan virtual `virtualenv` agar isolasi dependensi tetap terjaga.

2. Gunakan Pengguna Non-root<br/>
Pastikan file dan proses Apache tidak berjalan dengan user root. Gunakan chown untuk menetapkan kepemilikan:
```
chown -R apache:apache /var/www/myapp
```

3. Optimasi Performance<br/>
Gunakan `mod_wsgi` dalam mode daemon untuk aplikasi berskala besar. Anda dapat mengatur jumlah proses dan thread:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
WSGIDaemonProcess myapp processes=5 threads=15
```

4. Logging dan Monitoring<br/>
Aktifkan log error dan akses untuk memudahkan debugging.

## Troubleshooting

1. Internal Server Error<br/>
Periksa file log Apache di `/var/log/httpd/$NAMA_DOMAIN-error.log` untuk menemukan penyebab. Biasanya error karena permission atau salah penulisan di file WSGI.

2. Aplikasi Tidak Menjalankan Virtualenv<br/>
Pastikan path `python-home` dan `python-path` sesuai dengan direktori `venv`.

3. 403 Forbidden<br/>
Pastikan direktori `/var/www/myapp` memiliki permission read untuk user Apache.

## Kesimpulan
Menggabungkan **Apache Web Server dan Python di AlmaLinux 8** memberikan solusi web yang solid, aman, dan siap produksi. Dengan mengikuti langkah demi langkah di atas, kita dapat menjalankan aplikasi Python berbasis WSGI dengan kinerja optimal. Instalasi yang tepat, struktur direktori yang rapi, serta konfigurasi Apache yang benar akan memastikan kestabilan aplikasi dalam jangka panjang.

Jika Anda mencari mitra terpercaya untuk kebutuhan instalasi server Python, Django, atau Flask berbasis **AlmaLinux 8**, **jangan ragu untuk menghubungi Focusnic**. Kami siap membantu Anda membangun infrastruktur server yang cepat, aman, dan scalable.

Q: Apakah Python bisa dijalankan di Apache tanpa `mod_wsgi`?<br/>
A: Bisa, menggunakan alternatif seperti uWSGI + Nginx, namun untuk Apache disarankan tetap memakai mod_wsgi.

Q: Apakah saya harus menggunakan virtual environment?<br/>
A: Sangat disarankan. Ini menjaga proyek tetap modular dan tidak mengganggu Python system-wide.

Q: Bagaimana cara menambahkan aplikasi Flask atau Django?<br/>
A: Framework seperti Flask dan Django bisa dijalankan melalui WSGI. Anda hanya perlu menyesuaikan file .wsgi dan mengatur python-path.

Q: Bagaimana cara mematikan virtual environment?<br/>
A: Untuk mematikan virtual environment Python silahkan jalankan perintah berikut
```
deactivate
```
