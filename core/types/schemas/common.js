/**
 * Common schemas for pagination, filtering, sorting
 */

export const paginationSchema = $schema({
    page: $number().min(1).default(1),
    limit: $number().min(1).max(100).default(20),
    offset: $number().min(0).optional(),
    total: $number().min(0).optional(),
})

export const filterSchema = $schema({
    search: $string().optional(),
    status: $enum('active', 'inactive', 'pending', 'all').optional(),
    dateFrom: $string().optional(),
    dateTo: $string().optional(),
})

export const sortSchema = $schema({
    sortBy: $string().optional(),
    sortOrder: $enum('asc', 'desc').optional(),
})

export const codegenProjectSchema = $schema({
    projectName: $string().min(3).max(50).pattern(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones').required('Nombre del proyecto es requerido'),
    description: $string().max(500).optional(),
    language: $enum('javascript', 'typescript', 'python', 'rust', 'go', 'java').required('Lenguaje es requerido'),
    framework: $string().optional(),
    database: $enum('postgresql', 'mysql', 'sqlite', 'mongodb', 'none').optional(),
    features: $array($string()).optional(),
    authRequired: $boolean().default(true),
})
