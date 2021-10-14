	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.globl	_fibonacci                      ## -- Begin function fibonacci
	.p2align	4, 0x90
_fibonacci:                             ## @fibonacci
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	pushq	%r14
	pushq	%rbx
	.cfi_offset %rbx, -32
	.cfi_offset %r14, -24
	movl	%edi, %ebx
	xorl	%r14d, %r14d
	cmpl	$2, %edi
	jge	LBB0_2
## %bb.1:
	movl	%ebx, %ecx
	jmp	LBB0_4
LBB0_2:
	xorl	%r14d, %r14d
	.p2align	4, 0x90
LBB0_3:                                 ## =>This Inner Loop Header: Depth=1
	leal	-1(%rbx), %edi
	callq	_fibonacci
	leal	-2(%rbx), %ecx
	addl	%eax, %r14d
	cmpl	$3, %ebx
	movl	%ecx, %ebx
	jg	LBB0_3
LBB0_4:
	addl	%ecx, %r14d
	movl	%r14d, %eax
	popq	%rbx
	popq	%r14
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_main                           ## -- Begin function main
	.p2align	4, 0x90
_main:                                  ## @main
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	pushq	%rbx
	pushq	%rax
	.cfi_offset %rbx, -24
	movl	$30, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$30, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$31, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$31, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$32, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$32, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$33, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$33, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$34, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$34, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$35, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$35, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$36, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$36, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$37, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$37, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$38, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$38, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$39, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$39, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	movl	$40, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	movl	%eax, %ebx
	movl	$40, %edi
	callq	_fibonacci
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	callq	_tick
	subl	%ebx, %eax
	movl	%eax, %edi
	callq	_println
	xorl	%eax, %eax
	addq	$8, %rsp
	popq	%rbx
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
