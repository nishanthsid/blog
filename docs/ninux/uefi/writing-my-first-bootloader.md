# Writing my first bootloader

First of all, what are we going to achieve from this after document now that we have a basic understanding of UEFI?

The goal of this page is to give a formal introduction to the programmatic usage of UEFI and the details behind it.

---

## What is the job of a bootloader?

The job of a bootloader is simple. In this context, we can assume that a bootloader works in tandem with the firmware to load the kernel of an operating system into memory and formally hand over the entire machine to it.

---

## The term sounds scary, how do we even start writing meaningful bootloader code?

This is understandable, because bootloaders operate with very minimal support.

> **EVEN WITH UEFI**, bootloader code is nowhere near your `.exe` and ELF files when it comes to the support they get from the operating system.

So the code we write needs to be much closer to the machine and needs to be compiled in a different way.

If we don't understand how each component helps in the overall process, bootloader development will continue to look intimidating.

---

## Let's get our first UEFI application

The goal here is very simple.

Create a UEFI binary that can be executed by the firmware to print something to its console.

> Yep, UEFI provides you with a console for both input and output.

> **NOTE**
>
> All our UEFI code will be written in **C** using **GNU-EFI**.

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

### Let's start from the header files

```c
#include <efi.h>
#include <efilib.h>
```

Let's break down what these headers actually contain.

`efi.h` contains the definitions of the types used throughout UEFI programming. In other words, it allows us to use all the UEFI-related types in our program.

It also provides several useful macros. For now, let's focus only on the types and macros it provides. We'll understand why they are needed later in this document.

#### What even are UEFI types?

This is a good question.

UEFI defines its own set of data types so that code remains portable across different architectures and compiler implementations.

For example, `UINTN` represents an unsigned integer whose size is the same as the native pointer size of the architecture. On x86-64 systems, `UINTN` is 64 bits, making it equivalent to `uint64_t`.

##### But why create a definition for an already existing type?

Great question.

UEFI needs to work across many different systems. A system might be 32-bit, 64-bit, or use a completely different processor architecture.

These definitions abstract away architecture-specific details so that `UINTN` always represents "an unsigned integer with the size of a native pointer," regardless of the underlying platform.

##### How does `efi.h` know which architecture it is being compiled for?

Our source code doesn't explicitly know what architecture it is being compiled for.

Conceptually, `efi.h` contains conditional definitions similar to the following:

```c
#if current_architecture_is_32_bit
typedef <32-bit compatible type> UINTN;
#else
typedef <64-bit compatible type> UINTN;
#endif
```

##### But how does the preprocessor know whether the architecture is 32-bit or 64-bit?

Exactly.

The compiler provides the preprocessor with a number of predefined macros that describe the target architecture. The preprocessor can then use these macros to decide which parts of a header file should be included.

A simplified version of the real `efi.h` would look something like this:

```c
#ifdef __x86_64__
    typedef unsigned long long UINT64;
    typedef long long          INT64;

    typedef UINT64 UINTN;
    typedef INT64  INTN;
#else
    typedef unsigned int UINT32;
    typedef int          INT32;

    typedef UINT32 UINTN;
    typedef INT32  INTN;
#endif
```

Notice how `UINTN` changes depending on the target architecture.

##### Common compiler predefined architecture macros

| Architecture | Common predefined macros |
|--------------|--------------------------|
| x86-64 | `__x86_64__`, `_M_X64` (MSVC) |
| x86 (32-bit) | `__i386__`, `_M_IX86` |
| ARM64 (AArch64) | `__aarch64__`, `_M_ARM64` |
| ARM (32-bit) | `__arm__`, `_M_ARM` |
| RISC-V 64 | `__riscv`, `__riscv_xlen == 64` |
| RISC-V 32 | `__riscv`, `__riscv_xlen == 32` |
| PowerPC 64 | `__powerpc64__` |
| PowerPC 32 | `__powerpc__` |

##### Seeing these macros yourself

You can inspect these predefined macros yourself:

```bash
gcc -dM -E - < /dev/null # Seems scary in itself :)
```

This prints the complete set of predefined macros that GCC provides to the preprocessor.

For example, on an x86-64 machine, you may see entries like these:

```c
#define __DBL_MIN_EXP__ (-1021)
#define __UINT_LEAST16_MAX__ 0xffff
#define __FLT16_HAS_QUIET_NAN__ 1
#define __ATOMIC_ACQUIRE 2
#define __WCHAR_MAX__ 0x7fffffff
#define __FLT128_MAX_10_EXP__ 4932
#define __FLT_MIN__ 1.17549435082228750796873653722224568e-38F
#define __GCC_IEC_559_COMPLEX 2
#define __UINT_LEAST8_TYPE__ unsigned char

...
...
```


Now I believe I have given a simple introduction to `efi.h`, why it exists and how it eases our job with portability.


