	.section	__TEXT,__text,regular,pure_instructions
	.build_version macos, 11, 0	sdk_version 11, 3
	.globl	__Z3fooP6Mammal                 ## -- Begin function _Z3fooP6Mammal
	.p2align	4, 0x90
__Z3fooP6Mammal:                        ## @_Z3fooP6Mammal
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rdi
	callq	__ZN6Mammal6breathEv
	movq	-8(%rbp), %rax
	movq	(%rax), %rcx
	movq	%rax, %rdi
	callq	*(%rcx)
	movq	-8(%rbp), %rax
	movq	(%rax), %rcx
	movq	%rax, %rdi
	callq	*8(%rcx)
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN6Mammal6breathEv            ## -- Begin function _ZN6Mammal6breathEv
	.weak_definition	__ZN6Mammal6breathEv
	.p2align	4, 0x90
__ZN6Mammal6breathEv:                   ## @_ZN6Mammal6breathEv
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	leaq	L_.str(%rip), %rdi
	movb	$0, %al
	callq	_printf
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__literal8,8byte_literals
	.p2align	3                               ## -- Begin function main
LCPI2_0:
	.quad	0x4032000000000000              ## double 18
LCPI2_1:
	.quad	0x4054000000000000              ## double 80
LCPI2_2:
	.quad	0x4014000000000000              ## double 5
