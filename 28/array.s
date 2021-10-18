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
	movsd	16(%rdi), %xmm0                 ## xmm0 = mem[0],zero
	addsd	24(%rdi), %xmm0
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_sample_array_double            ## -- Begin function sample_array_double
	.p2align	4, 0x90
_sample_array_double:                   ## @sample_array_double
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movl	$3, %edi
	callq	_array_create_by_length
	movabsq	$4617315517961601024, %rcx      ## imm = 0x4014000000000000
	movq	%rcx, 576(%rax)
	movabsq	$4622100592565682176, %rcx      ## imm = 0x4025000000000000
	movq	%rcx, 768(%rax)
	movabsq	$4622156887561024307, %rcx      ## imm = 0x4025333333333333
	movq	%rcx, 960(%rax)
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
	movq	16(%rdi), %rcx
	testq	%rcx, %rcx
	je	LBB2_1
## %bb.2:
	leaq	-1(%rcx), %rdx
	movl	%ecx, %eax
	andl	$3, %eax
	cmpq	$3, %rdx
	jae	LBB2_8
## %bb.3:
	xorpd	%xmm0, %xmm0
	xorl	%edx, %edx
	jmp	LBB2_4
LBB2_1:
	xorps	%xmm0, %xmm0
	popq	%rbp
	retq
LBB2_8:
	andq	$-4, %rcx
	leaq	1152(%rdi), %rsi
	xorpd	%xmm0, %xmm0
	xorl	%edx, %edx
	.p2align	4, 0x90
LBB2_9:                                 ## =>This Inner Loop Header: Depth=1
	addsd	-576(%rsi), %xmm0
	addsd	-384(%rsi), %xmm0
	addsd	-192(%rsi), %xmm0
	addsd	(%rsi), %xmm0
	addq	$4, %rdx
	addq	$768, %rsi                      ## imm = 0x300
	cmpq	%rdx, %rcx
	jne	LBB2_9
LBB2_4:
	testq	%rax, %rax
	je	LBB2_7
## %bb.5:
	leaq	(%rdx,%rdx,2), %rcx
	shlq	$6, %rcx
	leaq	576(%rcx,%rdi), %rcx
	.p2align	4, 0x90
LBB2_6:                                 ## =>This Inner Loop Header: Depth=1
	addsd	(%rcx), %xmm0
	addq	$192, %rcx
	decq	%rax
	jne	LBB2_6
