---
title: Linux File Permissions
description: Tutorial on Configuring File Permissions in Linux
sidebar_position: 103
sidebar_label: Linux File Permissions
---

In Linux, every file and directory has permissions that determine who can read, write, or execute the file.
Each file or directory has three levels of ownership:
-   User owner (**u**).
-   Group owner (**g**).
-   Others (**o**).

Each ownership level can be assigned the following permissions:
-   Read (**r**).
-   Write (**w**).
-   Execute (**x**).

## How to check permissions
Use the following command:
```
ls -l
```
Sample output:
```
-rwxr-xr--  1 user1 admin  1234 Jul  2 08:00 script.sh
```
Explanation of the first column `-rwxr-xr--`:

|Character| Meaning
|--|--|
| `-` | Type: `-` (regular file), `d` (directory), `l` (symlink), etc |
| `rwx` | Owner: read, write, execute |
|`r-x` | Group: read, no write, execute |
| `r--` | Others: read only |

You can also use the `stat` command as follows with more complete results:
```
stat anaconda-ks.cfg 
```
Sample output:
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
## How to Change Permissions
### Using Symbols
Add execute permission to the user (owner).
```
chmod u+x script.sh
```
Symbols:

- `u` = user (owner)

- `g` = group

- `o` = others

- `a` = all (u+g+o)

Operation:

- `+` = tambah izin

- `-` = hapus izin

- `=` = set izin secara eksplisit

Sample:
```
chmod g-w file.txt     # Clear group write permissions
chmod o=rx file.txt    # Set others can only read and execute
```
### Using Numeric
Format: `chmod XYZ nama_file`
Each category (user, group, other) is represented by 1 digit:

| Numbers | Permissions |
|--|--|
| 0 | `---` |
| 1 | `--x` |
| 2 | `-w-` |
| 3 | `-wx` |
| 4 | `r--` |
| 5 | `r-x` |
| 6 | `rw-` |
| 7 | `rwx` |

Sample:
```
chmod 755 script.sh   # rwx for user, rx for group & others
chmod 644 file.txt    # rw- for user, r-- for group & others
```
## Change Owner and Group
Change the owner of the file:
```
chown username file.txt
```
Change the owner of files and groups:
```
chown user:group file.txt
```
Change only the group;
```
chgrp groupname file.txt
```

## Default Permission
Directories usually use `755`
```
chmod 755 /var/www
```
Files using `644`
```
chmod 644 file.txt
```

The following permissions are commonly used:
| Purpose | Meaning
|--|--|
| Scripts can only be run by the owner | `chmod 700 script.sh` |
| The file can be read by all, but only the owner can edit | `chmod 644 file.txt` |
| Directory accessible to everyone, only owner can change contents | `chmod 755 /data/public` |
| Script `.sh` must execute | `chmod +x script.sh` |
