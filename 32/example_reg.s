    .section	__TEXT,__text,regular,pure_instructions

    .global _foo
_foo:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    movl	%edi, %r10d				#  movl	var0, var6
    movl	%esi, %edi				#  movl	var1, var7
    movl	%edx, %esi				#  movl	var2, var8
    movl	%ecx, %edx				#  movl	var3, var9
    movl	%r8d, %ecx				#  movl	var4, var10
    movl	%r9d, %r8d				#  movl	var5, var13
    addl	%r10d, %r8d				#  addl	var6, var13
    addl	%edi, %r8d				#  addl	var7, var13
    addl	%esi, %r8d				#  addl	var8, var13
    addl	%edx, %r8d				#  addl	var9, var13
    addl	%ecx, %r8d				#  addl	var10, var13
    movl	%r8d, %r9d				#  movl	var13, var11
    movl	%r9d, %r10d				#  movl	var11, var12
    movl	%r10d, %eax				#  movl	var12, returnSlot
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    popq	%rbp
    retq
    .cfi_endproc
