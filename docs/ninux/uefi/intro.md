# UEFI and How Computers Boot

Now let's see what UEFI is, where it sits in the boot process, and why is it better than the older **BIOS** boot.

### First, let's understand how computers boot

The overall flow of how a computer boots is as follows.

![](assets/20260706_221746_boot_process.png)

In this diagram, you can see the flow of the boot process.

As soon as the power is turned on, a special software stored in non volatile storage in the motherboard, starts running.

This software is generally called **Firmware**.

The job of the firmware is varied but in the scope of this documentation, it can be assumed, its job as helping the OS boot.

This is where **our guy UEFI** and his elder brother **BIOS** come into picture. Let's explore how these firmware specifications help us boot an OS.

---

## BIOS

BIOS (Basic Input/Output System) was the older standard of firmware. It works with MBRs (Master Boot Records) in the disks.

Here is the basic high level flow of how BIOS starts:

> **Power on**
>
> ↓
>
> **CPU program counter points to the BIOS Flash storage**
>
> *(To be precise here, when a CPU resets, like when in reboots or when it starts executing, the CPU starts from the memory address in his reset vector)*
>
> ↓
>
> **BIOS gets executed by the CPU**
>
> *(It is awesome right, the CPU doesn't care if it is a Flash storage or DRAM, all it does is ask the memory bus, the byte in the memory address in his registers)*
>
> ↓
>
> **BIOS Reads the boot order from his NVRAM**
>
> *(Oooo, NVRAM, What is it? It is nothing but a fancy way of saying Non Volatile Random Access Memory, which may sound like an oxymoron, but no, RAM need not strictly be volatile, RAM is random access memory, it doesn't care if it volatile or not. In earlier days, BIOS used to have a CMOS RAM, instead of NVRAMs)*
>
> ↓
>
> **BIOS reads the first 512 bytes (MBR) from the first boot device (or the device that it takes if the previous devices fail)**
>
> *These 512 bytes are explained below in detail.*

---

### MBRs

The **512 Bytes** the BIOS reads is called the **Master Boot Record**.

The layout is as follows:

| Size | Purpose |
| :--- | :------ |
| **446 Bytes** | Bootloader Code (**Your Bootloader !!!**) |
| **64 Bytes** | Partition table (4 x 16 Bytes) |
| **2 Bytes** | Boot signature |

This **Boot signature** tells BIOS that this is indeed an MBR.

The **446-byte bootloader** is then executed by the CPU. Since **446 bytes** is far too small to load an operating system, this tiny bootloader usually loads a larger **second-stage bootloader**, which eventually loads the operating system.

---

### Where is the MBR placed in memory?

The BIOS loads the MBR into the memory location **0x7c00** and the bootloaders that are written for BIOS are expected to assume themselves starting from the same address.

---

### So what was the problem with BIOS?

BIOS traditionally booted from MBR-partitioned disks, which made MBR's limitations effectively BIOS limitations.

The first problem was that, MBR actually only supports 4 partition only in your drive.

Actually this is not strictly true in the case of Extended Boot Records (EBRs) in Extended partitions.

<details>

<summary><strong>Only if you want to know how Extended partitions solve 4 partition issue</strong></summary>

Extended Partitons are special type of Partition in the MBR partition scheme that has a partition table at the first sector, this first sector is called the Extended Boot Record (EBR).

The same Boot signature is present in the EBR as well.

The Bootloader can read this partition detail in the EBR to extend the MBR's partition limitation.

</details>

<br/>

<details>

<summary><strong>Can't BIOS read GPT partitioning (The newer standard)?</strong></summary>

The answer is, it can because the GPT partitioning still makes the first sector an MBR like one called protective MBR sector.

The bootloader might not have enough space so there would be a BIOS Boot partition (a small one), to accommodate a second-stage bootloader.

So BIOS can still boot from a GPT device as well, given if the arrangements are done.

</details>

In the case of BIOS, the bootloader needs to take care of switching the CPU modes, load the GDT, set up paging etc.

Basically the BIOS reads the sector and hands the control over the bootloader with minimal support and services.

There are multiple other limitations in this system, which are out of the scope of this document.

---

## UEFI (Unified Extensible Firmware Interface)

Now we have reached the actual star of the show, **UEFI**.

Before we start reading about him, let's understand the situation.

People started noticing the limitations of BIOS. BIOS would just read the first 512 bytes from MBR and execute the code in the bootloader section, that's it.

The bootloader had to heavylift mode changes, setting up GDT, paging, and services to let the kernel boot etc etc.

And Engineers were like,

> **BRO WE COULD DO BETTER.**

They wanted a firmware that eases the pain off of a poor boot loader.