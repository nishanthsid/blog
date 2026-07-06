---
title: Hello World
description: Building and booting the first UEFI application.
---

# Hello World

Before writing an operating system, we need a way to get our code running on bare metal (or a virtual machine).

Modern x86-64 systems no longer boot the way they did in the BIOS era. Instead, they start in **UEFI** (Unified Extensible Firmware Interface). Rather than writing a boot sector in assembly, we can simply write a normal program that the firmware understands.

This page documents the journey from an empty C file to a working **Hello World** UEFI application.

---

# Why UEFI?

When the machine powers on, the firmware is responsible for initializing the hardware.

Historically this was the BIOS. Modern systems use UEFI.

Instead of loading the first 512 bytes of a disk (the Master Boot Record), UEFI looks for an executable inside the **EFI System Partition (ESP)**.

For x86-64, the default boot path is

```
EFI/BOOT/BOOTX64.EFI
```

If this file exists, UEFI loads it into memory and executes it.

This means we can write a normal C program instead of hand-writing a boot sector.

---

# Why not GRUB?

Eventually we'll write our own bootloader.

Using GRUB hides many details such as

- Loading ELF files
- Setting up memory
- Reading the firmware memory map
- Exiting Boot Services

Understanding these ourselves makes the rest of kernel development much clearer.

---

# What is gnu-efi?

UEFI applications are not normal Linux programs.

There is

- no libc
- no `printf`
- no `main()`
- no Linux kernel underneath

The firmware provides its own API.

`gnu-efi` is a small library that makes writing UEFI applications in C easier.

It provides

- UEFI headers
- helper macros
- startup code
- linker script
- wrapper functions such as

```c
Print(L"Hello World\n");
```

instead of manually calling firmware protocols.

---

# Project Structure

```
.
├── build/
├── esp/
│   └── EFI/
│       └── BOOT/
│           └── BOOTX64.EFI
├── src/
│   └── main.c
└── build.sh
```

The `esp` directory acts as our EFI System Partition.

QEMU exposes this directory to the firmware.

---

# Our First Program

```c
#include <efi.h>
#include <efilib.h>

EFI_STATUS efi_main(EFI_HANDLE ImageHandle,
                    EFI_SYSTEM_TABLE *SystemTable)
{
    InitializeLib(ImageHandle, SystemTable);

    Print(L"Hello World!\n");

    return EFI_SUCCESS;
}
```

Unlike a normal C program,

```c
int main()
```

becomes

```c
EFI_STATUS efi_main(...)
```

because this is the entry point expected by the firmware.

---

# Compiling

Our compile command looked something like

```bash
gcc \
-fpic \
-fshort-wchar \
-ffreestanding \
-fno-stack-protector \
-mno-red-zone \
-I/usr/include/efi \
-I/usr/include/efi/x86_64
```

Let's understand every flag.

## `-fpic`

Generate Position Independent Code.

UEFI is free to load the executable almost anywhere in memory.

The code therefore shouldn't assume fixed addresses.

---

## `-fshort-wchar`

Makes

```c
wchar_t
```

16 bits instead of the Linux default.

UEFI strings are UTF-16.

Without this flag,

```c
L"Hello"
```

would have the wrong representation.

---

## `-ffreestanding`

Tell GCC that we're **not** compiling for a hosted environment.

There is

- no operating system
- no libc
- no assumptions about standard startup code

We're responsible for everything.

---

## `-fno-stack-protector`

Disable stack canaries.

Normally GCC inserts checks to detect stack smashing.

Those checks rely on runtime support that doesn't exist inside UEFI.

---

## `-mno-red-zone`

Disable the x86-64 red zone.

Linux allows functions to use 128 bytes below the stack pointer.

Firmware and interrupt handlers don't necessarily respect this convention.

Kernel and firmware code therefore disable the red zone.

---

# Linking

We linked using

```bash
ld
```

instead of letting GCC perform the final link.

This gives us full control over the resulting executable.

Important options included

```bash
-shared
```

Creates a shared object.

UEFI applications are loaded similarly to shared libraries.

---

```bash
-T elf_x86_64_efi.lds
```

Uses the linker script provided by `gnu-efi`.

This script lays out the sections exactly as expected by UEFI.

---

```bash
crt0-efi-x86_64.o
```

Startup code.

Before our `efi_main()` runs, some initialization needs to happen.

This object file performs that work.

---

```bash
-lefi
-lgnuefi
```

Links against the UEFI helper libraries.

---

# Why objcopy?

The linker first produces an ELF file.

UEFI does **not** execute ELF files.

It expects a **PE32+** executable (the same executable format used by Windows).

`objcopy` converts the ELF output into a valid EFI executable.

Conceptually,

```
ELF
    ↓
objcopy
    ↓
BOOTX64.EFI
```

---

# Running in QEMU

Instead of testing on real hardware, we use

- QEMU
- OVMF

QEMU emulates the machine.

OVMF is an open-source implementation of UEFI firmware.

When QEMU starts,

```
OVMF
    ↓
looks for

EFI/BOOT/BOOTX64.EFI

    ↓
loads it

    ↓
calls efi_main()
```

If everything is correct,

```
Hello World!
```

appears on the firmware console.

---

# What We've Learned

By this point we know

- Why UEFI replaced BIOS
- What an EFI application is
- Why `gnu-efi` exists
- How a UEFI application is compiled
- Why special compiler flags are required
- Why linking differs from normal applications
- Why `objcopy` is needed
- How QEMU and OVMF execute our program

Although all we've printed is "Hello World", we now have a working path from source code to firmware execution.

The next step is to stop relying on the firmware to load our code and instead write our own bootloader that loads an ELF kernel.

---

```
This page is incomplete and generated by AI for testing purposes only
```