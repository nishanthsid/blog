# Writing my first bootloader using GNU-EFI

First of all, what are we going to achieve from this after document now that we have a basic understanding of UEFI?

The goal of this page is to give a formal introduction to the programmatic usage of UEFI and the details behind it.

---

## What is the job of a bootloader?

The job of a bootloader is simple.

In this context, we can assume that a bootloader works in tandem with the firmware to load the kernel of an operating system into memory and formally hand over the entire machine to it.

---

## The term sounds scary, how do we even start writing meaningful bootloader code?

This is understandable, because bootloaders operate with very minimal support.

> **EVEN WITH UEFI**, bootloader code is nowhere near your `.exe` and ELF files when it comes to the support they get from the operating system.

So the code we write needs to be much closer to the machine and needs to be compiled in a different way.

If we don't understand how each component helps in the overall process, bootloader development will continue to look intimidating.

---

# Let's get our first UEFI application

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

# Umm, what is happening in this code?

Don't worry.

At first glance, almost every line here looks unfamiliar.

Unlike a normal C program, there is no `main()`, there is no `printf()`, and even the function signature looks completely different.

Let's break this program down one line at a time.

---

## Let's start from the header file efi.h

```c
#include <efi.h>
```

Let's break down what this header actually contain.

`efi.h` contains the definitions of the types used throughout UEFI programming.

In other words, it allows us to use all the UEFI-related types in our program.

It also provides several useful macros.

For now, let's focus only on the types and macros it provides.

We'll understand why they are needed later in this document.

---

### What even are UEFI types?

This is a good question.

UEFI defines its own set of data types so that code remains portable across different architectures and compiler implementations.

For example, `UINTN` represents an unsigned integer whose size is the same as the native pointer size of the architecture.

On x86-64 systems, `UINTN` is 64 bits, making it equivalent to `uint64_t`.

---

### But why create a definition for an already existing type?

Great question.

UEFI needs to work across many different systems.

A system might be 32-bit, 64-bit, or use a completely different processor architecture.

These definitions abstract away architecture-specific details so that `UINTN` always represents "an unsigned integer with the size of a native pointer," regardless of the underlying platform.

---

### How does `efi.h` know which architecture it is being compiled for?

Our source code doesn't explicitly know what architecture it is being compiled for.

Conceptually, `efi.h` contains conditional definitions similar to the following:

```c
#if current_architecture_is_32_bit
typedef <32-bit compatible type> UINTN;
#else
typedef <64-bit compatible type> UINTN;
#endif
```

---

### But how does the preprocessor know whether the architecture is 32-bit or 64-bit?

Exactly.

The compiler provides the preprocessor with a number of predefined macros that describe the target architecture.

The preprocessor can then use these macros to decide which parts of a header file should be included.

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

---

### Common compiler predefined architecture macros

| Architecture | Common predefined macros |
| :----------- | :----------------------- |
| x86-64 | `__x86_64__`, `_M_X64` (MSVC) |
| x86 (32-bit) | `__i386__`, `_M_IX86` |
| ARM64 (AArch64) | `__aarch64__`, `_M_ARM64` |
| ARM (32-bit) | `__arm__`, `_M_ARM` |
| RISC-V 64 | `__riscv`, `__riscv_xlen == 64` |
| RISC-V 32 | `__riscv`, `__riscv_xlen == 32` |
| PowerPC 64 | `__powerpc64__` |
| PowerPC 32 | `__powerpc__` |

---

### Seeing these macros yourself

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

---
---

## The header efilib.h

```c
#include <efilib.h>
```

Now we have a good understanding of the reason why headers files are written they way they are. With this, let's continue understanding this header `efilib.h`

This header contains the declarations of the functions we use in our UEFI gnu-efi code such as `InitializeLib`, `Print`, `uefi_call_wrapper` etc. **Rather than trying to understand every function now, we'll introduce them one by one as they become relevant.**

## The line - EFI_STATUS EFIAPI efi_main(EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable)

This is where the most understanding might be needed from us. Every word in this line in our code is filled to brim with interesting information.

We'll dissect the code and understand each and every part of it one by one.

### EFI_STATUS

Remember our trusty `efi.h`. This type is defined in this header and this is in a way a  typedef used throughout UEFI to represent operation status. 

**EFI_STATUS** type is a numeric type under the hood whose primary objective is to store the **Status** of a UEFI operation.

`efi.h` also provides us a handy macro named `EFI_ERROR(EFI_STATUS)` to check if an EFI_STATUS variable is having an error code or not

