---
title: Ruby
description: Cara Install dan Menggunakan Ruby pada Apache di AlmaLinux 8
sidebar_position: 10
sidebar_label: Ruby
---

Dalam dunia pengembangan aplikasi web modern, **Ruby** adalah salah satu bahasa pemrograman yang sangat populer karena sintaksnya yang sederhana dan kemampuannya dalam membangun aplikasi yang cepat dan efisien. Untuk dapat menjalankan aplikasi Ruby secara optimal di lingkungan **Apache Web Server pada AlmaLinux 8**, diperlukan proses instalasi yang tepat dan konfigurasi yang matang. Panduan ini akan membahas secara **mendetail** setiap langkah untuk melakukan instalasi Ruby dan integrasinya dengan Apache, khususnya pada sistem operasi **AlmaLinux 8** yang stabil dan banyak digunakan di lingkungan server.


## Prerequisite
- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security

## Instalasi Ruby
Sebelum memulai proses instalasi, pastikan bahwa server telah diperbarui dan memiliki akses root atau pengguna dengan hak sudo, kemudian update dan install development tool yang diperlukan oleh rubby:
```
dnf update -y
dnf install -y curl gnupg2 gcc gcc-c++ make
```
Pastikan Apache sudah terinstall, jika belum jalankan perintah berikut untuk menginstall Apache:
```
dnf install httpd -y
systemctl enable --now httpd
```
Setelah Apache berjalan, pastikan port 80 dan 443 telah dibuka di firewall:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

### Install RVM (Ruby Version Manager)
Cara terbaik dan fleksibel untuk menginstal Ruby adalah dengan menggunakan RVM (Ruby Version Manager).

Jalankan perintah berikut untuk mengimport GPGP Key RVM:
```
gpg --keyserver keyserver.ubuntu.com --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
```
Berikut contoh outputnya:
```
gpg: directory '/root/.gnupg' created
gpg: keybox '/root/.gnupg/pubring.kbx' created
gpg: key 105BD0E739499BDB: 1 duplicate signature removed
gpg: /root/.gnupg/trustdb.gpg: trustdb created
gpg: key 105BD0E739499BDB: public key "Piotr Kuczynski <piotr.kuczynski@gmail.com>" imported
gpg: key 3804BB82D39DC0E3: public key "Michal Papis (RVM signing) <mpapis@gmail.com>" imported
gpg: Total number processed: 2
gpg:               imported: 2
```

Kemudian jalankan perintah untuk menginstall RVM:
```
curl -sSL https://get.rvm.io | bash -s stable
```
Contoh output proses instalasi:
```
Installing RVM to /usr/local/rvm/
Installation of RVM in /usr/local/rvm/ is almost complete:

  * First you need to add all users that will be using rvm to 'rvm' group,
    and logout - login again, anyone using rvm will be operating with `umask u=rwx,g=rwx,o=rx`.

  * To start using RVM you need to run `source /etc/profile.d/rvm.sh`
    in all your open shell windows, in rare cases you need to reopen all shell windows.
  * Please do NOT forget to add your users to the rvm group.
     The installer no longer auto-adds root or users to the rvm group. Admins must do this.
     Also, please note that group memberships are ONLY evaluated at login time.
     This means that users must log out then back in before group membership takes effect!
Thanks for installing RVM 🙏
Please consider donating to our open collective to help us maintain RVM.

👉  Donate: https://opencollective.com/rvm/donate
```

Kemudian aktifkan RVM:
```
source /etc/profile.d/rvm.sh
rvm reload
```

Kemudian list versi Ruby yang tersedia:
```
rvm list known
```

Setelah RVM terinstal, kita dapat dengan mudah memasang Ruby versi terbaru dengan menjalankan perintah berikut:
:::info
Dengan menggunakan RVM, kita dapat menginstall Ruby terbaru meskipun versi tidak ada dalam list. Kita hanya cukup menambahkan parameter berikut `ruby-$RUBY.VERSION`. Untuk mendownload Ruby terbaru silahkan cek website resmi berikut https://www.ruby-lang.org/en/downloads/.
:::

```
rvm install ruby-3.3.8
rvm use ruby-3.3.8 --default
```

Verifikasi:
```
ruby --version
```

Contoh output:
```
ruby 3.3.8 (2025-04-09 revision b200bad6cd) [x86_64-linux]
```

