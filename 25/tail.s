	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.globl	_foo                            ## -- Begin function foo
	.p2align	4, 0x90
_foo:                                   ## @foo
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	pushq	%r15
	pushq	%r14
	pushq	%r13
	pushq	%r12
	pushq	%rbx
	pushq	%rax
	.cfi_offset %rbx, -56
	.cfi_offset %r12, -48
	.cfi_offset %r13, -40
	.cfi_offset %r14, -32
	.cfi_offset %r15, -24
	movl	%r9d, %r13d
	movl	%r8d, -44(%rbp)                 ## 4-byte Spill
	movl	%ecx, %r14d
	movl	%edx, %r15d
	movl	%esi, %r12d
	movl	%edi, %ebx
	movl	16(%rbp), %edi
	movl	24(%rbp), %esi
	callq	_bar
	cmpl	$3, %ebx
	jl	LBB0_2
## %bb.1:
	incl	%ebx
	movl	%ebx, %eax
	addq	$8, %rsp
	popq	%rbx
	popq	%r12
	popq	%r13
	popq	%r14
	popq	%r15
	popq	%rbp
	retq
LBB0_2:
	imull	%r15d, %r14d
	imull	%ebx, %r12d
	addl	%r14d, %r12d
	imull	-44(%rbp), %r13d                ## 4-byte Folded Reload
	addl	%r12d, %r13d
	addl	%eax, %r13d
	movl	%r14d, %edi
	movl	%r13d, %esi
	addq	$8, %rsp
	popq	%rbx
	popq	%r12
	popq	%r13
	popq	%r14
	popq	%r15
	popq	%rbp
	jmp	_bar                            ## TAILCALL
	.cfi_endproc
                                        ## -- End function
	.globl	_foo2                           ## -- Begin function foo2
	.p2align	4, 0x90
_foo2:                                  ## @foo2
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	imull	%esi, %edi
	imull	%ecx, %edx
	movl	%edx, %esi
	movl	$3, %edx
	movl	$4, %ecx
	movl	$5, %r8d
	movl	$6, %r9d
	pushq	$8
	pushq	$7
	callq	_bar2
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	_foo3                           ## -- Begin function foo3
	.p2align	4, 0x90
_foo3:                                  ## @foo3
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	pushq	%r15
	pushq	%r14
	pushq	%r13
	pushq	%r12
	pushq	%rbx
	pushq	%rax
	.cfi_offset %rbx, -56
	.cfi_offset %r12, -48
	.cfi_offset %r13, -40
	.cfi_offset %r14, -32
	.cfi_offset %r15, -24
	movl	%r9d, %r13d
	movl	%r8d, -44(%rbp)                 ## 4-byte Spill
	movl	%ecx, %r14d
	movl	%edx, %r15d
	movl	%esi, %r12d
	movl	%edi, %ebx
	movl	16(%rbp), %edi
	movl	24(%rbp), %esi
	callq	_bar
	cmpl	$3, %ebx
	jl	LBB2_2
## %bb.1:
	incl	%ebx
	movl	%ebx, %eax
	addq	$8, %rsp
	popq	%rbx
	popq	%r12
	popq	%r13
	popq	%r14
	popq	%r15
	popq	%rbp
	retq
LBB2_2:
	imull	%r15d, %r14d
	imull	%ebx, %r12d
	addl	%r14d, %r12d
	imull	-44(%rbp), %r13d                ## 4-byte Folded Reload
	addl	%r12d, %r13d
	addl	%eax, %r13d
	movl	%r14d, %edi
	movl	%r13d, %esi
	addq	$8, %rsp
	popq	%rbx
	popq	%r12
	popq	%r13
	popq	%r14
	popq	%r15
	popq	%rbp
	jmp	_bar                            ## TAILCALL
	.cfi_endproc
                                        ## -- End function
.subsections_via_symbols
