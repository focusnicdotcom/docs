---
title: SWAP
description: SWAP Tutorial and Configuration in Linux
sidebar_position: 102
sidebar_label: SWAP
---

Swap is an additional storage space in Linux systems that is used as **virtual memory** when the physical **RAM** capacity is exhausted. Swap can be a dedicated partition or
or swap file, and serves as a memory reserve that allows the system to keep running even if the memory load increases.

Although swap is much slower than RAM, it is very important in the following situations:

- Handling high memory loads when RAM is full.

- Provides spare space for background or idle processes.

- Prevents applications from crashing due to memory exhaustion.

- Supports the **hibernation** feature (if used).

On production servers, properly configured swap can improve **system stability**, but it must be used wisely because swap over disk (especially HDD) has a much slower read/write speed than RAM.

## Swap Check
Before doing swap configuration such as adding, deleting, or creating swaps, you should check first.<br/>
Method 1:
```
swapon --show
```
If swap is on, you will see output like this. If it is not active, there will be no output:
```
Filename                                Type            Size    Used    Priority
/dev/dm-1                               partition       4194300 0       -2
```
Method 2:
```
free -h
```
Output example:
```
              total        used        free      shared  buff/cache   available
Mem:          1.7Gi       178Mi       1.1Gi       8.0Mi       448Mi       1.4Gi
Swap:            0B          0B          0B
```
The `Swap:` line indicates the size and usage of the swap. If the value is `0` then there is no swap. <br/>
## Create SWAP File
Create a swap equal to 2x the total RAM, for example the current RAM is 2GB then the swap is made 4GB
```
fallocate -l 4G /swap
```

Adjust permission `0600` for security reasons
```
chmod 0600 /swap
```

Create swap
```
mkswap /swap
```

Activate swap
```
swapon /swap
```

Verify
```
swapon --show
```
Output example:
```
NAME  TYPE SIZE USED PRIO
/swap file   4G   0B   -2
```
Enable swap permanently on reboot
```
echo '/swap none swap sw 0 0' >> /etc/fstab
```

Verify:
```
cat /etc/fstab
```
## Increase Swap Size
:::info
It is assumed that the swap was created earlier with the swapfile `/swap`.
:::
Shut down the current swap and delete the swap file:
```
swapoff /swap
rm -rf /swap
```

Recreate the swap with a new size such as 6GB:
```
fallocate -l 6G /swap
chmod 0600 /swap
mkswap /swap
swapon /swap
```
Enable swap permanently on reboot
```
echo '/swap none swap sw 0 0' >> /etc/fstab
```
## Disable and Remove Swap Completely
```
swapoff /swap
sed -i '/\/swapfile/d' /etc/fstab
rm -f /swap
```

Verify:
```
swapon --show
cat /etc/fstab
```
## Swappiness
Swappiness is a parameter in the Linux kernel that determines how aggressively the system uses swap when RAM starts to fill up. This value influences the system's decision whether to keep data in RAM or move it to swap (virtual memory on disk).

| Value | Means                                                           |
| ----- | --------------------------------------------------------------- |
| `0`   | Use swap only if RAM is completely exhausted.                   |
| `10`  | Use as much RAM as possible, swap only when urgent.             |
| `60`  | Default in many distros - balanced between RAM and swap.        |
| `100` | Use swap as soon as possible, as if RAM and swap were equivalent. |

### How to check and configure swappiness

Check the current value:
```
cat /proc/sys/vm/swappiness
```
Change temporarily until the next reboot:
```
sysctl vm.swappiness=10
```
Permanently change and apply the configuration. `syctl -p` applies the settings immediately without rebooting:
```
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p
```
Verify after reloading the `sysctl` configuration and the output should show the value `10`.

## Flush Cache RAM
Linux automatically caches frequently used files, disks, and inodes into RAM. This cache is “use when necessary” and is not immediately emptied even if the application no longer needs the data. By dropping the cache, you force the system to dump the cache to free up RAM.

:::info
It is not recommended to run this regularly on production servers, as the cache helps improve performance. Clearing the cache too often can actually decrease performance (
all processes must re-access the disk).
:::

Run the following command:
```
sync; echo 1 > /proc/sys/vm/drop_caches && /sbin/swapoff -a && /sbin/swapon -a
```
Create an automation script to run this ram flush via a cron job:
```
nano /root/flush-cache.sh
```
Script content:
```jsx showLineNumbers title="/root/flush-cache.sh"
#!/bin/bash
sync; echo 1 > /proc/sys/vm/drop_caches && /sbin/swapoff -a && /sbin/swapon -a
echo "[ $(date) ] Cache & swap flushed" >> /var/log/flush-cache.log
```
Set permission:
```
chmod +x /root/flush-cache.sh
```
Then add it to Cron:
```
crontab -e
```
Add the following parameters to run the script every day at 02:00 AM:
```jsx showLineNumbers
0 2 * * * /root/flush-cache.sh
```
Check the logs:
```
cat /var/log/flush-memory.log
```
Output example:
```jsx showLineNumbers title="/var/log/flush-memory.log"
[ Thu Jul  3 09:02:18 PM WIB 2025 ] Cache & swap flushed
```
