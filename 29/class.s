	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
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
	movl	$2, %edi
	callq	_object_create_by_length
	movq	%rax, %rbx
	leaq	L_.str(%rip), %rdi
	callq	_string_create_by_cstr
	movq	%rax, 16(%rbx)
	movabsq	$4621819117588971520, %rcx      ## imm = 0x4024000000000000
	movq	%rcx, 24(%rbx)
	movq	%rax, %rdi
	callq	_println_s
	movsd	24(%rbx), %xmm0                 ## xmm0 = mem[0],zero
	callq	_println_d
	xorl	%eax, %eax
	addq	$8, %rsp
	popq	%rbx
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"white"

.subsections_via_symbols
