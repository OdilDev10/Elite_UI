/**
 * User-related schemas
 */

export const userSchema = $schema({
    id: $string().optional(),
    name: $string().min(2).max(100).required('Nombre es requerido'),
    email: $string().email().required('Email es requerido'),
    password: $string().min(8).pattern(/[A-Z]/, 'Debe tener mayúscula').required('Contraseña es requerida'),
    confirmPassword: $string().required('Confirmar contraseña es requerido'),
    role: $enum('admin', 'user', 'guest').optional(),
    isActive: $boolean().default(true),
    phone: $string().pattern(/^\+?[1-9]\d{1,14}$/, 'Teléfono inválido').optional(),
    avatar: $string().url().optional(),
    createdAt: $string().optional(),
    updatedAt: $string().optional(),
})

export const loginSchema = $schema({
    email: $string().email().required('Email es requerido'),
    password: $string().required('Contraseña es requerida'),
    rememberMe: $boolean().default(false),
})

export const registerSchema = $schema({
    name: $string().min(2).max(100).required('Nombre es requerido'),
    email: $string().email().required('Email es requerido'),
    password: $string().min(8).pattern(/[A-Z]/, 'Debe tener mayúscula').required('Contraseña es requerida'),
    confirmPassword: $string().required('Confirmar contraseña es requerido'),
    termsAccepted: $boolean().required('Debes aceptar los términos'),
})
