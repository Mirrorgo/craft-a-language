    .section	__TEXT,__text,regular,pure_instructions

    .global _fibonacci
_fibonacci:
    .cfi_startproc
## bb.0
    pushq	%rbp
    movq	%rsp, %rbp
    subq	$16, %rsp
    cmpl	$1, %edi				#  cmpl	$1, var0
    jg	LBB0_2
## bb.1
    movl	%edi, %eax				#  movl	var0, returnSlot
    jmp	LBB0_3
LBB0_2:
    movl	%edi, %r10d				#  movl	var0, var1
#    subl	$1, %r10d				#  subl	$1, var1
    movl	%edi, -4(%rbp)			#  spill	var0
#    movl	%r10d, %edi
    leal    -1(%r10d), %edi
    callq	_fibonacci
    movl	%eax, %r10d				#  movl	returnSlot, var2
    movl	-4(%rbp), %edi			#  reload	var0
    movl	%edi, %r11d				#  movl	var0, var3
#   subl	$2, %r11d				#  subl	$2, var3
#   movl	%r11d, %edi
    leal    -2(%r11d), %edi
    movl	%r10d, -8(%rbp)			#  spill	var2
    callq	_fibonacci
    movl	%eax, %edi				#  movl	returnSlot, var4
    movl	-8(%rbp), %r10d			#  reload	var2
    addl	%edi, %r10d				#  addl	var4, var2
    movl	%r10d, %eax				#  movl	var2, returnSlot
LBB0_3:
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
    movl	$30, %r10d				#  movl	$30, var0
LBB1_1:
    cmpl	$40, %r10d				#  cmpl	$40, var0
    jg	LBB1_3
## bb.2
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
    movl	%eax, %r11d				#  movl	returnSlot, var4
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	-8(%rbp), %edi			#  reload	var1
    movl	%edi, -8(%rbp)			#  spill	var1
    movl	%r11d, %edi
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_println
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	-8(%rbp), %edi			#  reload	var1
    movl	%r10d, -4(%rbp)			#  spill	var0
    movl	%edi, -8(%rbp)			#  spill	var1
    callq	_tick
    movl	%eax, %r11d				#  movl	returnSlot, var5
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	-8(%rbp), %edi			#  reload	var1
    movl	%r11d, %esi				#  movl	var5, var2
    movl	%esi, %r11d				#  movl	var2, var6
    subl	%edi, %r11d				#  subl	var1, var6
    movl	%r11d, %edi
    movl	%r10d, -4(%rbp)			#  spill	var0
    callq	_println
    movl	-4(%rbp), %r10d			#  reload	var0
    movl	%r10d, %edi				#  movl	var0, var7
    movl	%r10d, %esi				#  movl	var0, var8
    addl	$1, %edi				#  addl	$1, var7
    movl	%edi, %r10d				#  movl	var7, var0
    jmp	LBB1_1
LBB1_3:
    addq	$16, %rsp
    popq	%rbp
    retq
    .cfi_endproc
