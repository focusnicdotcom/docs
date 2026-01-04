---
title: Linux File Permissions
description: Pengertian dan Tutorial Konfigurasi File Permission di Linux
sidebar_position: 103
sidebar_label: Linux File Permissions
---

Di Linux, setiap file dan direktori memiliki izin akses (permission) yang menentukan siapa yang boleh membaca, menulis, atau mengeksekusi file tersebut. 
Setiap file atau directory memiliki tiga tingkat kepemilikan:
-   User owner (**u**).
-   Group owner (**g**).
-   Others (**o**).

Setiap tingkat kepemilikan dapat diberi izin berikut:
-   Read (**r**).
-   Write (**w**).
-   Execute (**x**).

## Cara Cek Permission
Gunakan perintah berikut:
```
ls -l
```
Contoh output:
```
-rwxr-xr--  1 user1 admin  1234 Jul  2 08:00 script.sh
```
Penjelasan kolom pertama `-rwxr-xr--`:

|Karakter| Arti |
|--|--|
| `-` | Tipe: `-` (file biasa), `d` (directory), `l` (symlink), dsb |
| `rwx` | Owner: read, write, execute |
|`r-x` | Group: read, no write, execute |
| `r--` | Others: read only |

Anda juga bisa menggunakan perintah `stat` sebagai berikut dengan hasil yang lebih lengkap:
```
stat anaconda-ks.cfg 
```
Contoh output:
```jsx showLineNumbers
  File: anaconda-ks.cfg
  Size: 1326            Blocks: 8          IO Block: 4096   regular file
Device: fd00h/64768d    Inode: 33575044    Links: 1
Access: (0600/-rw-------)  Uid: (    0/    root)   Gid: (    0/    root)
Context: system_u:object_r:admin_home_t:s0
Access: 2025-06-28 01:09:22.473000000 +0700
Modify: 2025-06-28 01:09:22.606000000 +0700
Change: 2025-06-28 01:09:22.606000000 +0700
 Birth: 2025-06-28 01:09:22.473000000 +0700
```
## Cara Mengubah Permission
### Menggunakan Simbol
Tambahkan permission execute ke user (owner).
```
chmod u+x script.sh
```
Simbol:

- `u` = user (owner)

- `g` = group

- `o` = others

- `a` = all (u+g+o)

Operasi:

- `+` = tambah izin

- `-` = hapus izin

- `=` = set izin secara eksplisit

Contoh:
```
chmod g-w file.txt     # Hapus izin write untuk group
chmod o=rx file.txt    # Set others hanya bisa read dan execute
```
### Menggunakan Angka
Format: `chmod XYZ nama_file`
Setiap kategori (user, group, other) diwakili oleh 1 digit:

| Angka | Izin |
|--|--|
| 0 | `---` |
| 1 | `--x` |
| 2 | `-w-` |
| 3 | `-wx` |
| 4 | `r--` |
| 5 | `r-x` |
| 6 | `rw-` |
| 7 | `rwx` |

Contoh:
```
chmod 755 script.sh   # rwx untuk user, rx untuk group & others
chmod 644 file.txt    # rw- untuk user, r-- untuk group & others
```
## Mengubah Owner dan Group
Mengganti pemilik file:
```
chown username file.txt
```
Mengganti pemilik file dan group:
```
chown user:group file.txt
```
Ganti hanya group;
```
chgrp groupname file.txt
```

## Default Permission
Direktori biasanya menggunakan `755` 
```
chmod 755 /var/www
```
File menggunakan `644`
```
chmod 644 file.txt
```

Berikut permission yang biasanya digunakan:
| Tujuan | Arti |
|--|--|
| Script hanya bisa dijalankan oleh pemilik | `chmod 700 script.sh` |
| File bisa dibaca semua, tapi hanya owner bisa edit | `chmod 644 file.txt` |
| Direktori bisa diakses semua orang, hanya owner bisa ubah isi | `chmod 755 /data/public` |
| Script `.sh` wajib ada execute | `chmod +x script.sh` |