LBB2_7:
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
	pushq	%rbx
	pushq	%rax
	.cfi_offset %rbx, -24
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, %rbx
	leaq	L_.str(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 576(%rbx)
	leaq	L_.str.1(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 768(%rbx)
	movq	%rbx, %rax
	addq	$8, %rsp
	popq	%rbx
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
	pushq	%r15
	pushq	%r14
	pushq	%rbx
	pushq	%rax
	.cfi_offset %rbx, -40
	.cfi_offset %r14, -32
	.cfi_offset %r15, -24
	movq	16(%rdi), %rcx
	testq	%rcx, %rcx
	je	LBB4_1
## %bb.2:
	movq	%rdi, %r14
	movq	576(%rdi), %rax
	cmpq	$1, %rcx
	je	LBB4_5
## %bb.3:
	leaq	768(%r14), %r15
	movl	$1, %ebx
	.p2align	4, 0x90
LBB4_4:                                 ## =>This Inner Loop Header: Depth=1
	movq	(%r15), %rsi
	movq	%rax, %rdi
	callq	_string_concat
	incq	%rbx
	addq	$192, %r15
	cmpq	%rbx, 16(%r14)
	ja	LBB4_4
	jmp	LBB4_5
LBB4_1:
                                        ## implicit-def: $rax
LBB4_5:
	addq	$8, %rsp
	popq	%rbx
	popq	%r14
	popq	%r15
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
	pushq	%r14
	pushq	%rbx
	.cfi_offset %rbx, -32
	.cfi_offset %r14, -24
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, %r14
	movl	$3, %edi
	callq	_array_create_by_length
	movabsq	$4617315517961601024, %rcx      ## imm = 0x4014000000000000
	movq	%rcx, 576(%rax)
	movabsq	$4622100592565682176, %rcx      ## imm = 0x4025000000000000
	movq	%rcx, 768(%rax)
	movabsq	$4622156887561024307, %rcx      ## imm = 0x4025333333333333
	movq	%rcx, 960(%rax)
	movq	%rax, 576(%r14)
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, %rbx
	leaq	L_.str(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 576(%rbx)
	leaq	L_.str.1(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 768(%rbx)
	movq	%rbx, 768(%r14)
	movq	%r14, %rax
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
	pushq	%r15
	pushq	%r14
	pushq	%rbx
	pushq	%rax
	.cfi_offset %rbx, -40
	.cfi_offset %r14, -32
	.cfi_offset %r15, -24
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, %r14
	movl	$3, %edi
	callq	_array_create_by_length
	movabsq	$4617315517961601024, %rcx      ## imm = 0x4014000000000000
	movq	%rcx, 576(%rax)
	movabsq	$4622100592565682176, %rcx      ## imm = 0x4025000000000000
	movq	%rcx, 768(%rax)
	movabsq	$4622156887561024307, %rcx      ## imm = 0x4025333333333333
	movq	%rcx, 960(%rax)
	movq	%rax, 576(%r14)
	movl	$2, %edi
	callq	_array_create_by_length
	movq	%rax, %r15
	leaq	L_.str(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 576(%r15)
	leaq	L_.str.1(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 768(%r15)
	movq	%r15, 768(%r14)
	movq	576(%r14), %rcx
	movq	16(%rcx), %rdx
	testq	%rdx, %rdx
	je	LBB6_1
## %bb.2:
	leaq	-1(%rdx), %rsi
	movl	%edx, %eax
	andl	$3, %eax
	cmpq	$3, %rsi
	jae	LBB6_4
## %bb.3:
	xorpd	%xmm0, %xmm0
	xorl	%esi, %esi
	jmp	LBB6_6
LBB6_1:
	xorpd	%xmm0, %xmm0
	jmp	LBB6_9
LBB6_4:
	andq	$-4, %rdx
	leaq	1152(%rcx), %rdi
	xorpd	%xmm0, %xmm0
	xorl	%esi, %esi
	.p2align	4, 0x90
LBB6_5:                                 ## =>This Inner Loop Header: Depth=1
	addsd	-576(%rdi), %xmm0
	addsd	-384(%rdi), %xmm0
	addsd	-192(%rdi), %xmm0
	addsd	(%rdi), %xmm0
	addq	$4, %rsi
	addq	$768, %rdi                      ## imm = 0x300
	cmpq	%rsi, %rdx
	jne	LBB6_5
LBB6_6:
	testq	%rax, %rax
	je	LBB6_9
## %bb.7:
	leaq	(%rsi,%rsi,2), %rdx
	shlq	$6, %rdx
	leaq	576(%rdx,%rcx), %rcx
	.p2align	4, 0x90
LBB6_8:                                 ## =>This Inner Loop Header: Depth=1
	addsd	(%rcx), %xmm0
	addq	$192, %rcx
	decq	%rax
	jne	LBB6_8
LBB6_9:
	callq	_println_d
	movq	16(%r15), %rcx
	testq	%rcx, %rcx
	je	LBB6_10
## %bb.11:
	movq	576(%r15), %rax
	cmpq	$1, %rcx
	je	LBB6_14
## %bb.12:
	movq	%r15, %r14
	addq	$768, %r14                      ## imm = 0x300
	movl	$1, %ebx
	.p2align	4, 0x90
LBB6_13:                                ## =>This Inner Loop Header: Depth=1
	movq	(%r14), %rsi
	movq	%rax, %rdi
	callq	_string_concat
	incq	%rbx
	addq	$192, %r14
	cmpq	%rbx, 16(%r15)
	ja	LBB6_13
	jmp	LBB6_14
LBB6_10:
                                        ## implicit-def: $rax
LBB6_14:
	movq	%rax, %rdi
	callq	_println_s
	xorl	%eax, %eax
	addq	$8, %rsp
	popq	%rbx
	popq	%r14
	popq	%r15
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
