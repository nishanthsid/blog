# Interesting GCC flags

In this article, I'll go over some useful GCC (GNU C Compiler) flags that I frequently use, along with what they do and when they're useful. 

### Optimisation Flag -O

This is a well know flag that lets compiler know what level of optimizations it may perform in the compilation of our code. These are the following flags it supports


| Optimization flag | Description                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `-O0`             | Default optimization level of the compiler.                                                                                                    |
| `-O1`             | Simple optimizations such as constant folding, constant propagation, dead code elimination, and more.                                          |
| `-O2`             | Includes all optimizations from `-O1` along with better register allocation and instruction scheduling. Commonly used for production software. |
| `-O3`             | Includes all optimizations from `-O2` along with more aggressive loop optimizations and possible SIMD vectorization.                           |
| `-Ofast`          | Includes all optimizations from `-O3` and enables optimizations that may change program behavior (for example, floating-point math).           |


The flags themselves need a seperate pages of blog to get a deeper understanding. But if you want to let your compiler know it can do 
some optimizations from its side. Now you know how.

**Note:** Using `-O3` doesn't necessarily mean your program will run faster than the same program compiled with `-O2`. The additional optimizations performed by `-O3` can increase the size of the generated binary, which may negatively affect instruction cache performance. In many real-world applications, `-O2` provides a better balance between execution speed and code size.

**O2** provides a nice balance with performance and code size and you may use it in your builds

> **Fun fact:** LeetCode compiles C submissions using `-O2`, so your solutions already benefit from GCC's production-grade optimizations.

### Compile only flag -c

The -c flag tells GCC to compile the source file into an object file (.o) without invoking the linker. By default, if this flag is not specified, GCC will compile the source code, assemble it into an object file, and then invoke the linker to combine it with the required startup files and libraries to produce an executable.

Example:

```bash
gcc -c main.c -o main.o
```

Output:

```text
main.o
```
