	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.globl	_reduce                         ## -- Begin function reduce
	.p2align	4, 0x90
_reduce:                                ## @reduce
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$32, %rsp
	movq	%rdi, -8(%rbp)
	movl	%esi, -12(%rbp)
	movq	%rdx, -24(%rbp)
	movl	$0, -28(%rbp)
	movl	$0, -32(%rbp)
LBB0_1:                                 ## =>This Inner Loop Header: Depth=1
	movl	-32(%rbp), %eax
	cmpl	-12(%rbp), %eax
	jge	LBB0_4
## %bb.2:                               ##   in Loop: Header=BB0_1 Depth=1
	movq	-24(%rbp), %rax
	cvtsi2sdl	-28(%rbp), %xmm0
	movq	-8(%rbp), %rcx
	movslq	-32(%rbp), %rdx
	movsd	(%rcx,%rdx,8), %xmm1            ## xmm1 = mem[0],zero
	callq	*%rax
	cvttsd2si	%xmm0, %esi
	movl	%esi, -28(%rbp)
## %bb.3:                               ##   in Loop: Header=BB0_1 Depth=1
	movl	-32(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -32(%rbp)
	jmp	LBB0_1
LBB0_4:
	cvtsi2sdl	-28(%rbp), %xmm0
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_max                            ## -- Begin function max
	.p2align	4, 0x90
_max:                                   ## @max
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movsd	%xmm0, -16(%rbp)
	movsd	%xmm1, -24(%rbp)
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	ucomisd	-24(%rbp), %xmm0
	jb	LBB1_2
## %bb.1:
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	movsd	%xmm0, -8(%rbp)
	jmp	LBB1_3
LBB1_2:
	movsd	-24(%rbp), %xmm0                ## xmm0 = mem[0],zero
	movsd	%xmm0, -8(%rbp)
LBB1_3:
	movsd	-8(%rbp), %xmm0                 ## xmm0 = mem[0],zero
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_sum                            ## -- Begin function sum
	.p2align	4, 0x90
_sum:                                   ## @sum
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movsd	%xmm0, -8(%rbp)
	movsd	%xmm1, -16(%rbp)
	movsd	-8(%rbp), %xmm0                 ## xmm0 = mem[0],zero
	addsd	-16(%rbp), %xmm0
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
	subq	$96, %rsp
	leaq	-80(%rbp), %rax
	leaq	l___const.main.numbers(%rip), %rcx
	movq	___stack_chk_guard@GOTPCREL(%rip), %rdx
	movq	(%rdx), %rdx
	movq	%rdx, -8(%rbp)
	movq	%rax, %rdx
	movq	%rdx, %rdi
	movq	%rcx, %rsi
	movl	$64, %edx
	movq	%rax, -88(%rbp)                 ## 8-byte Spill
	callq	_memcpy
	movq	-88(%rbp), %rdi                 ## 8-byte Reload
	movl	$8, %esi
	leaq	_sum(%rip), %rdx
	callq	_reduce
	leaq	L_.str(%rip), %rdi
	movb	$1, %al
	callq	_printf
	leaq	-80(%rbp), %rdi
	movl	$8, %esi
	leaq	_max(%rip), %rdx
	movl	%eax, -92(%rbp)                 ## 4-byte Spill
	callq	_reduce
	leaq	L_.str(%rip), %rdi
	movb	$1, %al
	callq	_printf
	movq	___stack_chk_guard@GOTPCREL(%rip), %rcx
	movq	(%rcx), %rcx
	movq	-8(%rbp), %rdx
	cmpq	%rdx, %rcx
	jne	LBB3_2
## %bb.1:
	xorl	%eax, %eax
	addq	$96, %rsp
	popq	%rbp
	retq
LBB3_2:
	callq	___stack_chk_fail
	ud2
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__const
	.p2align	4                               ## @__const.main.numbers
l___const.main.numbers:
	.quad	0x4000000000000000              ## double 2
	.quad	0x4008000000000000              ## double 3
	.quad	0x4010000000000000              ## double 4
	.quad	0x4014000000000000              ## double 5
	.quad	0x401c000000000000              ## double 7
	.quad	0x4010000000000000              ## double 4
	.quad	0x4014000000000000              ## double 5
	.quad	0x4000000000000000              ## double 2

	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"%lf\n"

.subsections_via_symbols