## Konfigurasi Virtualhost Ruby di Apache

Untuk menjalankan aplikasi Ruby di Apache, salah satu pendekatan yang umum digunakan adalah dengan **Phusion Passenger**. Passenger memungkinkan integrasi Ruby ke dalam Apache dengan performa yang sangat baik.

Tambahkan repositori Phusion Passenger:
```
dnf install -y epel-release
dnf config-manager --set-enabled powertools
curl --fail -sSL https://oss-binaries.phusionpassenger.com/yum/definitions/el-passenger.repo -o /etc/yum.repos.d/passenger.repo
dnf install -y mod_passenger
```

Kemudian restart Apache:
```
apachectl configtest
systemctl restart httpd
```

Cek versi Passenger:
```
passenger -v
```
Contoh output:
```
Phusion Passenger(R) 6.0.27
```
Verifikasi bahwa Passenger sudah aktif:
```
passenger-config validate-install
```

Contoh output:
```
What would you like to validate?
Use <space> to select.
If the menu doesn't display correctly, press '!'

 ‣ ⬢  Passenger itself
   ⬡  Apache

-------------------------------------------------------------------------

 * Checking whether this Passenger install is in PATH... ✓
 * Checking whether there are no other Passenger installations... ✓

Everything looks good. :-)
```

Verifikasi module Passenger
```
httpd -M | grep passenger
```

Contoh output:
```
passenger_module (shared)
```

Buat virtualhost berikut:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi dengan parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public
    PassengerAppRoot /var/www/focusnic.biz.id

    <Directory /var/www/focusnic.biz.id/public>
        Allow from all
        Options -MultiViews
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Kemudian buat direktori untuk Ruby:
```
mkdir -p /var/www/focusnic.biz.id/public
```

Simpan konfigurasi setelah melakukan perubahan:
```
systemctl restart httpd
```

### Buat Struktur Aplikasi Sederhana untuk Ruby
Passenger mengharuskan adanya `config.ru` dan folder `public/`. Struktur foldernya harus seperti ini:
```
/var/www/focusnic.biz.id/
├── config.ru
├── hello.rb
└── public/
    └── .htaccess (boleh kosong)
```
Buat script sederhana:
```
cd /var/www/focusnic.biz.id
touch public/.htaccess
nano hello.rb
```
Isi file `hello.rb` dengan skrip Ruby:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/hello.rb"
def system_info
  os_info = `uname -a`.strip
  current_time = Time.now.strftime("%Y-%m-%d %H:%M:%S")
  ruby_version = RUBY_VERSION
  passenger_version = PhusionPassenger::VERSION_STRING

  <<~HTML
    <html>
    <head><title>System Info</title></head>
    <body>
      <h1>System Information</h1>
      <p><strong>Operating system:</strong> #{os_info}</p>
      <p><strong>Date:</strong> #{current_time}</p>
      <p><strong>Ruby version:</strong> #{ruby_version}</p>
      <p><strong>Passenger version:</strong> #{passenger_version}</p>
    </body>
    </html>
  HTML
end
```

Kemudian buat file `config.ru`:
```
nano config.ru
```
Isi dengan parameter berikut:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/config.ru"
require './hello'

run lambda { |env|
  [200, { "Content-Type" => "text/html" }, [system_info]]
}
```

Sesuaikan permission:
```
chown -R apache:apache /var/www/focusnic.biz.id
```

Lalu restart Apache:
```
systemctl restart httpd
```

Buka browser dengan mengetik `http://$NAMA_DOMAIN`<br/>
![](/img/almalinux8-ruby.jpg)<br/>

### Perbedaan `.rb` dan `.ru` dalam Ruby

| Ekstensi | Kepanjangan / Artinya | Digunakan Untuk | Contoh |
| --- | --- | --- | --- |
| `.rb` | Ruby file | **Script Ruby biasa**, termasuk class, modul, CLI | `script.rb`, `hello.rb` |
| `.ru` | Rack Up | File konfigurasi utama aplikasi **Rack-based** seperti **Passenger**, **Puma**, **Unicorn**, dll. | `config.ru` |