Some values defined in `efi.h` for EFI_STATUS are `EFI_SUCCESS`, `EFI_NOT_FOUND`, `EFI_LOAD_ERROR` etc.

and the macro can be used something like this

```c
EFI_STATUS Status = EFI_LOAD_ERROR;

if(EFI_ERROR(Status)){
    Print(L"This is printed in the console");
}
```

### EFIAPI

This may feel odd to have another symbol between the type of a function and the function name

Like we are used to seeing function definitions like below
```c

// Many people are used to seeing functions defined like this
int add(int a, int b){
    return a + b;
}

// But this feels totally odd to have 2 seperate "things" before the function name

EFI_STATUS EFIAPI efi_main(...)
```

This is completely understandable and there is an interesting concept hiding behind it

Our guy `efi.h` plays a role here as well. `EFIAPI` is just a macro defined there that resolved into as follows

```c
#define EFIAPI __attribute__((ms_abi))
```

#### But what is this __attribute__((ms_abi))

A lot of things are happening here. Let's clear them one by one

This single macro is using multiple cool concepts of our compiler and the ABI (Application Binary Interface) itself.

First let's understand this really cool and interesting concept called __attribute__ in gcc.

This __attribute__ allows us to attach specific information about our functions, variables, structures to the compiler. The compiler then uses this attached information to compile the code accordingly

One cool __attribute__ I found very interesting are the `constructor` and `destructor` compiler attributes.

When attached, `constructor` functions get automatically called even before your `main` is run. This is really useful to initialize your libraries.

Similarly, functions attached with `destructor` runs after you main returns and it is useful for any cleanup that might be needed.

Example:

```c
#include <stdio.h>

void __attribute__((constructor)) init(){
    printf("Hi from constructor\n");
}

void __attribute__((destructor)) cleanup(){
    printf("Hi from destructor\n");
}

int main(){
    printf("Hi from main\n");
    return 0;
}

//Compiled as prog
//gcc main.c -o prog
```
The result
```text
$./prog
Hi from constructor
Hi from main
Hi from destructor
``` 

**Cool, but what does ms_abi do?**

As you can see, `constructor` and `destructor` completely change when these functions are executed, even though the functions themselves look perfectly ordinary. `ms_abi` is another such attribute, but instead of changing when a function runs, it changes how the function is called.

Essentially, when attached, `ms_abi` asks the compiler to compile the function with the `Microsoft x64 calling convention (ABI)`

#### What is an ABI? What is Microsoft doing here?

First let's understand ABI. We all know what APIs are, they simply define what functionalites a system provides to the users.

For example, the web endpoints you create for your backend that are RESTful in nature and speak HTTP, is an example of an API.

The set of functions that the standard C library provides is also an API.

```c
printf();
malloc();
open();
//etc etc are examples of functionalites provided by the libc "api"
```

So we can understand ABIs in a similar way. APIs define the functionalities and ABIs define how compiled codes talk to each other.

The responsibilites of an ABI may include:

- What registers to use for the arguments of a function
- How is the stack used
- How are exeptions handled etc.

Now I have given a very little introduction to ABIs. They are so vast, explaining them in this document is out of scope.

For now, it is enough to understand that an ABI defines a binary-level standard that every compiler targeting that platform (may include the OS, the architecture or even the word size of the CPU) must follow. This allows object files, libraries, and executables produced by different compilers for the same platform to interoperate seamlessly.

---

**Coming to what ms_abi is**

As mentioned earlier, the `ms_abi` function attribute instructs the compiler to compile a specific function using the Microsoft x64 calling convention.

In other words, `efi_main()` is compiled according to the same ABI used by 64-bit Windows binaries (such as `.exe` files). At the binary level, `efi_main()` follows the Microsoft x64 calling convention, meaning it passes arguments, returns values, manages the stack, and preserves registers exactly as a Windows binary would.

> **Fun Fact:** Unix like kernels (including linux) follow the other famous ABI know as `System V ABI`.

---

#### But why this ABI for UEFI?

In the previous document we understood UEFI bootloaders (or any uefi application written by the user) are generally compiled as `PE/COFF` binaries.

This aspect also extends to how we write and compile our code. UEFI expects the entry point of its application, i.e. `efi_main()` to use the Microsoft x64 ABI.

