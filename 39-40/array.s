	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
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
	movq	%rdi, -8(%rbp)
	movl	%esi, -12(%rbp)
	movq	-8(%rbp), %rax
	movsd	16(%rax), %xmm0                 ## xmm0 = mem[0],zero
	movq	-8(%rbp), %rax
	addsd	24(%rax), %xmm0
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function sample_array_double
LCPI1_0:
	.quad	0x4025333333333333              ## double 10.6
LCPI1_1:
	.quad	0x4025000000000000              ## double 10.5
LCPI1_2:
	.quad	0x4014000000000000              ## double 5
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_sample_array_double
	.p2align	4, 0x90
_sample_array_double:                   ## @sample_array_double
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movl	$3, %edi
	callq	_array_create_by_length
	movsd	LCPI1_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI1_1(%rip), %xmm1            ## xmm1 = mem[0],zero
	movsd	LCPI1_2(%rip), %xmm2            ## xmm2 = mem[0],zero
	movq	%rax, -8(%rbp)
	movq	-8(%rbp), %rax
	movsd	%xmm2, 24(%rax)
	movq	-8(%rbp), %rax
	movsd	%xmm1, 32(%rax)
	movq	-8(%rbp), %rax
	movsd	%xmm0, 40(%rax)
	movq	-8(%rbp), %rax
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_sum_array_double               ## -- Begin function sum_array_double
	.p2align	4, 0x90
_sum_array_double:                      ## @sum_array_double
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movq	%rdi, -8(%rbp)
	xorps	%xmm0, %xmm0
	movsd	%xmm0, -16(%rbp)
	movl	$0, -20(%rbp)
LBB2_1:                                 ## =>This Inner Loop Header: Depth=1
	movslq	-20(%rbp), %rax
	movq	-8(%rbp), %rcx
	cmpq	16(%rcx), %rax
	jae	LBB2_4
## %bb.2:                               ##   in Loop: Header=BB2_1 Depth=1
	movq	-8(%rbp), %rax
	addq	$16, %rax
	addq	$8, %rax
	movslq	-20(%rbp), %rcx
	shlq	$3, %rcx
	addq	%rcx, %rax
	movsd	(%rax), %xmm0                   ## xmm0 = mem[0],zero
	addsd	-16(%rbp), %xmm0
	movsd	%xmm0, -16(%rbp)
## %bb.3:                               ##   in Loop: Header=BB2_1 Depth=1
	movl	-20(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -20(%rbp)
	jmp	LBB2_1
LBB2_4:
	movsd	-16(%rbp), %xmm0                ## xmm0 = mem[0],zero
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_sample_array_string            ## -- Begin function sample_array_string
	.p2align	4, 0x90
_sample_array_string:                   ## @sample_array_string
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, -8(%rbp)
	leaq	L_.str(%rip), %rdi
	callq	_string_create_by_cstr
	movq	-8(%rbp), %rcx
	movq	%rax, 24(%rcx)
	leaq	L_.str.1(%rip), %rdi
	callq	_string_create_by_cstr
	movq	-8(%rbp), %rcx
	movq	%rax, 32(%rcx)
	movq	-8(%rbp), %rax
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_concat_array_string            ## -- Begin function concat_array_string
	.p2align	4, 0x90
_concat_array_string:                   ## @concat_array_string
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$32, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rax
	cmpq	$0, 16(%rax)
	jbe	LBB4_2
## %bb.1:
	movq	-8(%rbp), %rax
	movq	24(%rax), %rax
	movq	%rax, -16(%rbp)
LBB4_2:
	movq	-8(%rbp), %rax
	movq	24(%rax), %rax
	movq	%rax, -24(%rbp)
	movq	-8(%rbp), %rax
	movq	32(%rax), %rax
	movq	%rax, -32(%rbp)
	movq	-24(%rbp), %rdi
	movq	-32(%rbp), %rsi
	callq	_string_concat
	movq	%rax, -16(%rbp)
	movq	-16(%rbp), %rax
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_sample_array_2d                ## -- Begin function sample_array_2d
	.p2align	4, 0x90
_sample_array_2d:                       ## @sample_array_2d
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, -8(%rbp)
	callq	_sample_array_double
	movq	-8(%rbp), %rcx
	movq	%rax, 24(%rcx)
	callq	_sample_array_string
	movq	-8(%rbp), %rcx
	movq	%rax, 32(%rcx)
	movq	-8(%rbp), %rax
	addq	$16, %rsp
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
	subq	$32, %rsp
	callq	_sample_array_2d
	movq	%rax, -8(%rbp)
	movq	-8(%rbp), %rax
	movq	24(%rax), %rax
	movq	%rax, -16(%rbp)
	movq	-8(%rbp), %rax
	movq	32(%rax), %rax
	movq	%rax, -24(%rbp)
	movq	-16(%rbp), %rdi
	callq	_sum_array_double
	callq	_println_d
	movq	-24(%rbp), %rdi
	callq	_concat_array_string
	movq	%rax, %rdi
	callq	_println_s
	xorl	%eax, %eax
	addq	$32, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"Hello"

L_.str.1:                               ## @.str.1
	.asciz	" PlayScript!"

.subsections_via_symbols