### Mengapa Perlu Restart Apache Setelah Ubah `config.ru` atau file `.rb`?
Secara default, **Passenger dalam mode produksi (production mode)** ***tidak otomatis mendeteksi perubahan file***, karena alasan **performa dan efisiensi**.

Passenger **meng-cache aplikasi Ruby** saat pertama kali dimuat oleh Apache. Artinya:

- Ketika Apache pertama kali mengakses `config.ru`, seluruh environment Ruby di-*load*.
- Semua file `.rb` yang digunakan saat itu akan dimasukkan ke dalam memori.
- Perubahan pada file tidak dikenali kecuali Passenger **diinstruksikan untuk me-reload** aplikasi.

Anda bisa menjalankan perintah berikut untuk reload Passenger:
```
passenger-config restart-app
```

Passenger menyediakan cara graceful reload tanpa restart Apache: cukup buat atau file bernama `/tmp/restart.txt`
:::info
Berbeda dengan `passenger-config restart-app`, file `restart.txt` tidak langsung mengakibatkan aplikasi di reload. Passenger memeriksa perubahan timestamp waktu pada setiap permintaan, tetapi dengan tingkat pembatasan demi alasan kinerja.
:::
```
mkdir /var/www/focusnic.biz.id/tmp
touch /var/www/focusnic.biz.id/restart.txt
```

Selain file `restart.txt`, Passenger mempunyai magic file restart lainnya yang bernama `always_restart.txt`
:::info
Passenger juga mendukung magic file `tmp/always_restart.txt`. Jika file ini ada, Passenger akan memulai ulang aplikasi Anda setelah setiap permintaan. Dengan begitu, Anda tidak perlu sering-sering menjalankan perintah restart.
:::
```
mkdir /var/www/focusnic.biz.id/tmp
touch /var/www/focusnic.biz.id/always_restart.txt
```

## Troubleshooting

1. Aplikasi Tidak Tampil di Browser / Blank Page <br/>

Penyebabnya kemungkinan disebabkan oleh `config.ru` error, file tidak dimiliki oleh user `apache`, atau tidak menggunakan struktur folder yang benar `public` dan `config.ru`.

2. Passenger Tidak Terdeteksi / Tidak Jalan <br/>

Penyebabnya karena `mod_passenger` tidak dimuat atau belum terinstall. Cek module menggunakan perintah berikut:
```
httpd -M | grep passenger
```
Pastikan file ini ada:
```
/etc/httpd/conf.modules.d/10-passenger.conf
```
Restart Apache:
```
apachectl configtest
systemctl restart httpd
```

3. Perubahan `info.rb` atau `config.ru` Tidak Terlihat <br/>

Passenger menjalankan aplikasi dalam mode cache/produksi. Silahkan restart Apache:
```
apachectl configtest
systemctl restart httpd
```

5. Akses Ditolak / 403 Forbidden <br/>

Directory `public` belum diberikan akses yang tepat. Silahkan sesuaikan permission:
```
chmod -R 755 /var/www/focusnic.biz.id
chown -R apache:apache /var/www/focusnic.biz.id
```

## Kesimpulan

Proses instalasi dan konfigurasi **Ruby di Apache Web Server pada AlmaLinux 8** dengan **Passenger** memberikan platform kuat untuk menjalankan aplikasi Ruby dan Ruby on Rails dengan performa tinggi.

Q: Apakah harus selalu menggunakan `config.ru`? <br/>
A: Ya. Untuk menjalankan aplikasi Ruby dengan Passenger, file `config.ru` adalah standar Rack yang wajib digunakan sebagai entry point aplikasi.

Q: Bisakah menggunakan script `.rb` langsung tanpa `config.ru`? <br/>
A: Tidak langsung diakses via web. Script `.rb` harus dijalankan melalui `config.ru` menggunakan middleware Rack agar bisa di-serve oleh Passenger.

Q: Kenapa perlu folder `public/` walau kosong? <br/>
A: Passenger dan Apache mengharuskan folder `public/` sebagai `DocumentRoot`. File HTML statis atau `.htaccess` biasa juga diletakkan di sini jika diperlukan.

Q: Apakah bisa menambahkan SSL dan domain publik? <br/>
A: Tentu. Gunakan Let’s Encrypt atau sertifikat berbayar, dan arahkan domain ke IP server. Kemudian ubah konfigurasi virtual host ke port 443 dengan `SSLEngine on`.