> **Note:** Only the functions that are called directly by the UEFI firmware are required to follow the Microsoft x64 ABI. This includes the application's entry point, `efi_main()`, and any callbacks that are registered with the firmware.
>
> Your own helper functions, internal libraries, and other code are free to use the System V ABI, provided they are only called by other code that follows the same ABI. As long as every firmware-facing function uses the Microsoft x64 ABI, your application will interoperate correctly with UEFI.

---

### `efi_main(EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable)`

Finally we have reached the entry point of our UEFI program. as per conventions `efi_main` is taken as the entry point of a UEFI application.

And if we look at the arguments that are being passed to it, we have two arguments.

One is `ImageHandle` of the type `EFI_HANDLE` (defined in `efi.h`).

The other is a pointer to the type `EFI_SYSTEM_TABLE` (also defined in `efi.h`).

Let's understand what these argumets are in the first place.

#### EFI_HANDLE ImageHandle

Let's start from the first argument. The first argument a UEFI entry point function expects is this ImageHandle (could be of any name) of type `EFI_HANDLE`

This type EFI_HANDLE when we look into the definition in `efi.h` is as follows

```c
typedef void VOID
#define EFI_HANDLE VOID *
```

This handle is the representation of our own application that is created by UEFI and passed on to us.

Whenever we want to get the information about our program itself. we can pass in the ImageHandle back to UEFI services and get the demanded information.

For example, when we want to know from which storage device our own application was loaded from, we can ask the UEFI Boot services (we will come to this later) to
by passing in our ImageHandle. The logic is given in the following pseudocode.

```text
DeviceHandle = UEFI_SERVICE_GET_DEVICE(ImageHandle);
```

The actual UEFI API is different, but this pseudocode illustrates the general idea: instead of directly accessing the underlying object, we hand the handle back to the firmware and let it perform the lookup.


##### So it is essentially a `void *`. Does that mean I can't access anything through this `ImageHandle`?

In practice, yes.

Although `EFI_HANDLE` is just a `void *`, the UEFI specification intentionally does **not** define what object it points to. It is an **opaque handle**, meaning that applications are expected to treat it as an identifier and only pass it back to UEFI services.

You should never attempt to cast it to another pointer type and dereference it, since its internal representation is an implementation detail of the firmware.

This design has several advantages:

- The UEFI firmware developers (not us) are free to change the internal representation of a handle without breaking existing UEFI applications.
- It prevents applications from depending on firmware internals that are not part of the UEFI specification.
- It protects firmware-managed resources from accidental or intentional corruption by ensuring they are only accessed through well-defined UEFI interfaces.

#### `EFI_SYSTEM_TABLE *SystemTable`

Now let's see what this second argument is and what its uses are.

Unlike the first argument, which is an **opaque handle**, this argument is a pointer to an actual C structure.

This structure acts as the primary interface between our UEFI application and the firmware. It contains pointers to other structures that expose the various services and interfaces provided by UEFI.

For example, `SystemTable` can be used to access the following:

```c
// Boot Services
// Remember, in the previous section we obtained the device handle
// from our image handle. Boot Services help us perform such operations.
SystemTable->BootServices;

// Runtime Services
SystemTable->RuntimeServices;

// Console output (printing text)
SystemTable->ConOut;

// Console input (reading keyboard input)
SystemTable->ConIn;
```

Each of these members is itself a pointer to another structure containing related data and function pointers.

We'll explore each of these structures in detail as we continue building our bootloader.


With this we have gone through all the lines before our actual implementation of our `efi_main`. Now let's focus on the actual working of our hello world application.

### InitializeLib(ImageHandle, SystemTable);

This is actually a part of the `gnu-efi`. this function is declared in the `efilib.h` and it initializes the gnu-efi library.

By initializing we mean that the library initializes its helper functions and global variables.

For example, it provides the `SystemTable->BootServices` as the global variable `BS`

And this call let's us use the library specific functions like `Print()`

```c
Print(L"Hello World!");
// Notice how we are not passing the SystemTable here for console out
// This Print function of gnu-efi utilizes the initialized gloabal variables 
// to print to the console. This lets the developers (us) to be more productive
```

To explain the usefulness of Print, we can see how to use the SystemTable to print to the console which is as follows

```c
SystemTable->ConOut->OutputString(SystemTable->ConOut,L"Hello World!\r\n");
```

> **Note** if we are not using `gnu-efi`. This InializeLib() is not even required. This is just a convenient function given by the library and not a UEFI related method

### Print(L"Hello World!\n") 

This functions is a utility given by gnu-efi that lets us print to console the `printf` way. 

This a variadic function (It can take variable number of args). We can use Print like in the following example snippet
