---
slug: interesting-gcc-flags
title: Interesting GCC Flags
tags: [gcc, compiler]
---


# Interesting GCC flags

In this article, I'll go over some useful GCC (GNU C Compiler) flags that I frequently use, along with what they do and when they're useful.

---

## Optimisation Flag `-O`

This is a well known flag that lets the compiler know what level of optimizations it may perform during the compilation of our code.

GCC supports the following optimization levels:

| Optimization flag | Description |
| ----------------- | ----------- |
| `-O0` | Default optimization level of the compiler. |
| `-O1` | Simple optimizations such as constant folding, constant propagation, dead code elimination, and more. |
| `-O2` | Includes all optimizations from `-O1` along with better register allocation and instruction scheduling. Commonly used for production software. |
| `-O3` | Includes all optimizations from `-O2` along with more aggressive loop optimizations and possible SIMD vectorization. |
| `-Ofast` | Includes all optimizations from `-O3` and enables optimizations that may change program behavior (for example, floating-point math). |

Each of these optimization levels deserves its own blog post, but for now it's enough to know when to use each one. If you simply want to tell GCC that it may optimize your code, these are the flags you'll use.

> **Note**
>
> Using `-O3` doesn't necessarily mean your program will run faster than the same program compiled with `-O2`.
>
> The additional optimizations performed by `-O3` can increase the size of the generated binary, which may negatively affect instruction cache performance.
>
> In many real-world applications, `-O2` provides a better balance between execution speed and code size.

`-O2` provides a nice balance between performance and code size, and you may use it in your builds.

:::tip Fun fact

LeetCode compiles C submissions using `-O2`, so your solutions already benefit from GCC's production-grade optimizations.

```

---

## Compile only flag `-c`

The `-c` flag tells GCC to compile the source file into an object file (`.o`) without invoking the linker.

By default, if this flag is not specified, GCC will compile the source code, assemble it into an object file, and then invoke the linker to combine it with the required startup files and libraries to produce an executable.

#### Example

```bash
gcc -c main.c -o main.o
```

Output:

```text
main.o
```

---

## Include Directory flag `-I`

This is also a well known flag. It asks the compiler to also look for header files in the directory specified.

#### Example

```bash
gcc app.c -I/home/user/project/include -o app
```

The above command asks the compiler to look for header files in the path `/home/user/project/include`.


If you are using this flag, the header files in the path can be directly used with

```c
#include <myheader.h>
```

instead of the standard

```c
#include "myheader.h"
```

#### But bro, why do I need to use it?

This is particularly useful when your project grows and you need to keep all your header files in a dedicated `include/` directory. This flag enables you to structure your code in an elegant way.

---

## Include libraries path flag `-L`

This is a fairly straightforward one. It lets us specify additional directories in which GCC should search for libraries during linking.

You can think of it as adding another shelf to a library. When GCC needs to find a library, it will also search this shelf.

#### Example

```bash
gcc app.c -I/home/user/project/include -L/home/user/project/lib -lmylib -o app
```

In the above example, we try to compile `app.c` with the library named `libmylib.so` (the naming convention lets us omit the `lib` prefix and the extension) present in the path `/home/user/project/lib`.

> This linking is an interesting concept on its own. The aspect of static and dynamic linking is so interesting that it deserves its own blog post.

---

## Link this library flag `-l`

We have already seen how this flag is used in the above example.

GCC follows a naming convention when using this flag: omit the `lib` prefix and the library extension.

This flag tells GCC **which** library to link against. GCC searches for that library in its default library directories as well as any directories specified using `-L`.

**Naming convention**

```text
Library file : libmylib.so
               ^^^      ^^^
              omit     omit

GCC flag     : -lmylib
                ^^^^^
```