LCPI2_3:
	.quad	0x4024000000000000              ## double 10
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
	subq	$64, %rsp
	movl	$0, -4(%rbp)
	movl	$24, %edi
	callq	__Znwm
	xorl	%esi, %esi
	movq	%rax, %rcx
	movq	%rcx, %rdi
	movl	$24, %edx
	movq	%rax, -32(%rbp)                 ## 8-byte Spill
	callq	_memset
	movq	-32(%rbp), %rdi                 ## 8-byte Reload
	callq	__ZN3CatC1Ev
	movsd	LCPI2_2(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI2_3(%rip), %xmm1            ## xmm1 = mem[0],zero
	movq	-32(%rbp), %rax                 ## 8-byte Reload
	movq	%rax, -16(%rbp)
	movq	-16(%rbp), %rcx
	movsd	%xmm1, 8(%rcx)
	movq	-16(%rbp), %rcx
	movsd	%xmm0, 16(%rcx)
	movl	$24, %edi
	callq	__Znwm
	xorl	%esi, %esi
	movq	%rax, %rcx
	movq	%rcx, %rdi
	movl	$24, %edx
	movq	%rax, -40(%rbp)                 ## 8-byte Spill
	callq	_memset
	movq	-40(%rbp), %rdi                 ## 8-byte Reload
	callq	__ZN5HumanC1Ev
	movsd	LCPI2_0(%rip), %xmm0            ## xmm0 = mem[0],zero
	movsd	LCPI2_1(%rip), %xmm1            ## xmm1 = mem[0],zero
	movq	-40(%rbp), %rax                 ## 8-byte Reload
	movq	%rax, -24(%rbp)
	movq	-24(%rbp), %rcx
	movsd	%xmm1, 8(%rcx)
	movq	-24(%rbp), %rcx
	movsd	%xmm0, 16(%rcx)
	movq	-16(%rbp), %rcx
	movq	%rcx, %rdi
	callq	__Z3fooP6Mammal
	movq	-24(%rbp), %rax
	movq	%rax, %rdi
	callq	__Z3fooP6Mammal
	movq	-16(%rbp), %rax
	cmpq	$0, %rax
	movq	%rax, -48(%rbp)                 ## 8-byte Spill
	je	LBB2_2
## %bb.1:
	movq	-48(%rbp), %rax                 ## 8-byte Reload
	movq	%rax, %rdi
	callq	__ZdlPv
LBB2_2:
	movq	-24(%rbp), %rax
	cmpq	$0, %rax
	movq	%rax, -56(%rbp)                 ## 8-byte Spill
	je	LBB2_4
## %bb.3:
	movq	-56(%rbp), %rax                 ## 8-byte Reload
	movq	%rax, %rdi
	callq	__ZdlPv
LBB2_4:
	xorl	%eax, %eax
	addq	$64, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN3CatC1Ev                    ## -- Begin function _ZN3CatC1Ev
	.weak_def_can_be_hidden	__ZN3CatC1Ev
	.p2align	4, 0x90
__ZN3CatC1Ev:                           ## @_ZN3CatC1Ev
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rdi
	callq	__ZN3CatC2Ev
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN5HumanC1Ev                  ## -- Begin function _ZN5HumanC1Ev
	.weak_def_can_be_hidden	__ZN5HumanC1Ev
	.p2align	4, 0x90
__ZN5HumanC1Ev:                         ## @_ZN5HumanC1Ev
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rdi
	callq	__ZN5HumanC2Ev
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN3CatC2Ev                    ## -- Begin function _ZN3CatC2Ev
	.weak_def_can_be_hidden	__ZN3CatC2Ev
	.p2align	4, 0x90
__ZN3CatC2Ev:                           ## @_ZN3CatC2Ev
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rax
	movq	%rax, %rcx
	movq	%rcx, %rdi
	movq	%rax, -16(%rbp)                 ## 8-byte Spill
	callq	__ZN6MammalC2Ev
	movq	__ZTV3Cat@GOTPCREL(%rip), %rax
	addq	$16, %rax
	movq	-16(%rbp), %rcx                 ## 8-byte Reload
	movq	%rax, (%rcx)
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN6MammalC2Ev                 ## -- Begin function _ZN6MammalC2Ev
	.weak_def_can_be_hidden	__ZN6MammalC2Ev
	.p2align	4, 0x90
__ZN6MammalC2Ev:                        ## @_ZN6MammalC2Ev
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movq	__ZTV6Mammal@GOTPCREL(%rip), %rax
	addq	$16, %rax
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rcx
	movq	%rax, (%rcx)
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN3Cat5speakEv                ## -- Begin function _ZN3Cat5speakEv
	.weak_def_can_be_hidden	__ZN3Cat5speakEv
	.p2align	4, 0x90
__ZN3Cat5speakEv:                       ## @_ZN3Cat5speakEv
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rax
	movsd	16(%rax), %xmm0                 ## xmm0 = mem[0],zero
	leaq	L_.str.2(%rip), %rdi
	movb	$1, %al
	callq	_printf
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN6Mammal3runEv               ## -- Begin function _ZN6Mammal3runEv
	.weak_def_can_be_hidden	__ZN6Mammal3runEv
	.p2align	4, 0x90
__ZN6Mammal3runEv:                      ## @_ZN6Mammal3runEv
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	leaq	L_.str.1(%rip), %rdi
	movb	$0, %al
	callq	_printf
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN6Mammal5speakEv             ## -- Begin function _ZN6Mammal5speakEv
	.weak_def_can_be_hidden	__ZN6Mammal5speakEv
	.p2align	4, 0x90
__ZN6Mammal5speakEv:                    ## @_ZN6Mammal5speakEv
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	leaq	L_.str.1(%rip), %rdi
	movb	$0, %al
	callq	_printf
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN5HumanC2Ev                  ## -- Begin function _ZN5HumanC2Ev
	.weak_def_can_be_hidden	__ZN5HumanC2Ev
	.p2align	4, 0x90
__ZN5HumanC2Ev:                         ## @_ZN5HumanC2Ev
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rax
	movq	%rax, %rcx
	movq	%rcx, %rdi
	movq	%rax, -16(%rbp)                 ## 8-byte Spill
	callq	__ZN6MammalC2Ev
	movq	__ZTV5Human@GOTPCREL(%rip), %rax
	addq	$16, %rax
	movq	-16(%rbp), %rcx                 ## 8-byte Reload
	movq	%rax, (%rcx)
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.globl	__ZN5Human5speakEv              ## -- Begin function _ZN5Human5speakEv
	.weak_def_can_be_hidden	__ZN5Human5speakEv
	.p2align	4, 0x90
__ZN5Human5speakEv:                     ## @_ZN5Human5speakEv
	.cfi_startproc
## %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movq	%rdi, -8(%rbp)
	movq	-8(%rbp), %rax
	movsd	16(%rax), %xmm0                 ## xmm0 = mem[0],zero
	leaq	L_.str.3(%rip), %rdi
	movb	$1, %al
	callq	_printf
	addq	$16, %rsp
	popq	%rbp
	retq
	.cfi_endproc
                                        ## -- End function
	.section	__TEXT,__cstring,cstring_literals
L_.str:                                 ## @.str
	.asciz	"mammal breath~~\n"

	.section	__DATA,__const
	.globl	__ZTV3Cat                       ## @_ZTV3Cat
	.weak_def_can_be_hidden	__ZTV3Cat
	.p2align	3
__ZTV3Cat:
	.quad	0
	.quad	__ZTI3Cat
	.quad	__ZN3Cat5speakEv
	.quad	__ZN6Mammal3runEv

	.section	__TEXT,__const
	.globl	__ZTS3Cat                       ## @_ZTS3Cat
	.weak_definition	__ZTS3Cat
__ZTS3Cat:
	.asciz	"3Cat"

	.globl	__ZTS6Mammal                    ## @_ZTS6Mammal
	.weak_definition	__ZTS6Mammal
__ZTS6Mammal:
	.asciz	"6Mammal"

	.section	__DATA,__const
	.globl	__ZTI6Mammal                    ## @_ZTI6Mammal
	.weak_definition	__ZTI6Mammal
	.p2align	3
__ZTI6Mammal:
	.quad	__ZTVN10__cxxabiv117__class_type_infoE+16
	.quad	__ZTS6Mammal

	.globl	__ZTI3Cat                       ## @_ZTI3Cat
	.weak_definition	__ZTI3Cat
	.p2align	3
__ZTI3Cat:
	.quad	__ZTVN10__cxxabiv120__si_class_type_infoE+16
	.quad	__ZTS3Cat
	.quad	__ZTI6Mammal

	.globl	__ZTV6Mammal                    ## @_ZTV6Mammal
	.weak_def_can_be_hidden	__ZTV6Mammal
	.p2align	3
__ZTV6Mammal:
	.quad	0
	.quad	__ZTI6Mammal
	.quad	__ZN6Mammal5speakEv
	.quad	__ZN6Mammal3runEv

	.section	__TEXT,__cstring,cstring_literals
L_.str.1:                               ## @.str.1
	.asciz	"I'm mammal.\n"

L_.str.2:                               ## @.str.2
	.asciz	"I can jump %lf m.\n"

	.section	__DATA,__const
	.globl	__ZTV5Human                     ## @_ZTV5Human
	.weak_def_can_be_hidden	__ZTV5Human
	.p2align	3
__ZTV5Human:
	.quad	0
	.quad	__ZTI5Human
	.quad	__ZN5Human5speakEv
	.quad	__ZN6Mammal3runEv

	.section	__TEXT,__const
	.globl	__ZTS5Human                     ## @_ZTS5Human
	.weak_definition	__ZTS5Human
__ZTS5Human:
	.asciz	"5Human"

	.section	__DATA,__const
	.globl	__ZTI5Human                     ## @_ZTI5Human
	.weak_definition	__ZTI5Human
	.p2align	3
__ZTI5Human:
	.quad	__ZTVN10__cxxabiv120__si_class_type_infoE+16
	.quad	__ZTS5Human
	.quad	__ZTI6Mammal

	.section	__TEXT,__cstring,cstring_literals
L_.str.3:                               ## @.str.3
	.asciz	"I'm %lf years old.\n"

.subsections_via_symbols
