    .section	__TEXT,__text,regular,pure_instructions

    .global _fibonacci
_fibonacci:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    cmpl	$1, %edi				#  cmpl	$1, var0
    jg	LBB0_3
## bb.2
    movl	%edi, %eax				#  movl	var0, returnSlot
    jmp	LBB0_4
LBB0_3:
    movl	%edi, %r10d				#  movl	var0, var1
    subl	$1, %r10d				#  subl	$1, var1
    movl	%edi, -4(%rbp)			#  spill	var0
    movl	%r10d, %edi
    callq	_fibonacci
    movl	%eax, %r11d				#  movl	returnSlot, var2
    movl	-4(%rbp), %edi			#  reload	var0
    movl	%edi, %esi				#  movl	var0, var3
    subl	$2, %esi				#  subl	$2, var3
    movl	%esi, %edi
    movl	%r11d, -8(%rbp)			#  spill	var2
    callq	_fibonacci
    movl	%eax, %edx				#  movl	returnSlot, var4
    movl	-8(%rbp), %r11d			#  reload	var2
    addl	%edx, %r11d				#  addl	var4, var2
    movl	%r11d, %eax				#  movl	var2, returnSlot
LBB0_4:
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc

    .global _main
_main:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
## bb.1
    movl	$30, %r10d				#  movl	$30, var0
LBB1_2:
    cmpl	$40, %r10d				#  cmpl	$40, var0
    jg	LBB1_4
## bb.3
    movl	%r10d, %edi
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_println
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_tick
    movl	%eax, %r11d				#  movl	returnSlot, var3
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	%r11d, %edi				#  movl	var3, var1
    movl	%edi, -8(%rbp)			#  spill	var1
    movl	%r10d, %edi
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_fibonacci
    movl	%eax, %esi				#  movl	returnSlot, var4
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	-8(%rbp), %edi			#  reload	var1
    movl	%edi, -8(%rbp)			#  spill	var1
    movl	%esi, %edi
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_println
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	-8(%rbp), %edi			#  reload	var1
    movl	%r10d, -4(%rbp)			#  spill	var0
    movl	%edi, -8(%rbp)			#  spill	var1
    callq	_tick
    movl	%eax, %edx				#  movl	returnSlot, var5
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	-8(%rbp), %edi			#  reload	var1
    movl	%edx, %ecx				#  movl	var5, var2
    movl	%ecx, %r8d				#  movl	var2, var6
    subl	%edi, %r8d				#  subl	var1, var6
    movl	%r8d, %edi
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_println
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	%r10d, %r9d				#  movl	var0, var7
    movl	%r10d, %eax				#  movl	var0, var8
    addl	$1, %r9d				#  addl	$1, var7
    movl	%r9d, %r10d				#  movl	var7, var0
    jmp	LBB1_2
LBB1_4:
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc
