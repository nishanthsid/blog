# Writing my first bootloader

First of all, what are we going to achieve from this after knowing some basics of how UEFI works?

The goal of this page is to give a formal introduction on the programmatic usage of UEFI and the details behind it.

---

## What is the job of a bootloader?

The job of a bootloader is simple, in this context we can simply assume the job of bootloader to be work in tandem with the firmware to load the kernel of an OS into memory and formally hand over the entire machine to it.

---

## The term sounds scary, how to even start writing meaningful bootloader code?

This is understandable, because bootloaders are something that operate with very minimal support.

> **EVEN WITH UEFI**, bootloader code is nowhere near your `.exe` and ELF files when it comes to the support they get from the OS.

So the code we write needs to be closer to the machine and needs to compiled in a different way.

If we don't understand how each thing helps in each process, bootloaders will keep scaring a lot of us.

---

## Let's get the "Hello World" UEFI program

The goal here is very simple.

Create a UEFI binary that can be executed by the firmware to print something to its console.

> Yep, UEFI provides you a console with input and output.

> **NOTE**
>
> All our UEFI code will be written in **C** with **GNU-EFI**.

```c
#include <efi.h>
#include <efilib.h>

EFI_STATUS EFIAPI efi_main(
    EFI_HANDLE ImageHandle,
    EFI_SYSTEM_TABLE *SystemTable
) {
    InitializeLib(ImageHandle, SystemTable);

    Print(L"Hello World!\n");

    while (1); // simple halt

    return EFI_SUCCESS;
}
```

---

## Umm, what is happening in this code?

Don't worry.

At first glance, almost every line here looks unfamiliar.

Unlike a normal C program, there is no `main()`, there is no `printf()`, and even the function signature looks completely different.

Let's break this program down one line at a time.

## Header sections

```c
#include <efi.h>
#include <efilib.h>
```

Let's breakdown what these headers actually have

**efi.h** has all the definitions of the `types` we use in UEFI programming.
what do we mean by that is that it allows us to use all the UEFI related types in our program

### What even are UEFI types?

This is a good question.

UEFI defines its own set of data types so that code remains portable across different architectures and compiler implementations.

For example, `UINTN` represents an unsigned integer whose size is the same as the native pointer size of the architecture. On x86_64 systems, `UINTN` is 64 bits, making it equivalent to `uint64_t`.


---

To be continued
