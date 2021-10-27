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
	leaq	L_.str(%rip), %rdi
	popq	%rbp
	jmp	_println_cs                     ## TAILCALL
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function main
LCPI1_0:
	.quad	0x4025000000000000              ## double 10.5
	.section	__TEXT,__text,regular,pure_instructions
	.globl	_main
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
	leaq	L_.str(%rip), %rdi
	callq	_println_cs
	leaq	L_.str.1(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, %rbx
	leaq	L_.str.2(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rbx, %rdi
	movq	%rax, %rsi
	callq	_string_concat
	movq	%rax, %rdi
	callq	_println_s
	movsd	LCPI1_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	callq	_double_to_string
	movq	%rax, %rdi
	callq	_println_s
	xorl	%eax, %eax
	addq	$8, %rsp
	popq	%rbx
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"Hello PlayScript!"

L_.str.1:                               ## @.str.1
	.asciz	"Hello "

L_.str.2:                               ## @.str.2
	.asciz	"PlayScript!"

.subsections_via_symbols
